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

// ── Email helpers ─────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

function buildConfirmationEmail(bookings: Record<string, unknown>[]) {
  const rows = bookings.map((b: Record<string, unknown>) => {
    const school = b.school as Record<string, string> | null
    const term   = b.club_term as Record<string, unknown> | null
    const discounted = (b.discount_amount_pence as number) > 0
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;vertical-align:top">
          <strong style="color:#1a3a6b">${b.child_name}</strong><br>
          <span style="color:#555;font-size:14px">${school?.name ?? ''}</span><br>
          <span style="color:#888;font-size:13px">${term?.term_name ?? ''} &bull; ${term ? fmtDate(term.start_date as string) : ''} – ${term ? fmtDate(term.end_date as string) : ''}</span>
        </td>
        <td style="padding:12px 0 12px 16px;border-bottom:1px solid #eee;text-align:right;vertical-align:top;white-space:nowrap">
          ${discounted ? `<span style="color:#aaa;text-decoration:line-through;font-size:13px">${fmtPrice((b.amount_pence as number) + (b.discount_amount_pence as number))}</span><br>` : ''}
          <strong style="color:#1a3a6b">${fmtPrice(b.amount_pence as number)}</strong>
        </td>
      </tr>`
  }).join('')

  const total = bookings.reduce((s, b) => s + (b.amount_pence as number), 0)

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a3a6b,#1e4a8c);padding:36px 32px;text-align:center">
      <div style="font-size:40px;margin-bottom:8px">✓</div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800">Booking Confirmed!</h1>
      <p style="color:rgba(255,255,255,.7);margin:8px 0 0;font-size:15px">Active School Organisation</p>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <p style="color:#333;font-size:15px;margin-top:0">Great news! We've received your payment and your booking is confirmed. Here's a summary:</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        ${rows}
        <tr>
          <td style="padding:12px 0;font-weight:700;color:#1a3a6b">Total paid</td>
          <td style="padding:12px 0 12px 16px;font-weight:800;color:#1a3a6b;text-align:right;font-size:18px">${fmtPrice(total)}</td>
        </tr>
      </table>

      <div style="background:#f0f4ff;border-radius:12px;padding:20px;margin:24px 0">
        <h3 style="color:#1a3a6b;margin:0 0 12px;font-size:15px">What happens next?</h3>
        <ul style="margin:0;padding-left:20px;color:#555;font-size:14px;line-height:1.8">
          <li>Your child will be added to the register for their club sessions</li>
          <li>A coach will be in touch if there's anything specific to discuss</li>
          <li>Just make sure they arrive on time, in comfortable clothes and with a water bottle</li>
        </ul>
      </div>

      <p style="color:#555;font-size:14px">If you have any questions, reply to this email or contact us at <a href="mailto:info@activeschool.org.uk" style="color:#1a3a6b">info@activeschool.org.uk</a>.</p>
      <p style="color:#555;font-size:14px;margin-bottom:0">See you on the court! 🏃<br><strong>The ASO Team</strong></p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #eee">
      <p style="color:#aaa;font-size:12px;margin:0">Active School Organisation &bull; <a href="https://activeschool.org.uk" style="color:#aaa">activeschool.org.uk</a></p>
    </div>
  </div>
</body>
</html>`
}

async function sendConfirmationEmail(parentEmail: string, bookings: Record<string, unknown>[]) {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'bookings@activeschool.org.uk'
  if (!resendKey) return // Email not configured — skip silently

  const childNames = bookings.map(b => b.child_name).join(', ')
  const subject = bookings.length === 1
    ? `Booking confirmed — ${(bookings[0].school as Record<string, string>)?.name ?? 'ASO Club'}`
    : `${bookings.length} bookings confirmed — ASO`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Active School Organisation <${fromEmail}>`,
      to: parentEmail,
      subject,
      html: buildConfirmationEmail(bookings),
    }),
  }).catch(() => {/* Don't fail the webhook if email fails */})

  console.log(`Confirmation email sent to ${parentEmail} for: ${childNames}`)
}

// ── Main handler ──────────────────────────────────────────────────────────────

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

    // Send confirmation email to parent
    if (session.customer_email) {
      const { data: confirmedBookings } = await supabase
        .from('parent_bookings')
        .select(`
          child_name, amount_pence, discount_amount_pence,
          school:schools(name),
          club_term:club_terms(term_name, start_date, end_date, num_sessions)
        `)
        .eq('stripe_session_id', session.id)
        .eq('status', 'confirmed')

      if (confirmedBookings && confirmedBookings.length > 0) {
        await sendConfirmationEmail(session.customer_email, confirmedBookings as Record<string, unknown>[])
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
