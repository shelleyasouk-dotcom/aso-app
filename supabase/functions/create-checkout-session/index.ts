// Supabase Edge Function — create-checkout-session
// Deploy: supabase functions deploy create-checkout-session

import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChildData {
  full_name: string
  date_of_birth?: string | null
  year_group?: string | null
  class_name?: string | null
  additional_needs?: string | null
  photo_consent?: boolean | null
  parent_name?: string | null
  parent_relationship?: string | null
  parent_phone?: string | null
  address_line1?: string | null
  address_city?: string | null
  address_postcode?: string | null
  emergency_contact_name?: string | null
  emergency_contact_relationship?: string | null
  emergency_contact_phone?: string | null
  secondary_emergency_name?: string | null
  secondary_emergency_phone?: string | null
  secondary_emergency_email?: string | null
  collection_person?: string | null
  walk_home_alone?: boolean | null
}

interface BookingItem {
  club_term_id: string
  existing_child_id?: string | null
  child: ChildData
}

interface ConsentData {
  medically_fit?: boolean | null
  first_aid_permission?: boolean | null
  fees_acknowledged?: boolean | null
  policy_agreed?: boolean | null
  signature_name?: string | null
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

    const { data: { user }, error: userErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (userErr || !user) throw new Error('Unauthorized')

    const { items, consents } = await req.json() as {
      items: BookingItem[]
      consents?: ConsentData
    }

    if (!items || items.length === 0) throw new Error('No items in booking')

    const origin = req.headers.get('origin') ?? 'http://localhost:5173'
    const signedAt = new Date().toISOString()

    // Process each booking item
    const processedItems: Array<{
      term: any
      school: { id: string; name: string }
      childId: string | null
      childName: string
      pricePence: number
      clubTermId: string
      schoolId: string
    }> = []

    for (const item of items) {
      // Fetch term + school
      const { data: term, error: termErr } = await supabase
        .from('club_terms')
        .select('*, school:schools(id,name)')
        .eq('id', item.club_term_id)
        .eq('is_active', true)
        .single()
      if (termErr || !term) throw new Error(`Term not found: ${item.club_term_id}`)

      const school = term.school as { id: string; name: string }

      // Check capacity
      const { count } = await supabase
        .from('parent_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('club_term_id', item.club_term_id)
        .eq('status', 'confirmed')
      if ((count ?? 0) >= term.capacity) throw new Error(`${school.name} club is full`)

      // Check for duplicate booking for this parent + term
      const { count: dupCount } = await supabase
        .from('parent_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('club_term_id', item.club_term_id)
        .eq('parent_id', user.id)
        .in('status', ['confirmed', 'pending_payment'])
      if ((dupCount ?? 0) > 0) throw new Error(`Already have a booking for ${school.name}`)

      // Upsert child record
      let childId: string | null = null
      if (item.existing_child_id) {
        // Update existing child with any new info
        await supabase
          .from('parent_children')
          .update({ ...item.child })
          .eq('id', item.existing_child_id)
          .eq('parent_id', user.id)
        childId = item.existing_child_id
      } else {
        const { data: savedChild } = await supabase
          .from('parent_children')
          .upsert(
            { parent_id: user.id, ...item.child },
            { onConflict: 'parent_id,full_name' },
          )
          .select('id')
          .single()
        childId = savedChild?.id ?? null
      }

      processedItems.push({ term, school, childId, childName: item.child.full_name, pricePence: term.price_pence, clubTermId: item.club_term_id, schoolId: school.id })
    }

    // Build Stripe line items
    const lineItems = processedItems.map(pi => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: `ASO Club — ${pi.school.name}`,
          description: `${pi.term.term_name} · ${pi.term.num_sessions} sessions · ${pi.childName}`,
        },
        unit_amount: pi.pricePence,
      },
      quantity: 1,
    }))

    // Metadata for webhook — store all booking info as JSON
    const bookingsMeta = processedItems.map(pi => ({
      club_term_id: pi.clubTermId,
      parent_child_id: pi.childId ?? '',
      school_id: pi.schoolId,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: lineItems,
      success_url: `${origin}/portal/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/portal/basket`,
      metadata: {
        parent_id: user.id,
        bookings: JSON.stringify(bookingsMeta),
      },
    })

    // Insert pending bookings for all items
    const bookingRows = processedItems.map(pi => ({
      parent_id: user.id,
      school_id: pi.schoolId,
      club_term_id: pi.clubTermId,
      parent_child_id: pi.childId,
      child_name: pi.childName,
      child_year_group: items.find(i => i.club_term_id === pi.clubTermId)?.child.year_group ?? null,
      child_class: items.find(i => i.club_term_id === pi.clubTermId)?.child.class_name ?? null,
      child_additional_needs: items.find(i => i.club_term_id === pi.clubTermId)?.child.additional_needs ?? null,
      stripe_session_id: session.id,
      amount_pence: pi.pricePence,
      status: 'pending_payment',
      medically_fit: consents?.medically_fit ?? null,
      first_aid_permission: consents?.first_aid_permission ?? null,
      fees_acknowledged: consents?.fees_acknowledged ?? null,
      policy_agreed: consents?.policy_agreed ?? null,
      signature_name: consents?.signature_name ?? null,
      signed_at: signedAt,
    }))

    await supabase.from('parent_bookings').insert(bookingRows)

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
