// Supabase Edge Function — brevo-signup
//
// Called by the public website's newsletter pop-up. Adds the given email
// (and optional name) as a contact in Brevo and subscribes them to the
// configured list, so the website pop-up and the ClassForKids sign-up link
// both feed the same Brevo mailing list.
//
// Required secrets: BREVO_API_KEY, BREVO_NEWSLETTER_LIST_ID (the numeric
// Brevo list ID to subscribe people to — find it under Contacts > Lists).
// Keep "Enforce JWT Verification" OFF — the public site calls this with no
// login.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
  const BREVO_LIST_ID = Deno.env.get('BREVO_NEWSLETTER_LIST_ID')
  if (!BREVO_API_KEY || !BREVO_LIST_ID) {
    return new Response(JSON.stringify({ error: 'Brevo is not configured yet — missing BREVO_API_KEY or BREVO_NEWSLETTER_LIST_ID' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: { email?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const email = body.email?.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Enter a valid email address' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const attributes: Record<string, string> = {}
  if (body.name?.trim()) attributes.FIRSTNAME = body.name.trim()

  const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      email,
      attributes,
      listIds: [Number(BREVO_LIST_ID)],
      updateEnabled: true,
    }),
  })

  // Brevo returns 204 for a successful create, and 400 "duplicate_parameter"
  // if the contact already exists — treat that as success too, after making
  // sure they're added to the list (updateEnabled above handles that).
  if (!brevoRes.ok && brevoRes.status !== 400) {
    const text = await brevoRes.text()
    return new Response(JSON.stringify({ error: `Brevo error: ${text}` }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
