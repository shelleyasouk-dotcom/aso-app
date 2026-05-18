// Supabase Edge Function — stripe-webhook
// Deploy: supabase functions deploy stripe-webhook
// Secrets: supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
// In Stripe dashboard: add webhook endpoint → <your-supabase-url>/functions/v1/stripe-webhook
// Events to listen for: checkout.session.completed, checkout.session.expired

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
    const { parent_id, club_term_id, parent_child_id, school_id } = session.metadata ?? {}

    // Confirm the booking
    await supabase
      .from('parent_bookings')
      .update({
        status: 'confirmed',
        stripe_payment_intent: session.payment_intent as string,
      })
      .eq('stripe_session_id', session.id)

    // Fetch the term to get the date range
    const { data: term } = await supabase
      .from('club_terms')
      .select('start_date, end_date')
      .eq('id', club_term_id)
      .single()

    // Fetch child info from parent_children
    const { data: portalChild } = await supabase
      .from('parent_children')
      .select('full_name, year_group, additional_needs')
      .eq('id', parent_child_id)
      .single()

    if (term && portalChild && school_id) {
      // Find or create a matching child in the main children table
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

      // Add child to all session registers in this term's date range
      if (childId) {
        const { data: registers } = await supabase
          .from('session_registers')
          .select('id')
          .eq('school_id', school_id)
          .gte('session_date', term.start_date)
          .lte('session_date', term.end_date)

        if (registers && registers.length > 0) {
          const entries = registers.map(r => ({
            register_id: r.id,
            child_id: childId!,
            present: false,
          }))
          // Insert, ignoring conflicts if already in register
          await supabase.from('register_entries').upsert(entries, {
            onConflict: 'register_id,child_id',
            ignoreDuplicates: true,
          })
        }
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
