import { useNavigate } from 'react-router-dom'
import {
  Clock, LogIn, LogOut, UserCircle, ReceiptText, FileText, Megaphone,
  ChevronDown, ChevronUp, ArrowLeft, CalendarOff, CalendarCheck,
  ClipboardList, Award, Building2, UsersRound, FolderOpen, Bell,
} from 'lucide-react'
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
  const isManager = isAdmin || role === 'lead_coach'
  const canOutreach = role === 'director' || role === 'area_lead' || role === 'outreach_worker'
  const canPool = role === 'director' || role === 'area_lead' || role === 'outreach_worker'

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Header */}
      <div className="bg-[#1a3a6b] px-4 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 text-sm mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold text-white">App Guide</h1>
        <p className="text-white/60 text-sm mt-1">
          {profile ? `You're signed in as ${ROLE_LABELS[profile.role]}` : 'How to use the ASO Coaching app'}
        </p>
      </div>

      <div className="px-4 py-6 flex flex-col gap-3 pb-12">

        {/* ── ALL STAFF ─────────────────────────────────────── */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Getting started</p>

        <Section icon={LogIn} title="Install the app on your phone">
          <Step number={1} text="iPhone: Open the app in Safari, tap the share button (box with arrow), then tap Add to Home Screen." />
          <Step number={2} text="Android: Open in Chrome, tap the three dots menu, then tap Add to Home Screen." />
          <Step number={3} text="Tap the ASO icon on your home screen to open it like a normal app — no App Store needed." />
          <Note text="Must use Safari on iPhone and Chrome on Android for Add to Home Screen to work." />
        </Section>

        <Section icon={Bell} title="Notifications">
          <Step number={1} text="The bell icon at the top right of every screen shows a red badge when you have unread notifications." />
          <Step number={2} text="Tap the bell to open the notifications panel." />
          <Step number={3} text="Tap any notification to mark it as read — absence notifications will take you straight to the Absences page." />
          <Step number={4} text="Tap Mark all read to clear the badge at once." />
          <Note text="Notifications are sent when an absence request is submitted or when a decision (approved/rejected) is made." />
        </Section>

        <Section icon={Clock} title="How to clock in and out">
          <Step number={1} text="Tap Clock In / Out on the home screen." />
          <Step number={2} text="Select the school you're working at from the list." />
          <Step number={3} text="Tap the big Clock In button when your session starts." />
          <Step number={4} text="Open the app again after your session and tap Clock Out." />
          <Note text="Always clock in at the start and out at the end — this is how your hours are recorded. If you forget, message your Area Lead and they can fix it." />
        </Section>

        <Section icon={CalendarOff} title="Logging an absence">
          <Step number={1} text="Tap Absences on the home screen." />
          <Step number={2} text="Tap Log Absence." />
          <Step number={3} text="Choose the absence type: Sick Leave, Annual Leave, Personal, Emergency, Training, or Other." />
          <Step number={4} text="Set the start date and (if more than one day) the end date." />
          <Step number={5} text="Add an optional reason, then tap Submit Request." />
          <Step number={6} text="Your Area Lead will receive a notification and approve or reject the request." />
          <Step number={7} text="You'll get a notification once a decision is made." />
          <Note text="You can see all your past and pending absences in the My Absences tab." />
        </Section>

        <Section icon={UserCircle} title="Your digital ID card and profile">
          <Step number={1} text="Tap My Profile on the home screen." />
          <Step number={2} text="Tap Upload Photo and choose a clear photo of your face." />
          <Step number={3} text="Fill in your DBS number, DBS expiry, Safeguarding expiry, and First Aid expiry." />
          <Step number={4} text="Tap Save Details." />
          <Step number={5} text="Your digital ID card appears at the top — show it on your phone at schools." />
          <Note text="Keep your DBS expiry date up to date. The app will warn you when it's getting close." />
        </Section>

        <Section icon={FolderOpen} title="Uploading your certificates and documents">
          <Step number={1} text="Tap My Profile on the home screen." />
          <Step number={2} text="Scroll down to the Certificates section to upload coaching certificates with issued and expiry dates." />
          <Step number={3} text="Scroll further to the Onboarding Documents section for contracts, right to work, references, DBS documents, and other files." />
          <Step number={4} text="Tap Add Document, give it a title, choose a category, and pick the file." />
          <Step number={5} text="Tap Upload — the file is saved securely and can be viewed any time." />
        </Section>

        <Section icon={ReceiptText} title="Submitting expenses">
          <Step number={1} text="Tap Expenses on the home screen." />
          <Step number={2} text="Tap Submit Expense." />
          <Step number={3} text="Choose Mileage (driving), Travel (trains/buses), or Other." />
          <Step number={4} text="For mileage: enter the number of miles — the amount is calculated automatically at 45p per mile." />
          <Step number={5} text="Add a description (e.g. Drive to St Peter's School) and the date." />
          <Step number={6} text="Tap Submit. Your Area Lead will approve or reject it." />
          <Note text="Submit expenses in the same week where possible." />
        </Section>

        <Section icon={Award} title="UKAG Awards — tracking progress">
          <Step number={1} text="Tap Awards on the home screen." />
          <Step number={2} text="Search for a child by name or browse by school." />
          <Step number={3} text="Tap a child's name to view their skill profile." />
          <Step number={4} text="Tick skills as they are demonstrated during sessions." />
          <Step number={5} text="When enough skills are achieved, you can award the next UKAG level." />
        </Section>

        <Section icon={Megaphone} title="Announcements">
          <Step number={1} text="Pinned announcements appear on your home screen automatically." />
          <Step number={2} text="Tap View all next to the announcements heading to see everything." />
          <Step number={3} text="Or tap Announcements from the menu to browse all updates." />
        </Section>

        <Section icon={FileText} title="Finding documents and policies">
          <Step number={1} text="Tap Documents on the home screen." />
          <Step number={2} text="Browse by category or scroll through the list." />
          <Step number={3} text="Tap the download icon on any document to open it." />
        </Section>

        {/* ── LEAD COACHES AND ABOVE ────────────────────────── */}
        {isManager && (
          <>
            <div className="mt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Lead Coach & Area Lead</p>
            </div>

            <Section icon={CalendarCheck} title="My Sessions — seeing who's at your locations">
              <Step number={1} text="Tap My Sessions on the home screen." />
              <Step number={2} text="The Live tab shows every school you're assigned to, with a green dot next to staff who are currently clocked in." />
              <Step number={3} text="You can manually clock a staff member In or Out from here if they forgot." />
              <Step number={4} text="The elapsed time shows how long each person has been on shift." />
              <Step number={5} text="Tap Refresh to get the latest status." />
              <Step number={6} text="The History tab shows past clock records — use it to check or correct hours." />
              <Note text="Only schools assigned to you appear here. Contact Admin if a school is missing." />
            </Section>

            <Section icon={ClipboardList} title="Taking a session register">
              <Step number={1} text="Tap Session Register on the home screen." />
              <Step number={2} text="Tap New Register." />
              <Step number={3} text="Select the school and date." />
              <Step number={4} text="Tick the children who are present." />
              <Step number={5} text="Tap Save Register." />
              <Step number={6} text="Past registers appear in the list — tap any to view or edit." />
            </Section>

            {isAdmin && (
              <Section icon={CalendarOff} title="Approving team absences">
                <Step number={1} text="Tap Absences on the home screen." />
                <Step number={2} text="Tap the Team tab — a red badge shows how many are waiting." />
                <Step number={3} text="Pending requests are shown at the top. Tap Approve or Reject." />
                <Step number={4} text="You can add an optional note before confirming." />
                <Step number={5} text="The staff member receives a notification with your decision." />
                <Step number={6} text="Tap This Week to see a calendar view of who's absent each day." />
              </Section>
            )}
          </>
        )}

        {/* ── OUTREACH WORKERS AND ABOVE ───────────────────── */}
        {canOutreach && (
          <>
            {!isManager && (
              <div className="mt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Outreach</p>
              </div>
            )}

            <Section icon={Building2} title="School Outreach CRM">
              <Step number={1} text="Tap School Outreach on the home screen." />
              <Step number={2} text="Browse all prospect and active school contacts." />
              <Step number={3} text="Tap a school to view its history, add a call/visit log, and set the next follow-up date." />
              <Step number={4} text="Use the status chips (Prospect, Following Up, Interested, Onboarded) to track progress." />
              <Step number={5} text="Tap Add Contact to add a new school to the pipeline." />
            </Section>
          </>
        )}

        {canPool && (
          <Section icon={UsersRound} title="Coach Pool">
            <Step number={1} text="Tap Coach Pool on the home screen." />
            <Step number={2} text="This shows all coaches who have been interviewed and are waiting for a school placement." />
            <Step number={3} text="Use the status filter to view Available, Placed, or Inactive coaches." />
            <Step number={4} text="Tap a coach card to see their contact details and location preferences." />
            {isAdmin && (
              <>
                <Step number={5} text="Tap Add to Coach Pool to add a new coach." />
                <Step number={6} text="Tap the pencil icon on a card to edit their status or details." />
              </>
            )}
          </Section>
        )}

        {/* ── ADMIN ─────────────────────────────────────────── */}
        {isAdmin && (
          <>
            <div className="mt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Admin Features</p>
            </div>

            <Section icon={LogOut} title="Fixing a missed clock-in or clock-out">
              <Step number={1} text="Tap Timesheets from the home screen (directors and area leads only)." />
              <Step number={2} text="Use the filter at the top to find the staff member." />
              <Step number={3} text="Tap the pencil icon on a record to edit the time or school." />
              <Step number={4} text="Tap the bin icon (then confirm) to delete a wrong record." />
              <Step number={5} text="Tap Add Missing Clock Record at the top to create one from scratch." />
              <Note text="You can also use My Sessions → History tab to edit records for your assigned schools." />
            </Section>

            <Section icon={UserCircle} title="Adding a new staff member">
              <Step number={1} text="Tap Admin Panel, then tap Staff." />
              <Step number={2} text="Tap Add Staff Member and fill in their name, email, password, and role." />
              <Step number={3} text="Tap Create Account — their login is live immediately." />
              <Step number={4} text="Find them in the list and tap the edit icon to assign them to their school(s) and area." />
              <Note text="For adding lots of staff at once, use Admin Panel → Bulk Import → Staff." />
            </Section>

            <Section icon={FolderOpen} title="Viewing a staff member's onboarding documents">
              <Step number={1} text="Tap Admin Panel, then tap Staff." />
              <Step number={2} text="Tap a staff member's name to open their profile." />
              <Step number={3} text="Scroll to the Onboarding Documents section to see their contracts, certificates, DBS documents, and references." />
              <Step number={4} text="Tap the eye icon on any document to open and download it." />
              <Step number={5} text="You can also upload documents on their behalf from this screen." />
            </Section>

            <Section icon={ReceiptText} title="Approving expenses">
              <Step number={1} text="Tap Admin Panel, then tap Expenses." />
              <Step number={2} text="The banner at the top shows how many are waiting for approval." />
              <Step number={3} text="Tap any expense to expand it." />
              <Step number={4} text="Add an optional note and tap Approve or Reject." />
            </Section>

            <Section icon={Megaphone} title="Posting an announcement">
              <Step number={1} text="Tap Admin Panel, then tap Announcements." />
              <Step number={2} text="Tap New Announcement." />
              <Step number={3} text="Add a title, body text, and optional link." />
              <Step number={4} text="Choose an area to target a specific team, or leave blank for everyone." />
              <Step number={5} text="Toggle Pin to keep it at the top of everyone's home screen." />
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
