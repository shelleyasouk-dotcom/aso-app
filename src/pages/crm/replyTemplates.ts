// Reply templates A–L, from the Schools Acquisition SOP v2.2, stage 3.
// Each option maps what the school said to the status it moves to and the
// matching template letter.

import type { CrmContact, CrmStatus } from '../../types'

export type TemplateLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'

export interface ReplyOption {
  theySay: string
  status: CrmStatus
  letter: TemplateLetter
  attachPack: boolean
}

export const REPLY_OPTIONS: ReplyOption[] = [
  { theySay: "Yes, let's talk", status: 'school_interested', letter: 'A', attachPack: true },
  { theySay: 'Send me some information', status: 'school_interested', letter: 'B', attachPack: true },
  { theySay: 'What does it cost?', status: 'school_interested', letter: 'C', attachPack: true },
  { theySay: 'Not now, or too busy', status: 'not_now', letter: 'D', attachPack: false },
  { theySay: 'We already have a provider', status: 'has_provider', letter: 'E', attachPack: false },
  { theySay: 'The hall is not free, or wraparound care uses it', status: 'not_now', letter: 'F', attachPack: false },
  { theySay: 'Passed to a colleague', status: 'school_interested', letter: 'G', attachPack: true },
  { theySay: 'A safeguarding or vetting question', status: 'school_interested', letter: 'H', attachPack: true },
  { theySay: 'A previous provider let us down', status: 'school_interested', letter: 'I', attachPack: true },
  { theySay: 'Yes, in an area where launch is paused', status: 'school_interested', letter: 'J', attachPack: true },
  { theySay: 'No thanks, or stop', status: 'opted_out', letter: 'K', attachPack: false },
  { theySay: "We don't use outside providers, but we hire the hall", status: 'school_interested', letter: 'L', attachPack: true },
]

function firstName(contact: CrmContact): string {
  if (!contact.contact_name) return 'there'
  return contact.contact_name.trim().split(/\s+/)[0]
}

// [YourFirstName] merge field — the logged-in user's first name
export function templateText(letter: TemplateLetter, contact: CrmContact, yourFirstName: string): string {
  const FirstName = firstName(contact)
  const SchoolName = contact.school_name
  const Town = contact.town || contact.area || 'your area'
  const Y = yourFirstName || '[Your name]'

  switch (letter) {
    case 'A':
      return `Hi ${FirstName},\n\nThank you, that has made my morning. I'm ${Y} and I look after new schools at Active School.\n\nA ten minute call is all we need. Would [Option1] or [Option2] suit you? If someone else looks after clubs at ${SchoolName}, I am very happy to speak to them instead.\n\nI have attached our School Information Pack in the meantime.\n\n${Y}`
    case 'B':
      return `Hi ${FirstName},\n\nOf course. I have attached our School Information Pack, which explains how the club works from first contact to the first session.\n\nThe short version is this. We run a weekly gymnastics club in your hall, we handle the bookings and registers, and there is no charge to the school. We check interest with your families before anyone pays.\n\nOne question so I send you the right things next. Which afternoon is your hall usually free after school?\n\n${Y}`
    case 'C':
      return `Hi ${FirstName},\n\nThere is no charge to the school. Parents book and pay us directly, at £9.50 a session, paid a block at a time. Each club also has two free places for children you feel would benefit most, and if the school would like to fund places, we invoice at the same price.\n\nI have attached our School Information Pack, which sets out the costs and how everything works. Would a ten minute call be useful? I can do [Option1] or [Option2].\n\n${Y}`
    case 'D':
      return `Hi ${FirstName},\n\nCompletely understood, and thank you for letting me know. When would be a better time for me to come back to you? I will put it in the diary and leave you in peace until then.\n\n${Y}`
    case 'E':
      return `Hi ${FirstName},\n\nThat is good to hear, and I would not want to tread on a club that is working well. Can I ask one thing? Is it gymnastics, or a general sports club?\n\nIf you are all set, just say so and I will check back once a term at most.\n\n${Y}`
    case 'F':
      return `Hi ${FirstName},\n\nThanks so much for letting me know, that's really helpful.\n\nJust in case it's useful, a number of our schools with busy wraparound care have made it work in one of two ways. Some move wraparound to another room for one hour a week, and the children who want to do gymnastics join us in the hall. Others have us start a little later, once the hall is free, with children coming to us from wraparound.\n\nIf either of those ever appeals, I'd be very happy to chat. If not, no problem at all, and thank you for considering it.\n\n${Y}\n\n(Offered once — if they say no again, set a return date for next term and don't raise the hall again until then.)`
    case 'G':
      return `Hi [ColleagueFirstName],\n\n${FirstName} kindly suggested I get in touch with you about an after school gymnastics club for ${SchoolName}.\n\nIn one line, we coach it, staff it and handle the bookings, at no charge to the school. I have attached our School Information Pack.\n\nCould we have a ten minute call? [Option1] or [Option2] would work for me.\n\n${Y}`
    case 'H':
      return `Hi ${FirstName},\n\nA very fair question, and one we like being asked. Our compliance pack is here: [CompliancePackLink]\n\n[Answer from the approved answer sheet]\n\nIf your DSL would like to go through anything in detail, one of our Deputy Designated Safeguarding Leads is happy to speak to them directly. Shall I set that up?\n\n${Y}`
    case 'I':
      return `Hi ${FirstName},\n\nI am sorry that happened, and I understand why you would be wary. Can I ask what went wrong? It helps us make sure we do not repeat it.\n\nHere is how we start a club. We agree the arrangements with you in writing, complete your checklist, and name your Lead Coach before bookings open. We only confirm the first session once enough families have booked and the team is ready.\n\nWould a ten minute call be worth it?\n\n${Y}`
    case 'J':
      return `Hi ${FirstName},\n\nThank you, we would love to work with ${SchoolName}. Our coaches near ${Town} are fully committed this term, so I would like to offer you a founding school place.\n\nWe check interest with your families now and recruit locally for your school. I will not give you a start date until your coaching team is in place, and I will tell you honestly how that is going.\n\n${Y}`
    case 'K':
      return `Hi ${FirstName},\n\nNo problem at all, and thank you for telling me. I have taken ${SchoolName} off our list and you will not hear from us again. I hope the rest of term goes well.\n\n${Y}`
    case 'L':
      return `Dear ${FirstName},\n\nThank you for coming back to me, that's really helpful.\n\nIt might help to explain how we usually work. In our other schools, we run the club just for that school's own pupils, straight after school in the hall. We provide our own coaches, all enhanced DBS checked and trained in safeguarding, first aid and anaphylaxis. Parents book and pay us directly, and we look after the bookings, payments and registers, so there's no cost to the school and nothing for your staff to do. We also offer two free places per club for pupils you feel would benefit most, such as children receiving Pupil Premium.\n\nIf you'd prefer us to hire the hall instead, we'd be very happy to. A few quick questions:\n1. What's the earliest time we could have the hall on [Day]?\n2. What's the hire charge?\n3. Would you be happy for the club to be just for ${SchoolName} pupils, and for us to start with a short letter of interest to families, to see whether there's enough interest? Nobody books or pays at that stage.\n\nI've attached our School Information Pack, which explains how everything works from first contact to the first session.\n\n${Y}`
  }
}
