// Supabase Edge Function — send-contact-email
// Deploy: supabase functions deploy send-contact-email

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ENQUIRY_LABELS: Record<string, string> = {
  parent:      'Parent / Guardian',
  summer_camp: 'Summer Camp',
  partnership: 'School or Partnership',
  careers:     'Work With Us',
  general:     'General',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const { name, email, phone, enquiry_type, message } = await req.json()

  const resendKey  = Deno.env.get('RESEND_API_KEY')
  const fromEmail  = Deno.env.get('RESEND_FROM_EMAIL') ?? 'noreply@activeschool.org.uk'
  const toEmail    = 'info@activeschool.org.uk'

  if (!resendKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const enquiryLabel = ENQUIRY_LABELS[enquiry_type] ?? enquiry_type
  const replyLink    = `mailto:${email}?subject=${encodeURIComponent(`Re: Your message to Active School Opportunities`)}`

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">

  <div style="background:#1a3a6b;padding:20px 24px;border-radius:10px 10px 0 0;">
    <p style="color:#f5c518;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 4px;">ASO Website</p>
    <h1 style="color:white;margin:0;font-size:20px;font-weight:800;">New Contact Form Message</h1>
  </div>

  <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 10px 10px;">

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;width:120px;">Name</td>
        <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:700;color:#111;">${name}</td>
      </tr>
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Email</td>
        <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#1a3a6b;"><a href="mailto:${email}" style="color:#1a3a6b;">${email}</a></td>
      </tr>
      ${phone ? `<tr>
        <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Phone</td>
        <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111;">${phone}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:9px 0;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Enquiry</td>
        <td style="padding:9px 0;font-size:14px;color:#111;">${enquiryLabel}</td>
      </tr>
    </table>

    <div style="background:#f4f6f9;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin:0 0 10px;">Message</p>
      <p style="font-size:14px;color:#111;margin:0;line-height:1.7;white-space:pre-wrap;">${message}</p>
    </div>

    <a href="${replyLink}" style="display:inline-block;background:#1a3a6b;color:white;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;">
      ↩ Reply to ${name}
    </a>

    <p style="color:#d1d5db;font-size:11px;margin-top:20px;border-top:1px solid #f3f4f6;padding-top:16px;">
      Submitted via the ASO website contact form. Message is also stored in your Supabase database.
    </p>
  </div>
</div>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Active School Organisation <${fromEmail}>`,
      to: [toEmail],
      reply_to: email,
      subject: `New message from ${name} — ${enquiryLabel}`,
      html,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('Resend error:', text)
    return new Response(JSON.stringify({ error: text }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})
