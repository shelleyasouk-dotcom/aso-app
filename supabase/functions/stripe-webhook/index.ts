// Supabase Edge Function — stripe-webhook
// Deploy: supabase functions deploy stripe-webhook

import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { parent_id, bookings: bookingsMeta } = session.metadata ?? {}

    // Confirm ALL bookings linked to this Stripe session
    await supabase
      .from('parent_bookings')
      .update({
        status: 'confirmed',
        stripe_payment_intent: session.payment_intent as string,
      })
      .eq('stripe_session_id', session.id)

    // Parse the bookings array from metadata
    let bookings: Array<{ club_term_id: string; parent_child_id: string; school_id: string }> = []
    try {
      bookings = bookingsMeta ? JSON.parse(bookingsMeta) : []
    } catch {
      // Legacy single-booking format fallback
      const { club_term_id, parent_child_id, school_id } = session.metadata ?? {}
      if (club_term_id) bookings = [{ club_term_id, parent_child_id: parent_child_id ?? '', school_id: school_id ?? '' }]
    }

    // Enrol each child into their school's session registers
    for (const booking of bookings) {
      const { club_term_id, parent_child_id, school_id } = booking
      if (!club_term_id || !school_id) continue

      const { data: term } = await supabase
        .from('club_terms')
        .select('start_date, end_date')
        .eq('id', club_term_id)
        .single()

      const { data: portalChild } = await supabase
        .from('parent_children')
        .select('full_name, year_group, additional_needs')
        .eq('id', parent_child_id)
        .single()

      if (!term || !portalChild) continue

      // Find or create child in the main children table
      let childId: string | null = null
      const { data: existing } = await supabase
        .from('children')
        .select('id')
        .eq('school_id', school_id)
        .ilike('full_name', portalChild.full_name)
        .eq('is_active', true)
        .maybeSingle()

      if (existing) {
        childId = existing.id
      } else {
        const { data: created } = await supabase
          .from('children')
          .insert({
            school_id,
            full_name: portalChild.full_name,
            year_group: portalChild.year_group ?? null,
            additional_needs: portalChild.additional_needs ?? null,
            is_active: true,
          })
          .select('id')
          .single()
        childId = created?.id ?? null
      }

      if (!childId) continue

      // Add to all session registers in the term date range
      const { data: registers } = await supabase
        .from('session_registers')
        .select('id')
        .eq('school_id', school_id)
        .gte('session_date', term.start_date)
        .lte('session_date', term.end_date)

      if (registers && registers.length > 0) {
        await supabase.from('register_entries').upsert(
          registers.map(r => ({ register_id: r.id, child_id: childId!, present: false })),
          { onConflict: 'register_id,child_id', ignoreDuplicates: true },
        )
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    await supabase
      .from('parent_bookings')
      .update({ status: 'cancelled' })
      .eq('stripe_session_id', session.id)
      .eq('status', 'pending_payment')
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
