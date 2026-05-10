import { useNavigate } from 'react-router-dom'
import { Clock, LogIn, LogOut, UserCircle, ReceiptText, FileText, Megaphone, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ROLE_LABELS } from '../../lib/roles'

interface SectionProps {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}

function Section({ icon: Icon, title, children }: SectionProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#f4f6f9] rounded-xl flex items-center justify-center shrink-0">
            <Icon size={18} className="text-[#1a3a6b]" />
          </div>
          <p className="font-semibold text-[#1a3a6b] text-sm">{title}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 flex flex-col gap-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3 pt-3">
      <div className="w-6 h-6 bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">{number}</span>
      </div>
      <p className="text-sm text-gray-700 leading-snug">{text}</p>
    </div>
  )
}

function Note({ text }: { text: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">
      <p className="text-xs text-amber-800">{text}</p>
    </div>
  )
}

export function GuidePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const role = profile?.role

  const isAdmin = role === 'director' || role === 'area_lead'

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Header */}
      <div className="bg-[#1a3a6b] px-4 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 text-sm mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold text-white">App Guide</h1>
        <p className="text-white/60 text-sm mt-1">
          {profile ? `You're signed in as ${ROLE_LABELS[profile.role]}` : 'How to use the ASO app'}
        </p>
      </div>

      <div className="px-4 py-6 flex flex-col gap-3 pb-12">

        {/* Install the app */}
        <Section icon={LogIn} title="Install the app on your phone">
          <Step number={1} text="iPhone: Open the app in Safari, tap the share button (box with arrow), then tap Add to Home Screen." />
          <Step number={2} text="Android: Open in Chrome, tap the three dots menu, then tap Add to Home Screen." />
          <Step number={3} text="Tap the ASO icon on your home screen to open it like a normal app." />
          <Note text="Must use Safari on iPhone and Chrome on Android for this to work." />
        </Section>

        {/* Clock in/out */}
        <Section icon={Clock} title="How to clock in and out">
          <Step number={1} text="Tap Clock In / Out on the home screen." />
          <Step number={2} text="Select the school you're working at from the list." />
          <Step number={3} text="Tap the big Clock In button when your session starts." />
          <Step number={4} text="Open the app again after your session and tap Clock Out." />
          <Note text="Always clock in at the start and out at the end — this is how your hours are recorded. If you forget, message your Area Lead and they can fix it." />
        </Section>

        {/* Profile and ID card */}
        <Section icon={UserCircle} title="Your digital ID card and profile">
          <Step number={1} text="Tap My Profile on the home screen." />
          <Step number={2} text="Tap Upload Photo and choose a clear photo of your face." />
          <Step number={3} text="Fill in your DBS number, DBS expiry, Safeguarding expiry, and First Aid expiry." />
          <Step number={4} text="Tap Save Details." />
          <Step number={5} text="Your digital ID card will appear at the top — you can show it on your phone to schools." />
          <Note text="Keep your DBS expiry date up to date. The app will warn you when it's getting close." />
        </Section>

        {/* Expenses */}
        <Section icon={ReceiptText} title="Submitting expenses">
          <Step number={1} text="Tap Expenses on the home screen." />
          <Step number={2} text="Tap Submit Expense." />
          <Step number={3} text="Choose Mileage (driving), Travel (trains/buses), or Other." />
          <Step number={4} text="For mileage: enter the number of miles — the amount works out automatically at 45p per mile." />
          <Step number={5} text="Add a description (e.g. Drive to St Peter's School) and the date." />
          <Step number={6} text="Tap Submit. Your Area Lead will approve or reject it." />
          <Note text="Submit your expenses in the same week if possible." />
        </Section>

        {/* Announcements */}
        <Section icon={Megaphone} title="Announcements">
          <Step number={1} text="Pinned announcements appear on your home screen automatically — no need to go anywhere." />
          <Step number={2} text="Tap View all next to the announcements heading to see everything." />
          <Step number={3} text="Or tap Announcements from the menu to browse all updates." />
        </Section>

        {/* Documents */}
        <Section icon={FileText} title="Finding documents and policies">
          <Step number={1} text="Tap Documents on the home screen." />
          <Step number={2} text="Browse by category or scroll through the list." />
          <Step number={3} text="Tap the download icon on any document to open it." />
        </Section>

        {/* Admin sections — only for area leads and directors */}
        {isAdmin && (
          <>
            <div className="mt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Admin Features</p>
            </div>

            <Section icon={LogOut} title="Fixing a missed clock-in or clock-out">
              <Step number={1} text="Tap Timesheets from the home screen." />
              <Step number={2} text="Use the filter at the top to find the coach." />
              <Step number={3} text="Tap the pencil icon on the record to edit the time or school." />
              <Step number={4} text="Tap the bin icon to delete a wrong record." />
              <Step number={5} text="Tap Add Missing Clock Record at the top to create one from scratch." />
            </Section>

            <Section icon={UserCircle} title="Adding a new staff member">
              <Step number={1} text="Tap Admin Panel, then tap Staff." />
              <Step number={2} text="Tap Add Staff Member and fill in their name, email, password, and role." />
              <Step number={3} text="Tap Create Account — their login is live immediately." />
              <Step number={4} text="Find them in the list and tap Schools to assign them to their school(s)." />
              <Note text="For adding lots of staff at once, use Admin Panel → Bulk Import → Staff." />
            </Section>

            <Section icon={ReceiptText} title="Approving expenses">
              <Step number={1} text="Tap Admin Panel, then tap Expenses." />
              <Step number={2} text="The banner at the top shows how many are waiting." />
              <Step number={3} text="Tap any expense to expand it." />
              <Step number={4} text="Add an optional note and tap Approve or Reject." />
            </Section>
          </>
        )}

        {/* Contact */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">Still stuck? Get in touch.</p>
          <a href="mailto:info@activeschool.org.uk" className="text-sm font-semibold text-[#1a3a6b] mt-1 inline-block">
            info@activeschool.org.uk
          </a>
        </div>
      </div>
    </div>
  )
}
