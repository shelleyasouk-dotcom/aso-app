// Supabase Edge Function — twilio-voice
// Deploy: supabase functions deploy twilio-voice --no-verify-jwt
//
// Point your Twilio number's "A call comes in" webhook at:
//   https://<your-project-ref>.supabase.co/functions/v1/twilio-voice
// (Method: HTTP POST)
//
// Answers the call with a short greeting, then records a voicemail.
// When the recording finishes, Twilio calls the twilio-recording function
// (set below) which saves it and texts the ops team.

const RECORDING_CALLBACK_URL = Deno.env.get('TWILIO_RECORDING_CALLBACK_URL')!
// e.g. https://<your-project-ref>.supabase.co/functions/v1/twilio-recording

const GREETING =
  "Hello, you've reached Active School, the UK's leading after school gymnastics provider. Sorry we've missed your call. " +
  "Please leave your name and the best number to reach you on. If you're calling about collecting your child, please also tell us your child's name, their school, and what's changed, and we'll pass your message straight to their coach. " +
  "For anything else, we'll get back to you as soon as possible. Thank you."

function twiml(body: string) {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`,
    { headers: { 'Content-Type': 'text/xml' } },
  )
}

Deno.serve(async () => {
  return twiml(
    `<Say voice="Polly.Amy-Neural">${GREETING}</Say>` +
    `<Record maxLength="120" playBeep="true" timeout="5" ` +
    `recordingStatusCallback="${RECORDING_CALLBACK_URL}" recordingStatusCallbackEvent="completed" />` +
    `<Say voice="Polly.Amy-Neural">Sorry, we didn't catch a message. Goodbye.</Say>`
  )
})
