import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown, ChevronUp, ArrowLeft, Users, ClipboardList, Clock, MapPin,
  ClipboardCheck, AlertTriangle, LogOut, CalendarX, Timer, MessageSquare,
  Shield, Heart, Star, TrendingUp, CheckCircle, User, BookOpen, Phone, Building2, Camera
} from 'lucide-react'

// ─── Shared components ────────────────────────────────────────────────────────

function Section({ icon: Icon, title, subtitle, children }: {
  icon: React.ElementType; title: string; subtitle?: string; children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f4f6f9] rounded-xl flex items-center justify-center shrink-0">
            <Icon size={18} className="text-[#1a3a6b]" />
          </div>
          <div>
            <p className="font-semibold text-[#1a3a6b] text-sm leading-snug">{title}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>
      {open && <div className="px-4 pb-5 pt-1 border-t border-gray-100 flex flex-col gap-2">{children}</div>}
    </div>
  )
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3 pt-2">
      <div className="w-6 h-6 bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">{n}</span>
      </div>
      <p className="text-sm text-gray-700 leading-snug">{text}</p>
    </div>
  )
}

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 pt-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-[#1a3a6b] shrink-0 mt-1.5" />
      <p className="text-sm text-gray-700 leading-snug">{text}</p>
    </div>
  )
}

function Note({ text }: { text: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mt-1">
      <p className="text-xs text-amber-800 leading-snug">{text}</p>
    </div>
  )
}

function Warn({ text }: { text: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mt-1">
      <p className="text-xs font-semibold text-red-800 leading-snug">{text}</p>
    </div>
  )
}

function Info({ text }: { text: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 mt-1">
      <p className="text-xs text-blue-800 leading-snug">{text}</p>
    </div>
  )
}

function SubHeading({ text }: { text: string }) {
  return <p className="text-xs font-bold text-[#e07b1a] uppercase tracking-wide mt-3 mb-0.5">{text}</p>
}

function RoleRow({ role, age, pay, desc }: { role: string; age: string; pay: string; desc: string }) {
  return (
    <div className="bg-[#f4f6f9] rounded-xl px-3 py-2.5 flex flex-col gap-0.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-[#1a3a6b]">{role}</p>
        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full shrink-0">{age}</span>
      </div>
      <p className="text-xs font-semibold text-[#e07b1a]">{pay}</p>
      <p className="text-xs text-gray-600 leading-snug">{desc}</p>
    </div>
  )
}

function ContactCard({ role, contact }: { role: string; contact: string }) {
  const isEmail = contact.includes('@')
  const isPhone = contact.match(/\d{5}/)
  return (
    <div className="flex items-center justify-between gap-3 bg-[#f4f6f9] rounded-xl px-3 py-2.5">
      <p className="text-sm text-gray-700 font-medium">{role}</p>
      {isEmail ? (
        <a href={`mailto:${contact}`} className="text-xs text-[#1a3a6b] font-semibold">{contact}</a>
      ) : isPhone ? (
        <a href={`tel:${contact.replace(/\s/g,'')}`} className="text-xs text-[#1a3a6b] font-semibold">{contact}</a>
      ) : (
        <p className="text-xs text-gray-500">{contact}</p>
      )}
    </div>
  )
}

function QRRow({ situation, action }: { situation: string; action: string }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <p className="text-xs font-semibold text-gray-700 bg-gray-50 px-3 py-2 border-b border-gray-100">{situation}</p>
      <p className="text-xs text-[#1a3a6b] px-3 py-2 leading-snug">{action}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HandbookPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Header */}
      <div className="bg-[#1a3a6b] px-4 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 text-sm mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold text-white">Coach Work Handbook</h1>
        <p className="text-white/60 text-sm mt-1">Version 1.0 · 2026 · Confidential — For Coaches Only</p>
        {/* Values strip */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {['Fun', 'Safety', 'Inclusion', 'Development', 'Professionalism'].map((v, i) => (
            <span key={v} className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${
              i === 0 ? 'bg-[#1a3a6b] border border-white/30 text-white' :
              i === 1 ? 'bg-[#e07b1a] text-white' :
              'bg-white/10 text-white'
            }`}>{v}</span>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-3 pb-12">

        {/* Welcome note */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            You're now part of the Active School Org coaching team. This handbook tells you everything you need to know about working with us — how sessions run, what's expected of you, how to get paid, and what to do when things don't go to plan.
          </p>
          <p className="text-sm font-bold text-[#1a3a6b] mt-3">Read it fully. Keep it. Refer back to it.</p>
          <p className="text-xs text-gray-500 mt-2">If something isn't covered here, ask your Lead Coach or Area Lead before making a decision. Never guess when it comes to safety or safeguarding.</p>
        </div>

        {/* Section 1 */}
        <Section icon={Building2} title="Section 1 — Who We Are">
          <p className="text-sm text-gray-700 leading-relaxed pt-2">Active School Org delivers gymnastics and multi-sport after-school clubs in UK primary schools. We work in partnership with schools to provide safe, structured, and enjoyable sessions for children aged 4–11.</p>
          <p className="text-sm text-gray-700 leading-relaxed">We operate using the UKAG Awards Framework — a structured progression system that gives children clear goals and coaches a clear curriculum.</p>
          <SubHeading text="Our Values" />
          <div className="flex flex-wrap gap-2 mt-1">
            {['Fun', 'Safety', 'Inclusion', 'Development', 'Professionalism'].map(v => (
              <span key={v} className="bg-[#1a3a6b] text-white text-xs font-bold px-3 py-1.5 rounded-lg">{v}</span>
            ))}
          </div>
        </Section>

        {/* Section 2 */}
        <Section icon={Users} title="Section 2 — Your Role" subtitle="4 roles, one pathway">
          <p className="text-sm text-gray-700 pt-2">There are four coach roles at ASO. Every coach starts somewhere and can progress through the pathway.</p>
          <div className="flex flex-col gap-2 mt-2">
            <RoleRow role="Junior Coach" age="13–16" pay="£8–10 per session" desc="Assist under supervision. Equipment, engagement, stickers, games." />
            <RoleRow role="Assistant Coach" age="16–18" pay="£15–20 per session" desc="Support small groups, lead warm-ups, assist Lead Coach." />
            <RoleRow role="Lead Coach" age="18+" pay="£30–45 per session" desc="Run the full session. Responsible for safety, register, team, and school relationship." />
            <RoleRow role="Area Lead" age="18+" pay="Agreed rate" desc="Oversee multiple schools, manage coaches, quality assurance." />
          </div>
          <Warn text="You are responsible for knowing your role and staying within it. If you are an Assistant Coach, you do not run a session alone. If you are a Junior Coach, you do not manage behaviour independently." />
        </Section>

        {/* Section 3 */}
        <Section icon={ClipboardList} title="Section 3 — Before Your First Session" subtitle="Complete before you can work with us">
          <p className="text-sm text-gray-700 pt-2">You must complete everything on this checklist before you can work with us. Nothing starts until this list is fully signed off.</p>
          <SubHeading text="Onboarding Checklist — All Coaches" />
          {[
            'Application form submitted',
            'Two references provided',
            'Enhanced DBS check completed (or existing valid DBS shared)',
            'Photo ID provided (passport or driving licence)',
            'Signed the Coach Code of Conduct',
            'Received and read this handbook',
            'Completed ASO onboarding training',
            'Added to the staff WhatsApp group',
            'Attended one shadow session',
            'Signed off by your Lead Coach or Area Lead',
          ].map(item => <Bullet key={item} text={item} />)}
          <SubHeading text="Lead Coaches Only — Additional Requirement" />
          <Bullet text="Valid Paediatric First Aid certificate uploaded" />
          <Warn text="You may not attend a session independently until every item above is ticked and confirmed by your Area Lead." />
        </Section>

        {/* Section 4 */}
        <Section icon={Clock} title="Section 4 — Session Structure" subtitle="Same format every session">
          <p className="text-sm text-gray-700 pt-2">Every session follows the same format. This is not flexible — consistency is what makes us reliable to schools and parents.</p>
          <SubHeading text="Standard Session: 3:00–4:00pm" />
          {[
            { time: '3:00–3:15', activity: 'Arrival, register, snack', who: 'Lead Coach', note: 'Register complete by 3:10pm' },
            { time: '3:15–3:20', activity: 'Warm-up game', who: 'Assistant or Lead Coach', note: 'High energy, inclusive, fun' },
            { time: '3:20–3:30', activity: 'Stretch & mobility', who: 'Coach-led groups', note: 'Follow the UKAG warm-up guide' },
            { time: '3:30–3:50', activity: 'Main activity stations (UKAG-linked)', who: 'All coaches', note: 'Two stations, rotate weekly' },
            { time: '3:50–3:55', activity: 'Cool-down game', who: 'Junior Coach or Assistant', note: 'Calm, bring energy down' },
            { time: '3:55–4:00', activity: 'Pack down & dismissal', who: 'All coaches', note: 'No child leaves until collected' },
          ].map(row => (
            <div key={row.time} className="bg-[#f4f6f9] rounded-xl px-3 py-2.5 flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#1a3a6b]">{row.time}</p>
                <p className="text-xs text-gray-400">{row.who}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">{row.activity}</p>
              <p className="text-xs text-gray-500">{row.note}</p>
            </div>
          ))}
          <SubHeading text="What Good Looks Like" />
          {[
            'Children are active, engaged, and enjoying themselves',
            'Every child is supervised at all times — no exceptions',
            'Coaches are enthusiastic, encouraging, and calm',
            'Equipment is set up before children arrive',
            'Register is completed by 3:10pm',
            'Every child is handed to a named adult at collection',
          ].map(item => <Bullet key={item} text={item} />)}
        </Section>

        {/* Section 5 */}
        <Section icon={MapPin} title="Section 5 — Arrival and Set-Up" subtitle="Arrive 10 minutes early — no exceptions">
          <Note text="You must arrive no later than 10 minutes before the session starts. For a 3:00pm session, that means arriving at school by 2:50pm." />
          <SubHeading text="Step-by-Step Arrival Process" />
          <Step n={1} text="Sign in at school reception — bring your ID lanyard" />
          <Step n={2} text="Follow the school's visitor procedure (some schools require you to wait for an escort)" />
          <Step n={3} text="Go directly to the hall — do not enter classrooms or corridors without permission" />
          <Step n={4} text="Check the space: floor surface, equipment condition, exit routes, toilet access" />
          <Step n={5} text="Complete the Daily Risk Assessment (paper or digital form)" />
          <Step n={6} text="Set up equipment according to that week's station rotation" />
          <Step n={7} text="Be ready and positioned at the hall entrance when children arrive" />
          <Warn text="If something is wrong with the space (wet floor, damaged equipment, no supervision possible) — do not start the session. Call your Lead Coach or Area Lead immediately." />
        </Section>

        {/* Section 6 */}
        <Section icon={ClipboardCheck} title="Section 6 — Register and Attendance" subtitle="A safeguarding document — never skip it">
          <Warn text="The register is a safeguarding document. It must be completed at every session without exception." />
          <SubHeading text="Lead Coach Responsibilities" />
          <Step n={1} text="Open the register (digital or paper backup) at the start of every session" />
          <Step n={2} text="Mark every child present or absent by name" />
          <Step n={3} text="Note any late arrivals and the time they arrived" />
          <Step n={4} text="Note any early collections and who collected the child" />
          <Step n={5} text="Submit the register to Naima or your Area Lead within 24 hours of the session" />
          <SubHeading text="If a Child Arrives Who Is Not on the Register" />
          <Bullet text="Do not turn them away" />
          <Bullet text="Contact your Area Lead immediately" />
          <Bullet text="Record their name, time of arrival, and who brought them" />
          <Bullet text="Do not allow them to participate until you have confirmation from the Area Lead" />
        </Section>

        {/* Section 7 */}
        <Section icon={AlertTriangle} title="Section 7 — Medical Awareness & Snack Protocol" subtitle="Non-negotiable — read carefully">
          <Warn text="This section is non-negotiable. Children in our sessions may have severe allergies. Getting this wrong can put a child's life at risk. Lead Coaches are fully responsible. Assistant and Junior Coaches support but do not lead." />
          <SubHeading text="7.1 Before Every Session — Medical Check" />
          <p className="text-sm text-gray-700">Before any child enters the hall, the Lead Coach must:</p>
          <Step n={1} text="Open the session register and check for any children with allergies or medical needs" />
          <Step n={2} text="Locate the medical bag — confirm it is present, accessible, and fully stocked" />
          <Step n={3} text="Check that any epi-pens or medication belonging to children are courtside and within reach" />
          <Step n={4} text="If a child has a severe allergy and their medication is not present — contact the parent immediately before the session begins" />
          <Step n={5} text="Do not start the session until you are satisfied all medical needs are accounted for" />
          <Note text="If you are unsure about any child's medical needs — ask before the session starts. Never assume." />
          <SubHeading text="7.2 During the Session — Medical Bag" />
          <Bullet text="The medical bag must remain courtside and within reach at all times" />
          <Bullet text="It must never be locked away, left in a kit bag, or kept in another room" />
          <Bullet text="If a child needs their epi-pen or medication during the session — use it and call 999 immediately" />
          <Bullet text="Then notify the Area Lead and parent without delay" />
          <Bullet text="Record the incident on the Incident Report Form the same day" />
          <SubHeading text="7.3 End of Session — Medical Check Out" />
          <Step n={1} text="Ensure any epi-pens or medication are returned directly to the parent or guardian" />
          <Step n={2} text="Do not leave medication with the child alone" />
          <Step n={3} text="Confirm the medical bag has been checked and repacked correctly" />
          <Step n={4} text="The medical bag must leave the session with the Lead Coach — it does not stay at the school" />
          <Warn text="This check happens at the START and END of every session. No exceptions." />
          <SubHeading text="7.4 Snack Protocol" />
          <p className="text-sm text-gray-700">Children are allowed a small snack before the session begins. Check the register before making any decision about snacks.</p>
          {[
            { situation: 'Any child has a food allergy', action: 'NO snacks in or near the hall. Snacks must be eaten in a separate designated area only. Hands must be washed after eating before entering the hall.' },
            { situation: 'No children have food allergies', action: 'Small snack permitted in the designated snack area only — not inside the gymnastics space. Hands cleaned before session begins. All rubbish cleared immediately.' },
            { situation: 'All sessions — no exceptions', action: 'No food or wrappers inside the gymnastics space. No eating during warm-up, stations, or cool-down. Lead Coach enforces this.' },
          ].map(row => (
            <div key={row.situation} className="bg-[#f4f6f9] rounded-xl px-3 py-2.5 flex flex-col gap-1">
              <p className="text-xs font-bold text-[#1a3a6b]">{row.situation}</p>
              <p className="text-xs text-gray-600 leading-snug">{row.action}</p>
            </div>
          ))}
          <SubHeading text="7.5 Common Mistakes to Avoid" />
          <Bullet text="Assuming you know a child's allergies from memory — always check the register" />
          <Bullet text="Leaving the medical bag in a kit bag or cupboard during the session" />
          <Bullet text="Allowing snacks in the hall because 'it was fine last week'" />
          <Bullet text="Letting children or parents manage their own epi-pens without coach awareness" />
          <Bullet text="Forgetting to return medication to the parent at the end of the session" />
          <Bullet text="Not recording a medical incident because it seemed minor" />
          <SubHeading text="7.6 Escalation" />
          {[
            { situation: "Child's medication is missing at session start", action: 'Call parent immediately. Do not start session without it.' },
            { situation: 'Child has a reaction during session', action: 'Use epi-pen if prescribed. Call 999. Call Area Lead. Call parent.' },
            { situation: "Unsure about a child's allergy", action: 'Ask the parent before the session. Do not guess.' },
            { situation: 'Snack situation is unclear', action: 'Default to no snacks in the hall. Always the safer option.' },
            { situation: 'Any medical incident occurs', action: 'Complete Incident Report Form the same day.' },
          ].map(row => (
            <div key={row.situation} className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 flex flex-col gap-1">
              <p className="text-xs font-bold text-red-700">{row.situation}</p>
              <p className="text-xs text-red-800 leading-snug">{row.action}</p>
            </div>
          ))}
        </Section>

        {/* Section 8 */}
        <Section icon={LogOut} title="Section 8 — End of Session and Dismissal" subtitle="One of the highest-risk parts of the session">
          <Warn text="Dismissal is one of the highest-risk parts of the session. Follow this process exactly, every time." />
          <SubHeading text="Step-by-Step Dismissal" />
          <Step n={1} text="Line children up inside the hall — do not open the door until a parent or guardian is visible" />
          <Step n={2} text="Call each child's name individually" />
          <Step n={3} text="Only release a child to a named adult on their contact list — no name, no go" />
          <Step n={4} text="If you do not recognise the adult, ask for their name and check it against the register" />
          <Step n={5} text="If someone is collecting who is not on the list, call the Area Lead before releasing the child" />
          <Step n={6} text="Record any late collections in the register with the exact time" />
          <Step n={7} text="If a parent is more than 15 minutes late, follow the Late Pickup Protocol (Section 12)" />
          <SubHeading text="What Good Looks Like" />
          <Bullet text="Every child is handed over individually" />
          <Bullet text="No child leaves the building without being collected by a named adult" />
          <Bullet text="You are calm and organised — not rushing children out" />
        </Section>

        {/* Section 9 */}
        <Section icon={CalendarX} title="Section 9 — Absence and Cover" subtitle="Always before 9am — not by text">
          <Warn text="This is the most important section for keeping the business running. Texting someone at 2pm is not acceptable. Last-minute no-shows damage the school relationship and let children down." />
          <SubHeading text="The Cover Escalation Chain" />
          <div className="bg-[#1a3a6b] rounded-xl px-4 py-3 mt-1">
            <p className="text-white text-sm font-bold text-center">YOU → LEAD COACH → AREA LEAD → NAIMA (Admin)</p>
            <p className="text-white/60 text-xs text-center mt-1">The founder is not in this chain. Do not contact the founder directly about cover.</p>
          </div>
          <SubHeading text="If You Are Unwell or Cannot Attend" />
          <Step n={1} text="Contact your Lead Coach by phone call or voice note — not text — as early as possible" />
          <Step n={2} text="This must happen before 9:00am on the day of the session" />
          <Step n={3} text="Your Lead Coach will attempt to find cover from the coaching team" />
          <Step n={4} text="If no cover is found within one hour, the Lead Coach contacts the Area Lead" />
          <Step n={5} text="The Area Lead contacts Naima if still unresolved by 12:00pm" />
          <Step n={6} text="Naima will inform the school and parents if the session cannot go ahead" />
          <Note text="If you cannot reach your Lead Coach within 30 minutes, go directly to the Area Lead." />
          <SubHeading text="Rules Around Absence" />
          <Bullet text="One unplanned absence per term is understandable — life happens" />
          <Bullet text="Two or more unplanned absences in a term will trigger a review with your Area Lead" />
          <Bullet text="Three or more may result in removal from the rota" />
          <Bullet text="If you know in advance you cannot attend, give a minimum of 7 days' notice" />
          <Bullet text="Planned absences must be logged with your Lead Coach and Area Lead in writing" />
        </Section>

        {/* Section 10 */}
        <Section icon={Timer} title="Section 10 — Logging Your Hours" subtitle="Submit by 5th, paid by 15th">
          <p className="text-sm text-gray-700 pt-2">All coaches must log their hours accurately. This is how you get paid correctly and on time.</p>
          <Info text="Current system: Monthly Timesheet Template (moving to online logging in 2026). Templates are available from Naima or your Area Lead." />
          <SubHeading text="What to Include on Every Timesheet" />
          <Bullet text="Your full name" />
          <Bullet text="School name" />
          <Bullet text="Date of each session" />
          <Bullet text="Session type (club / cover / camp / CPD)" />
          <Bullet text="Your role that session (Lead / Assistant / Junior)" />
          <Bullet text="Total sessions worked" />
          <div className="flex flex-col gap-2 mt-2">
            <div className="bg-[#f4f6f9] rounded-xl px-3 py-2.5 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">5th of each month</p>
              <p className="text-xs text-[#1a3a6b]">Submit timesheet to Naima</p>
            </div>
            <div className="bg-[#f4f6f9] rounded-xl px-3 py-2.5 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">15th of each month</p>
              <p className="text-xs text-[#1a3a6b]">Payment by bank transfer</p>
            </div>
          </div>
          <Warn text="Late timesheets may delay your payment. This cannot be overridden — submit on time." />
          <Note text="Pay queries: Email accounts@activeschool.org.uk with your timesheet attached and a clear description of the issue. Do not raise pay queries via WhatsApp." />
        </Section>

        {/* Section 11 */}
        <Section icon={MessageSquare} title="Section 11 — Communication Standards">
          <SubHeading text="With Children" />
          <Bullet text="Use first names, stay positive, be patient" />
          <Bullet text="Never raise your voice in anger" />
          <Bullet text="Never use physical contact to manage behaviour — use your voice and positioning" />
          <Bullet text="Never communicate with children via personal social media or messaging apps" />
          <SubHeading text="With Parents" />
          <Bullet text="Be polite, professional, and brief" />
          <Bullet text="Do not discuss other children" />
          <Bullet text="Do not make promises about refunds, bookings, or complaints" />
          <Bullet text="Refer anything beyond a quick question to Naima or your Lead Coach" />
          <SubHeading text="With Schools" />
          <Bullet text="Always sign in at reception" />
          <Bullet text="Be respectful of the school environment — you are a guest" />
          <Bullet text="If a teacher raises a concern, listen, thank them, and report it to your Area Lead the same day" />
          <Bullet text="Do not make commitments on behalf of ASO to school staff" />
          <SubHeading text="On WhatsApp" />
          <Bullet text="The staff WhatsApp group is for work communication only" />
          <Bullet text="Respond to messages relevant to you within a reasonable time" />
          <Bullet text="Do not share session information, photos, or children's details in personal chats" />
        </Section>

        {/* Section 12 */}
        <Section icon={Clock} title="Section 12 — Late Pickup Protocol" subtitle="Child not collected after 15 minutes">
          <p className="text-sm text-gray-700 pt-2">If a child has not been collected 15 minutes after the session ends:</p>
          <Step n={1} text="Stay with the child — do not leave them alone under any circumstances" />
          <Step n={2} text="Check the register for the parent's emergency contact number" />
          <Step n={3} text="Call the parent or guardian directly" />
          <Step n={4} text="If no answer, call the secondary contact" />
          <Step n={5} text="If still no answer after two attempts, call your Area Lead immediately" />
          <Step n={6} text="The Area Lead will contact Naima and follow the school's late collection policy" />
          <Step n={7} text="Under no circumstances take the child off the premises or hand them to an adult not on their contact list" />
          <Step n={8} text="Log the incident on the Incident Report Form the same day" />
          <Warn text="Never leave a child unattended. Never take a child off the school premises. When in doubt, call the Area Lead." />
        </Section>

        {/* Section 13 */}
        <Section icon={Shield} title="Section 13 — Safeguarding & Photography" subtitle="Every coach's responsibility, every session · Updated June 2026">
          <Warn text="Safeguarding is not optional. It is not someone else's job. It is every coach's responsibility, every session, without exception." />
          <SubHeading text="The Basics — Always" />
          <Bullet text="Never be alone with a child in a closed space" />
          <Bullet text="Never take photos of children without explicit permission from management" />
          <Bullet text="Never contact children or their families via personal accounts" />
          <Bullet text="Always work in sight or hearing of another adult" />
          <SubHeading text="If a Child Says Something That Worries You" />
          <Step n={1} text="Stay calm — do not overreact or ask leading questions" />
          <Step n={2} text="Listen carefully and let them speak" />
          <Step n={3} text="Do not promise confidentiality" />
          <Step n={4} text="As soon as the session ends, write down exactly what was said — word for word" />
          <Step n={5} text="Report it to your Lead Coach or Area Lead immediately after the session" />
          <Step n={6} text="Complete the Safeguarding Concern Form the same day" />
          <Step n={7} text="The Area Lead will escalate to the Designated Safeguarding Lead (DSL)" />
          <Warn text="If a child is in immediate danger — call 999 first. Then notify your Area Lead." />

          <SubHeading text="13.3 — Photography & Images" />
          <Info text="Updated June 2026 — all staff must read and acknowledge this section." />
          <p className="text-sm text-gray-700 pt-1">Parents give photo consent at enrolment covering ASO marketing and social media. All staff can see a child's consent status in the register. Check before taking any photos — ask your Lead Coach or Area Lead if unsure.</p>
          <Warn text="Lead Coaches only may take photographs at sessions. Assistant Coaches and Junior Coaches do not take photos — on any device, at any time." />

          <SubHeading text="Before You Take Any Photo (3 checks)" />
          <Step n={1} text="Confirm with your Area Lead that photography is approved for this session" />
          <Step n={2} text="Check consent status for every child — ask your Lead Coach or Area Lead if unsure" />
          <Step n={3} text="Make sure no child without consent will appear in any shot — reposition the group if needed" />

          <SubHeading text="What Makes a Safe Photo" />
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
              <p className="text-xs font-bold text-green-700 mb-1.5">✅ Good</p>
              <div className="flex flex-col gap-1">
                {['Action shot — skill being performed', 'Child clothed appropriately', 'No school name or badge visible', 'Side-on or from behind', 'Taken in the session space'].map(t => (
                  <p key={t} className="text-xs text-green-800">• {t}</p>
                ))}
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <p className="text-xs font-bold text-red-700 mb-1.5">❌ Not acceptable</p>
              <div className="flex flex-col gap-1">
                {["Close-up of a child's face", 'School uniform name visible', 'Child adjusting clothing', 'Corridor, changing area, or toilet', 'Child unaware photo is being taken'].map(t => (
                  <p key={t} className="text-xs text-red-800">• {t}</p>
                ))}
              </div>
            </div>
          </div>

          <SubHeading text="Never (zero exceptions)" />
          {['Store photos of children in your personal camera roll long-term', 'Share photos in personal WhatsApp chats or on your own social media', 'Send photos directly to parents — even if they ask', 'Upload photos to any AI tool or editing app'].map(t => (
            <Warn key={t} text={t} />
          ))}

          <SubHeading text="Device Rules" />
          <Bullet text="Use the ASO Coaching App — that is the approved method." />
          <Bullet text="If your Area Lead has given written approval to use your personal phone for a specific session:" />
          <Note text="Disable auto-sync to iCloud / Google Photos before the session · Transfer to ASO secure storage within 24 hours · Delete from personal device immediately after — no exceptions" />

          <SubHeading text="If a Parent Asks for Photos" />
          <Note text="Say: 'I'll pass that on — our team will be able to help.' Then tell your Area Lead. Do not share anything directly." />

          <SubHeading text="If Something Goes Wrong" />
          <Bullet text="Lost or stolen device — tell your Area Lead the same day; they will notify the DSL; complete an Incident Report on the app" />
          <Bullet text="Photo taken of wrong child — delete it immediately from all devices; tell your Lead Coach or Area Lead the same day; do not share it" />
          <Bullet text="Someone else taking photos that concern you — do not confront them; report to your Area Lead after the session; if a child is at immediate risk — tell school staff and call 999" />
          <Note text="You will not get into trouble for raising a concern in good faith. You will get into trouble for saying nothing." />

          <SubHeading text="Key Safeguarding Contacts" />
          <ContactCard role="Designated Safeguarding Lead (DSL)" contact="safeguarding@activeschool.org.uk" />
          <ContactCard role="National Safeguarding Lead" contact="Shelley Wood — 07814 899151" />
          <ContactCard role="Emergency" contact="999" />
        </Section>

        {/* Section 14 */}
        <Section icon={Heart} title="Section 14 — Additional Needs Policy" subtitle="Inclusive coaching for every child">
          <p className="text-sm text-gray-700 pt-2">Active School Org is committed to being inclusive. We welcome children of all abilities, backgrounds, and needs.</p>
          <SubHeading text="14.1 What Are Additional Needs?" />
          <Bullet text="Autism Spectrum Condition (ASC)" />
          <Bullet text="ADHD or attention and focus difficulties" />
          <Bullet text="Physical disabilities or mobility needs" />
          <Bullet text="Sensory processing differences" />
          <Bullet text="Learning difficulties (e.g. dyspraxia, dyslexia)" />
          <Bullet text="Speech, language, and communication needs" />
          <Bullet text="Social, emotional, and mental health needs (SEMH)" />
          <Bullet text="Medical conditions affecting participation" />
          <SubHeading text="14.2 Before the Session" />
          <Step n={1} text="Check the register and registration notes for any flagged needs or conditions" />
          <Step n={2} text="If additional needs are noted, speak to your Area Lead before the session begins" />
          <Step n={3} text="Your Area Lead will brief you on any specific adjustments or strategies agreed with the parent" />
          <Step n={4} text="Do not make assumptions — every child is different" />
          <Note text="If a child arrives and you become aware of additional needs that were not disclosed, note it and report to your Area Lead the same day." />
          <SubHeading text="14.3 During the Session — How to Support" />
          <Bullet text="Use clear, simple instructions — break tasks into small steps" />
          <Bullet text="Give children extra time to process and respond — do not rush" />
          <Bullet text="Use positive language and encouragement — avoid negative comparisons" />
          <Bullet text="Allow sensory breaks or quiet time if a child is overwhelmed" />
          <Bullet text="Adapt activities where possible — the UKAG framework allows for skill variations" />
          <Bullet text="Do not single out a child in front of their peers" />
          <Bullet text="If a child is becoming distressed, remove them calmly to a quieter area and notify your Lead Coach" />
          <SubHeading text="14.4 What We Cannot Provide" />
          <Bullet text="One-to-one dedicated support during sessions due to coach-to-child ratios" />
          <Bullet text="Specialist medical or therapeutic interventions" />
          <Bullet text="Personal care support" />
          <Info text="If a child's needs cannot be safely met within our current structure, the Area Lead will speak honestly with the parent and explore alternative options." />
          <SubHeading text="14.5 Parent Attendance — Trial Period" />
          <p className="text-sm text-gray-700">In some cases, a parent or carer may attend sessions during a trial period to support their child. This is only permitted where:</p>
          <Bullet text="The parent holds a valid Enhanced DBS certificate (evidence required)" />
          <Bullet text="The arrangement has been agreed in advance by the Area Lead" />
          <Bullet text="The parent understands they are there to support their child only — not to coach or manage other children" />
          <Bullet text="The trial period is reviewed at the end of each half-term" />
          <Warn text="Parent attendance is a temporary arrangement and must be formally agreed. It is not automatic and does not continue indefinitely." />
          <SubHeading text="14.7 Common Mistakes to Avoid" />
          <Bullet text="Assuming a child's behaviour is intentional when it may be need-related — ask your Lead Coach" />
          <Bullet text="Making promises to parents about what support you can provide — refer to the Area Lead" />
          <Bullet text="Ignoring a disclosure or observation because you are unsure what to do — always report it" />
          <Bullet text="Treating a child differently in a way that singles them out in front of peers" />
        </Section>

        {/* Section 15 */}
        <Section icon={Star} title="Section 15 — Uniform and Appearance" subtitle="You represent ASO at every session">
          <p className="text-sm text-gray-700 pt-2">You represent Active School Org at every session. First impressions matter to schools and parents.</p>
          <SubHeading text="You Must Wear" />
          <Bullet text="ASO branded t-shirt or jumper" />
          <Bullet text="Plain black or navy sports bottoms — leggings, joggers, or shorts" />
          <Bullet text="Trainers with good grip — no flat-soled shoes or boots" />
          <Bullet text="Hair tied back" />
          <Bullet text="No dangly jewellery, loose rings, or long necklaces" />
          <SubHeading text="You Must Not Wear" />
          <Bullet text="Non-branded hoodies or jackets during sessions" />
          <Bullet text="Casual clothing — jeans, oversized tops, sliders" />
          <Bullet text="Anything that could catch on equipment or distract from coaching" />
          <Note text="If your uniform is damaged or lost, report it to your Area Lead. Do not turn up out of uniform without flagging it first." />
        </Section>

        {/* Section 16 */}
        <Section icon={TrendingUp} title="Section 16 — Your Development" subtitle="We invest in our coaches">
          <p className="text-sm text-gray-700 pt-2">ASO is built on developing young coaches. If you want to grow, we will support you.</p>
          <SubHeading text="The Coach Pathway" />
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {['Junior Coach (13–16)', '→', 'Assistant Coach (16–18)', '→', 'Lead Coach (18+)', '→', 'Area Lead'].map((item, i) => (
              item === '→'
                ? <span key={i} className="text-gray-400 font-bold text-sm">→</span>
                : <span key={i} className="bg-[#1a3a6b] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">{item}</span>
            ))}
          </div>
          <SubHeading text="Free Training Available to ASO Coaches" />
          <Bullet text="UKAG Level 0 — Junior Coach" />
          <Bullet text="UKAG Level 1 — Assistant Coach" />
          <Bullet text="UKAG Level 2 — Lead Coach" />
          <SubHeading text="To Qualify for Free Training You Must" />
          <Bullet text="Complete your onboarding" />
          <Bullet text="Work a minimum of one full term" />
          <Bullet text="Remain on the active rota" />
          <Bullet text="Attend required shadow and CPD sessions" />
          <Warn text="If you leave before completing your term after receiving free training, you may be invoiced for the full course cost." />
          <Note text="Termly reviews are conducted by your Area Lead. These are not disciplinary — they are designed to support your growth and identify your next steps." />
        </Section>

        {/* Section 17 */}
        <Section icon={CheckCircle} title="Section 17 — Conduct and Expectations">
          <SubHeading text="What We Expect" />
          <Bullet text="Arrive on time, in uniform, and prepared" />
          <Bullet text="Be enthusiastic, positive, and professional at every session" />
          <Bullet text="Follow all protocols in this handbook without cutting corners" />
          <Bullet text="Raise concerns early — do not wait until something becomes a problem" />
          <SubHeading text="What Is Not Acceptable" />
          <Bullet text="Lateness without communication" />
          <Bullet text="Using your phone during sessions (except for the register or an emergency)" />
          <Bullet text="Unprofessional behaviour in front of children, parents, or school staff" />
          <Bullet text="Ignoring messages from your Lead Coach or Area Lead" />
          <Bullet text="Sharing session content or children's information without permission" />
          <SubHeading text="If Standards Are Not Met" />
          <Step n={1} text="Informal conversation with your Lead Coach" />
          <Step n={2} text="Written feedback from the Area Lead" />
          <Step n={3} text="Formal warning from the Operations Director" />
          <Step n={4} text="Removal from the rota" />
          <Warn text="Serious breaches — including safeguarding violations or aggressive conduct — may result in immediate suspension without going through the steps above." />
        </Section>

        {/* Section 18 */}
        <Section icon={User} title="Section 18 — Lone Working & Busy Sessions" subtitle="Safety · Calm · Positive experience">
          <Info text="Your priority in every session, regardless of how many coaches are present, is: Safety · Calm · Positive experience for children. Perfect delivery is not required. Confidence, structure, and enjoyment matter most." />
          <SubHeading text="18.1 If You Are Lone Working" />
          <p className="text-sm text-gray-700">Lone working is planned for and permitted in certain circumstances. It is not a failure — it is something we prepare for.</p>
          {[
            { area: 'Session structure', what: 'Run a clear warm-up and cool-down. Keep the session simple and well-structured.' },
            { area: 'Managing numbers', what: 'Use stations or circuits. Keep children rotating rather than waiting in lines.' },
            { area: 'Energy management', what: 'Keep children moving. Whole-class activities work better than small-group coaching when alone.' },
            { area: 'Boundaries', what: 'Set clear rules at the start. Reinforce routines consistently throughout.' },
            { area: 'Skill level', what: 'Do not attempt to teach advanced skills alone. Focus on fundamentals and enjoyment.' },
            { area: 'Safety', what: 'If at any point the session feels unsafe, simplify the activity immediately. Never continue if you feel it is beyond your control.' },
          ].map(row => (
            <div key={row.area} className="bg-[#f4f6f9] rounded-xl px-3 py-2.5 flex flex-col gap-0.5">
              <p className="text-xs font-bold text-[#1a3a6b]">{row.area}</p>
              <p className="text-xs text-gray-600 leading-snug">{row.what}</p>
            </div>
          ))}
          <Warn text="If a session becomes unsafe and cannot be managed alone, stop the activity, bring children to a seated position, and call your Area Lead immediately. Do not continue under unsafe conditions." />
          <SubHeading text="18.2 Safeguarding When Lone Working" />
          <Bullet text="Never be alone with a single child in a closed or isolated space" />
          <Bullet text="If you need to deal with an individual concern, ensure the rest of the group is visible and in a safe, supervised position" />
          <Bullet text="If a child needs to leave the hall (e.g. toilet), follow the school's procedure — do not leave the group unsupervised" />
          <Bullet text="If you have a safeguarding concern, follow the process in Section 13 — staffing levels do not change this" />
          <SubHeading text="18.3 If Your Class Is Busier Than Normal" />
          <Bullet text="Use group challenges and whole-class activities rather than individual coaching" />
          <Bullet text="Rotate stations rather than running queues — keep everyone moving" />
          <Bullet text="Keep instructions short and repeat them clearly" />
          <Bullet text="Praise effort and behaviour, not just skill — this keeps the energy positive" />
          <Bullet text="Build in short water breaks to reset the group's focus" />
          <Bullet text="Use the children's names — it builds connection and keeps attention" />
          <Note text="Children respond best to calm, confident leadership. If you stay calm, they stay calm. Your energy sets the tone for the session." />
          <SubHeading text="18.4 What Good Looks Like in a Difficult Session" />
          <Bullet text="Children are safe" />
          <Bullet text="Children are engaged" />
          <Bullet text="Children leave happy" />
          <Bullet text="You leave knowing you did your best" />
          <SubHeading text="18.5 When to Ask for Help" />
          <Bullet text="You feel overwhelmed before or during a session" />
          <Bullet text="Class numbers are significantly higher than expected" />
          <Bullet text="You have a safeguarding concern you are unsure how to handle" />
          <Bullet text="You feel the session cannot be run safely with the current staffing" />
          <Bullet text="You need additional equipment, support, or guidance" />
          <Info text="You are trusted. You are supported. You are not expected to carry this alone. Raising a concern early is always the right call." />
        </Section>

        {/* Quick Reference Card */}
        <Section icon={BookOpen} title="Quick Reference Card" subtitle="What to do when things happen">
          {[
            { s: "I'm sick and can't attend", a: 'Call or voice note your Lead Coach before 9am' },
            { s: "I can't reach my Lead Coach", a: 'Call the Area Lead directly — do not wait' },
            { s: 'A child says something worrying', a: 'Listen. Don\'t promise confidentiality. Report to Lead Coach → Area Lead → DSL same day' },
            { s: "A child isn't collected after 15 mins", a: 'Stay with child. Check register. Call parent. If no answer → Area Lead' },
            { s: 'A child has a medical reaction', a: 'Use epi-pen if prescribed. Call 999. Call Area Lead. Call parent. Log it.' },
            { s: 'A parent makes a complaint', a: 'Thank them. Refer to Lead Coach or Naima. Do not make promises.' },
            { s: 'Equipment is damaged or unsafe', a: 'Do not use it. Report to Area Lead before the session starts.' },
            { s: 'Snack situation is unclear', a: 'Default to no snacks in the hall. Always the safer option.' },
            { s: 'I have a pay query', a: 'Email accounts@activeschool.org.uk — do not use WhatsApp' },
            { s: 'I want to progress my coaching', a: 'Speak to your Area Lead about the UKAG pathway' },
            { s: 'A child arrives not on the register', a: 'Do not turn them away. Call Area Lead. Record everything.' },
            { s: 'Something unsafe in the venue', a: 'Do not start the session. Call Area Lead immediately.' },
          ].map(row => <QRRow key={row.s} situation={row.s} action={row.a} />)}
        </Section>

        {/* Key Contacts */}
        <Section icon={Phone} title="Key Contacts">
          <div className="flex flex-col gap-2 pt-2">
            <ContactCard role="Naima — Admin" contact="info@activeschool.org.uk" />
            <ContactCard role="Safeguarding DSL" contact="safeguarding@activeschool.org.uk" />
            <ContactCard role="Accounts & Pay" contact="accounts@activeschool.org.uk" />
            <ContactCard role="Operations Director" contact="ops@activeschool.org.uk" />
            <ContactCard role="National Safeguarding Lead" contact="07814 899151" />
            <ContactCard role="Emergency Services" contact="999" />
          </div>
        </Section>

        {/* Footer */}
        <div className="bg-[#1a3a6b] rounded-2xl px-4 py-5 text-center mt-2">
          <p className="text-white font-bold">Thank you for being part of Active School Org.</p>
          <p className="text-white/60 text-sm mt-1 leading-relaxed">Together we build safer, stronger, and more inspiring environments for young people through sport.</p>
          <p className="text-white/40 text-xs mt-3">Version 1.0 · 2026 · Confidential — For Coaches Only</p>
        </div>

      </div>
    </div>
  )
}
