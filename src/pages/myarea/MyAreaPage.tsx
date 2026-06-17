import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Award,
  Settings,
  Users,
  School,
  KeyRound,
  Megaphone,
  FileText,
  UserCircle,
  ReceiptText,
  Building2,
  UsersRound,
  CalendarOff,
  CalendarCheck,
  HelpCircle,
  ShieldAlert,
  BookOpen,
  GraduationCap,
  Medal,
  CalendarDays,
  Dumbbell,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { ROLE_LABELS } from '../../lib/roles'

interface Tile {
  label: string
  description: string
  icon: React.ElementType
  path: string
  color: string
}

function TileSection({ title, tiles }: { title: string; tiles: Tile[] }) {
  const navigate = useNavigate()
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => {
          const Icon = tile.icon
          return (
            <Card key={tile.path} onClick={() => navigate(tile.path)} className="flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tile.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-[#1a3a6b] text-sm leading-tight">{tile.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{tile.description}</p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function MyAreaPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  if (!profile) return null

  const role = profile.role
  const isLead = role === 'lead_coach' || role === 'area_lead' || role === 'director'

  const isAreaLead = role === 'area_lead' || role === 'director'
  const isDirector = role === 'director'
  const isOutreach = role === 'outreach_worker'

  const personalTiles: Tile[] = [
    { label: 'My Profile', description: 'Digital ID & certificates', icon: UserCircle, path: '/profile', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'My Timesheet', description: 'View your clock records', icon: Clock, path: '/my-timesheet', color: 'bg-blue-50 text-[#1a3a6b]' },
    { label: 'My Availability', description: 'Locations & days I can cover', icon: CalendarDays, path: '/coach-pool', color: 'bg-teal-50 text-teal-700' },
    { label: 'Documents', description: 'Policies & handbooks', icon: FileText, path: '/documents', color: 'bg-sky-50 text-sky-700' },
    { label: 'Expenses', description: 'Submit travel & mileage', icon: ReceiptText, path: '/expenses', color: 'bg-orange-50 text-orange-700' },
    { label: 'Absences', description: 'Log & manage requests', icon: CalendarOff, path: '/absences', color: 'bg-rose-50 text-rose-700' },
  ]

  const juniorCoachTiles: Tile[] = [
    { label: 'Semester Plans', description: 'Plans & feedback by week', icon: BookOpen, path: '/lesson-plans', color: 'bg-[#1a3a6b]/5 text-[#1a3a6b]' },
    { label: 'UKAG Library', description: 'Level 1–6 coaching plans', icon: GraduationCap, path: '/ukag', color: 'bg-violet-50 text-violet-800' },
    { label: 'Awards', description: 'Track UKAG progress', icon: Award, path: '/awards', color: 'bg-green-50 text-green-800' },
    { label: 'Apparatus CPD', description: 'Floor, Bars, Beam & Vault', icon: Dumbbell, path: '/course/apparatus', color: 'bg-rose-50 text-rose-700' },
  ]

  const coachingTiles: Tile[] = [
    { label: 'Semester Plans', description: 'Plans & feedback by week', icon: BookOpen, path: '/lesson-plans', color: 'bg-[#1a3a6b]/5 text-[#1a3a6b]' },
    { label: 'UKAG Library', description: 'Level 1–6 coaching plans', icon: GraduationCap, path: '/ukag', color: 'bg-violet-50 text-violet-800' },
    { label: 'Awards', description: 'Track UKAG progress', icon: Award, path: '/awards', color: 'bg-green-50 text-green-800' },
    { label: 'Leadership Course', description: 'Lead Coach certification', icon: Medal, path: '/course/leadership', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Apparatus CPD', description: 'Floor, Bars, Beam & Vault', icon: Dumbbell, path: '/course/apparatus', color: 'bg-rose-50 text-rose-700' },
    { label: 'Area Lead Course', description: 'Regional leadership programme', icon: GraduationCap, path: '/course/area-lead', color: 'bg-violet-50 text-violet-700' },
    { label: 'School Coaches', description: 'Staff at your schools', icon: CalendarCheck, path: '/sessions', color: 'bg-teal-50 text-teal-700' },
    { label: 'Incident Reports', description: 'Log accidents & incidents', icon: ShieldAlert, path: '/incidents', color: 'bg-red-50 text-red-700' },
    ...(role === 'lead_coach' ? [{ label: 'Staff Timesheets', description: 'View your team\'s hours', icon: Users, path: '/timesheets', color: 'bg-purple-50 text-purple-800' }] : []),
  ]

  const managementTiles: Tile[] = [
    { label: 'Staff Timesheets', description: 'Payroll & all staff hours', icon: Users, path: '/timesheets', color: 'bg-purple-50 text-purple-800' },
    { label: 'Approve Expenses', description: 'Review & authorise claims', icon: ReceiptText, path: '/expenses/admin', color: 'bg-amber-50 text-amber-700' },
    { label: 'Coach Pool', description: 'Available coaches', icon: UsersRound, path: '/coach-pool', color: 'bg-violet-50 text-violet-700' },
    ...(isOutreach || isAreaLead
      ? [{ label: 'School Outreach', description: 'CRM & school contacts', icon: Building2, path: '/crm', color: 'bg-teal-50 text-teal-700' }]
      : []),
  ]

  const adminTiles: Tile[] = [
    { label: 'Area Schools', description: 'Schools in your area', icon: School, path: '/admin/area-schools', color: 'bg-sky-50 text-sky-700' },
    { label: 'Announcements', description: 'Post & manage updates', icon: Megaphone, path: '/admin/announcements', color: 'bg-pink-50 text-pink-700' },
    { label: 'Admin Panel', description: 'Manage staff & schools', icon: Settings, path: '/admin', color: 'bg-gray-50 text-gray-700' },
  ]

  return (
    <Layout title="Coach Zone">
      <div className="px-4 pt-6 pb-6 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1a3a6b]">Coach Zone</h2>
          <p className="text-sm text-gray-500 mt-0.5">{ROLE_LABELS[role]}</p>
        </div>

        <TileSection title="Personal" tiles={personalTiles} />

        {isLead && <TileSection title="Coaching" tiles={coachingTiles} />}
        {(role === 'assistant_coach' || role === 'junior_coach') && <TileSection title="Coaching" tiles={juniorCoachTiles} />}

        {(isAreaLead || isOutreach) && (
          <TileSection
            title="Management"
            tiles={isOutreach
              ? [
                  { label: 'Coach Pool', description: 'Available coaches', icon: UsersRound, path: '/coach-pool', color: 'bg-violet-50 text-violet-700' },
                  { label: 'School Outreach', description: 'CRM & school contacts', icon: Building2, path: '/crm', color: 'bg-teal-50 text-teal-700' },
                ]
              : managementTiles
            }
          />
        )}

        {isAreaLead && <TileSection title="Admin" tiles={adminTiles} />}

        {isDirector && (
          <TileSection
            title="Director"
            tiles={[
              { label: 'School Outreach', description: 'CRM & school contacts', icon: Building2, path: '/crm', color: 'bg-teal-50 text-teal-700' },
            ]}
          />
        )}

        <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
          <button
            onClick={() => navigate('/guide')}
            className="flex items-center gap-2 text-sm font-semibold text-[#1a3a6b] bg-[#1a3a6b]/8 px-4 py-2.5 rounded-xl hover:bg-[#1a3a6b]/15 transition-colors"
          >
            <HelpCircle size={16} /> How to use this app
          </button>
          <button
            onClick={() => navigate('/change-password')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1a3a6b] transition-colors"
          >
            <KeyRound size={14} /> Change my password
          </button>
          <a
            href="mailto:info@activeschool.org.uk"
            className="text-sm text-gray-400 hover:text-[#1a3a6b] transition-colors"
          >
            info@activeschool.org.uk
          </a>
        </div>
      </div>
    </Layout>
  )
}
