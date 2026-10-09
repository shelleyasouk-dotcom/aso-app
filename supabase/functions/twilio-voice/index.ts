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
  "Thanks for calling Active School Organisation. Please leave a message after the tone. " +
  "Include your name, the best number to reach you on, and if this is about collecting a child, please also tell us the name of the school. " +
  "We'll get back to you as soon as possible."

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
