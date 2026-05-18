// Supabase Edge Function — create-checkout-session
// Deploy: supabase functions deploy create-checkout-session

import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Always return 200 so the client can read the error body
function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
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
    if (!authHeader) return ok({ error: 'Unauthorized' })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: { user }, error: userErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (userErr || !user) return ok({ error: 'Unauthorized' })

    const { items, consents } = await req.json() as {
      items: BookingItem[]
      consents?: ConsentData
    }

    if (!items || items.length === 0) return ok({ error: 'No items in booking' })

    const origin = req.headers.get('origin') ?? 'http://localhost:5173'
    const signedAt = new Date().toISOString()

    // Process each booking item, keeping a reference to the original item
    const processedItems: Array<{
      originalItem: BookingItem
      term: Record<string, unknown>
      school: { id: string; name: string }
      childId: string | null
      childName: string
      pricePence: number
    }> = []

    for (const item of items) {
      const { data: term, error: termErr } = await supabase
        .from('club_terms')
        .select('*, school:schools(id,name)')
        .eq('id', item.club_term_id)
        .eq('is_active', true)
        .single()
      if (termErr || !term) return ok({ error: `Term not found or inactive` })

      const school = term.school as { id: string; name: string }

      // Check capacity
      const { count } = await supabase
        .from('parent_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('club_term_id', item.club_term_id)
        .eq('status', 'confirmed')
      if ((count ?? 0) >= (term.capacity as number)) return ok({ error: `${school.name} is full` })

      // Duplicate check: same parent, same term, same child name — confirmed bookings only
      // (pending_payment is fine; they may be mid-checkout)
      const childName = item.child.full_name
      const { count: dupCount } = await supabase
        .from('parent_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('club_term_id', item.club_term_id)
        .eq('parent_id', user.id)
        .ilike('child_name', childName)
        .eq('status', 'confirmed')
      if ((dupCount ?? 0) > 0) return ok({ error: `${childName} already has a confirmed booking for ${school.name}` })

      // Upsert child profile
      let childId: string | null = null
      if (item.existing_child_id) {
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

      processedItems.push({
        originalItem: item,
        term,
        school,
        childId,
        childName,
        pricePence: term.price_pence as number,
      })
    }

    // Build Stripe line items
    const lineItems = processedItems.map(pi => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: `ASO Club — ${pi.school.name}`,
          description: `${(pi.term as any).term_name} · ${(pi.term as any).num_sessions} sessions · ${pi.childName}`,
        },
        unit_amount: pi.pricePence,
      },
      quantity: 1,
    }))

    const bookingsMeta = processedItems.map(pi => ({
      club_term_id: pi.originalItem.club_term_id,
      parent_child_id: pi.childId ?? '',
      school_id: pi.school.id,
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

    // Insert all pending bookings — each uses its own originalItem data
    const bookingRows = processedItems.map(pi => ({
      parent_id: user.id,
      school_id: pi.school.id,
      club_term_id: pi.originalItem.club_term_id,
      parent_child_id: pi.childId,
      child_name: pi.childName,
      child_dob: pi.originalItem.child.date_of_birth ?? null,
      child_year_group: pi.originalItem.child.year_group ?? null,
      child_class: pi.originalItem.child.class_name ?? null,
      child_additional_needs: pi.originalItem.child.additional_needs ?? null,
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

    const { error: insertErr } = await supabase.from('parent_bookings').insert(bookingRows)
    if (insertErr) return ok({ error: `Failed to create booking: ${insertErr.message}` })

    return ok({ url: session.url })

  } catch (err) {
    return ok({ error: (err as Error).message })
  }
})
