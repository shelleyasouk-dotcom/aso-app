import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
  if (!BREVO_API_KEY) {
    return new Response(JSON.stringify({ error: 'BREVO_API_KEY not set' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Fetch sent campaigns from Brevo
  const brevoRes = await fetch(
    'https://api.brevo.com/v3/emailCampaigns?status=sent&limit=50&offset=0',
    { headers: { 'api-key': BREVO_API_KEY, 'Accept': 'application/json' } },
  )

  if (!brevoRes.ok) {
    const text = await brevoRes.text()
    return new Response(JSON.stringify({ error: `Brevo error: ${text}` }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const brevoData = await brevoRes.json()
  const campaigns = brevoData.campaigns ?? []

  let synced = 0

  for (const c of campaigns) {
    const campaignId = String(c.id)
    const { error } = await supabase
      .from('newsletters')
      .upsert(
        {
          brevo_campaign_id: campaignId,
          title: c.name ?? c.subject ?? 'Newsletter',
          preview_url: c.shareLink ?? null,
          sent_at: c.sentDate ?? null,
        },
        { onConflict: 'brevo_campaign_id', ignoreDuplicates: false },
      )

    if (!error) synced++
  }

  return new Response(JSON.stringify({ synced }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
