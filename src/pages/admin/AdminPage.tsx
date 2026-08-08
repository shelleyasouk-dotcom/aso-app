import { useNavigate } from 'react-router-dom'
import {
  School, Users, BookOpen, Upload, MapPin, Megaphone, FileText, ReceiptText,
  Building2, UsersRound, ShieldAlert, Download,
  Briefcase, ClipboardList, Tent, GraduationCap, ChevronRight,
  HeartPulse, BookMarked, Star, ListChecks, ContactRound, ShieldCheck,
  Newspaper, Mail,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { canManageSchools } from '../../lib/roles'

interface Tile {
  label: string
  description: string
  icon: React.ElementType
  path: string
  color: string
}

function TileGroup({ title, tiles }: { title: string; tiles: Tile[] }) {
  const navigate = useNavigate()
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">{title}</p>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        {tiles.map(tile => {
          const Icon = tile.icon
          return (
            <button
              key={tile.path}
              onClick={() => navigate(tile.path)}
              className="w-full flex items-center gap-4 px-4 py-3.5 text-left active:bg-gray-50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tile.color}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1a3a6b] text-sm leading-tight">{tile.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{tile.description}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function AdminPage() {
  const { profile } = useAuth()

  if (!profile) return null

  const isDirector = canManageSchools(profile.role)

  return (
    <Layout title="Admin Panel">
      <div className="px-4 pt-5 pb-10 flex flex-col gap-6">

        <p className="text-sm text-gray-400">
          {isDirector ? 'Director tools — manage your organisation.' : 'Area Lead tools — manage your schools and coaches.'}
        </p>

        {/* Registers & Children */}
        <TileGroup
          title="Registers & Children"
          tiles={[
            {
              label: 'Session Registers',
              description: 'View upcoming sessions, take attendance & manage children',
              icon: ClipboardList,
              path: '/registers',
              color: 'bg-blue-50 text-[#1a3a6b]',
            },
            {
              label: 'Children',
              description: 'View, add, or edit children at your schools',
              icon: BookOpen,
              path: '/admin/children',
              color: 'bg-green-50 text-green-800',
            },
            {
              label: 'Import from Wix',
              description: 'Upload a Wix participant CSV to create sessions & enrol children',
              icon: Upload,
              path: '/registers/import',
              color: 'bg-yellow-50 text-[#1a3a6b]',
            },
            {
              label: 'Incident Reports',
              description: 'Review and sign off accident & incident reports',
              icon: ShieldAlert,
              path: '/incidents',
              color: 'bg-red-50 text-red-700',
            },
          ]}
        />

        {/* Onboarding */}
        <TileGroup
          title="Onboarding"
          tiles={[
            {
              label: 'Coach Onboarding',
              description: 'Track certificate uploads, handbook sign-off and contract signing for new coaches',
              icon: ListChecks,
              path: '/admin/onboarding',
              color: 'bg-emerald-50 text-emerald-700',
            },
          ]}
        />

        {/* Staff & Schools */}
        <TileGroup
          title="Staff & Schools"
          tiles={[
            {
              label: 'Staff',
              description: isDirector ? 'Manage staff accounts and roles' : 'View staff and assign to schools',
              icon: Users,
              path: '/admin/staff',
              color: 'bg-yellow-50 text-[#1a3a6b]',
            },
            {
              label: 'Area Schools',
              description: isDirector ? 'View and manage schools by area' : 'Your schools and their coaches',
              icon: MapPin,
              path: '/admin/area-schools',
              color: 'bg-purple-50 text-purple-800',
            },
            ...(isDirector ? [{
              label: 'Schools',
              description: 'Add, edit, or remove schools',
              icon: School,
              path: '/admin/schools',
              color: 'bg-blue-50 text-[#1a3a6b]',
            }] : []),
          ]}
        />

        {/* Coaching */}
        <TileGroup
          title="Coaching"
          tiles={[
            {
              label: 'Lesson Plans',
              description: 'Create weekly plans and view coach session feedback',
              icon: GraduationCap,
              path: '/admin/lesson-plans',
              color: 'bg-[#1a3a6b]/5 text-[#1a3a6b]',
            },
          ]}
        />

        {/* Finance */}
        <TileGroup
          title="Finance"
          tiles={[
            {
              label: 'Expenses',
              description: 'Review and authorise staff expenses',
              icon: ReceiptText,
              path: '/expenses/admin',
              color: 'bg-orange-50 text-orange-700',
            },
          ]}
        />

        {/* School Portal */}
        <TileGroup
          title="School Portal"
          tiles={[
            {
              label: 'Shared Documents',
              description: 'Upload policies, insurance & guidance visible to all schools',
              icon: FileText,
              path: '/admin/school-shared-docs',
              color: 'bg-blue-50 text-blue-700',
            },
            {
              label: 'School Portals',
              description: 'Per-school docs, partnership agreements, registers & portal accounts',
              icon: School,
              path: '/admin/area-schools',
              color: 'bg-indigo-50 text-indigo-700',
            },
            {
              label: 'Safeguarding & Contacts',
              description: 'ASO DSL/DDSL details and useful contacts shown to schools',
              icon: ShieldCheck,
              path: '/admin/org-contacts',
              color: 'bg-green-50 text-green-700',
            },
          ]}
        />

        {/* Communications */}
        <TileGroup
          title="Communications"
          tiles={[
            {
              label: 'Announcements',
              description: 'Post messages and updates for staff',
              icon: Megaphone,
              path: '/admin/announcements',
              color: 'bg-amber-50 text-amber-700',
            },
            {
              label: 'Documents',
              description: 'Upload policies, handbooks & forms',
              icon: FileText,
              path: '/documents',
              color: 'bg-blue-50 text-blue-700',
            },
          ]}
        />

        {/* Recruitment */}
        <TileGroup
          title="Recruitment"
          tiles={[
            {
              label: 'Job Adverts',
              description: 'Post and manage public job vacancies on the careers page',
              icon: Briefcase,
              path: '/admin/job-adverts',
              color: 'bg-indigo-50 text-indigo-700',
            },
            {
              label: 'Applications',
              description: 'View job applications and coach pool entries',
              icon: ClipboardList,
              path: '/admin/job-applications',
              color: 'bg-pink-50 text-pink-700',
            },
            {
              label: 'Coach Pool',
              description: 'Coaches available and waiting for placements',
              icon: UsersRound,
              path: '/coach-pool',
              color: 'bg-violet-50 text-violet-700',
            },
            {
              label: 'Export Contacts',
              description: 'Download staff & coach pool contacts as a Brevo CSV',
              icon: ContactRound,
              path: '/admin/contact-export',
              color: 'bg-emerald-50 text-emerald-700',
            },
          ]}
        />

        {/* Content */}
        <TileGroup
          title="Content"
          tiles={[
            {
              label: 'Blog & News',
              description: 'Write and publish articles, news and updates for the public website',
              icon: Newspaper,
              path: '/admin/blog',
              color: 'bg-sky-50 text-sky-700',
            },
            {
              label: 'Newsletters',
              description: 'Sync sent Brevo campaigns to the newsletter archive on the website',
              icon: Mail,
              path: '/admin/newsletters',
              color: 'bg-violet-50 text-violet-700',
            },
          ]}
        />

        {/* Outreach & Growth */}
        <TileGroup
          title="Outreach & Growth"
          tiles={[
            {
              label: 'School Outreach',
              description: 'School contact database and outreach CRM',
              icon: Building2,
              path: '/crm',
              color: 'bg-teal-50 text-teal-700',
            },
            {
              label: 'Holiday Camps',
              description: 'Add and manage summer, Easter & holiday club listings',
              icon: Tent,
              path: '/admin/holiday-camps',
              color: 'bg-amber-50 text-amber-700',
            },
          ]}
        />

        {/* Operations */}
        <TileGroup
          title="Operations"
          tiles={[
            {
              label: 'School Health Scores',
              description: 'RAG rating for every school — spot problems early',
              icon: HeartPulse,
              path: '/admin/school-health-scores',
              color: 'bg-rose-50 text-rose-700',
            },
            {
              label: 'Lessons Learned',
              description: 'Log of significant failures and the processes changed',
              icon: BookMarked,
              path: '/admin/lessons-learned',
              color: 'bg-[#1a3a6b]/5 text-[#1a3a6b]',
            },
          ]}
        />

        {/* Data */}
        <TileGroup
          title="Data"
          tiles={[
            {
              label: 'Data Exports',
              description: 'Download staff, parent & children contact lists as CSV',
              icon: Download,
              path: '/admin/data-exports',
              color: 'bg-slate-50 text-slate-700',
            },
            {
              label: 'Parent Feedback',
              description: 'Star ratings and comments from parents on the community hub',
              icon: Star,
              path: '/admin/feedback',
              color: 'bg-yellow-50 text-yellow-600',
            },
          ]}
        />

      </div>
    </Layout>
  )
}
