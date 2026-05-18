// Supabase Edge Function — create-checkout-session
// Deploy: supabase functions deploy create-checkout-session
// Secrets: supabase secrets set STRIPE_SECRET_KEY=sk_live_...

import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Unauthorized')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Verify the requesting user
    const { data: { user }, error: userErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (userErr || !user) throw new Error('Unauthorized')

    const { club_term_id, child } = await req.json() as {
      club_term_id: string
      child: { full_name: string; year_group?: string; class_name?: string; additional_needs?: string }
    }

    // Fetch the term + school
    const { data: term, error: termErr } = await supabase
      .from('club_terms')
      .select('*, school:schools(id,name)')
      .eq('id', club_term_id)
      .eq('is_active', true)
      .single()
    if (termErr || !term) throw new Error('Term not found or inactive')

    // Check capacity
    const { count } = await supabase
      .from('parent_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('club_term_id', club_term_id)
      .eq('status', 'confirmed')
    if ((count ?? 0) >= term.capacity) throw new Error('This club is full')

    // Check parent doesn't already have a confirmed booking for this term
    const { count: dupCount } = await supabase
      .from('parent_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('club_term_id', club_term_id)
      .eq('parent_id', user.id)
      .in('status', ['confirmed', 'pending_payment'])
    if ((dupCount ?? 0) > 0) throw new Error('You already have a booking for this term')

    // Save child to parent_children if new
    const { data: savedChild } = await supabase
      .from('parent_children')
      .upsert({ parent_id: user.id, ...child }, { onConflict: 'parent_id,full_name' })
      .select('id')
      .single()
    const childId = savedChild?.id

    const origin = req.headers.get('origin') ?? 'http://localhost:5173'
    const school = term.school as { id: string; name: string }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `ASO Club — ${school.name}`,
            description: `${term.term_name} · ${term.num_sessions} sessions · ${child.full_name}`,
          },
          unit_amount: term.price_pence,
        },
        quantity: 1,
      }],
      success_url: `${origin}/portal/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/portal/clubs/${school.id}`,
      metadata: {
        parent_id: user.id,
        club_term_id,
        parent_child_id: childId ?? '',
        school_id: school.id,
      },
    })

    // Insert pending booking
    await supabase.from('parent_bookings').insert({
      parent_id: user.id,
      school_id: school.id,
      club_term_id,
      parent_child_id: childId,
      child_name: child.full_name,
      child_year_group: child.year_group ?? null,
      child_class: child.class_name ?? null,
      child_additional_needs: child.additional_needs ?? null,
      stripe_session_id: session.id,
      amount_pence: term.price_pence,
      status: 'pending_payment',
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
