import { useNavigate } from 'react-router-dom'
import { School, Users, BookOpen, Upload, MapPin, Megaphone, FileText, ReceiptText, Building2, UsersRound, ShieldAlert, CalendarDays, CreditCard, Tag, Download, Briefcase, ClipboardList, Tent } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { canManageSchools } from '../../lib/roles'

export function AdminPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  if (!profile) return null

  const isDirector = canManageSchools(profile.role)

  const sections = [
    ...(isDirector ? [{
      label: 'Schools',
      description: 'Add, edit, or remove schools',
      icon: School,
      path: '/admin/schools',
      color: 'bg-blue-50 text-[#1a3a6b]',
    }] : []),
    {
      label: 'Documents',
      description: 'Upload policies, handbooks & forms',
      icon: FileText,
      path: '/documents',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Announcements',
      description: 'Post messages and updates for staff',
      icon: Megaphone,
      path: '/admin/announcements',
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Area Schools',
      description: isDirector ? 'View schools by area' : 'View your area schools & coaches',
      icon: MapPin,
      path: '/admin/area-schools',
      color: 'bg-purple-50 text-purple-800',
    },
    {
      label: 'Staff',
      description: isDirector ? 'Manage staff accounts and roles' : 'View staff and assign to schools',
      icon: Users,
      path: '/admin/staff',
      color: 'bg-yellow-50 text-[#1a3a6b]',
    },
    {
      label: 'Children',
      description: 'Add, edit, or remove children',
      icon: BookOpen,
      path: '/admin/children',
      color: 'bg-green-50 text-green-800',
    },
    {
      label: 'Import Pupils',
      description: 'Upload Wix registration CSV to enrol pupils',
      icon: Upload,
      path: '/admin/import-pupils',
      color: 'bg-yellow-50 text-[#1a3a6b]',
    },
    {
      label: 'Expenses',
      description: 'Review and authorise staff expenses',
      icon: ReceiptText,
      path: '/expenses/admin',
      color: 'bg-orange-50 text-orange-700',
    },
    {
      label: 'School Outreach',
      description: 'School contact database and outreach CRM',
      icon: Building2,
      path: '/crm',
      color: 'bg-teal-50 text-teal-700',
    },
    {
      label: 'Coach Pool',
      description: 'Coaches available and waiting for locations',
      icon: UsersRound,
      path: '/coach-pool',
      color: 'bg-violet-50 text-violet-700',
    },
    {
      label: 'Incident Reports',
      description: 'Review and sign off accident & incident reports',
      icon: ShieldAlert,
      path: '/incidents',
      color: 'bg-red-50 text-red-700',
    },
    {
      label: 'Club Terms',
      description: 'Manage term dates, capacity & booking windows',
      icon: CalendarDays,
      path: '/admin/club-terms',
      color: 'bg-cyan-50 text-cyan-700',
    },
    {
      label: 'Bookings',
      description: 'View all parent bookings and revenue',
      icon: CreditCard,
      path: '/admin/bookings',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Discount Codes',
      description: 'Create and manage discount codes for bookings',
      icon: Tag,
      path: '/admin/discount-codes',
      color: 'bg-yellow-50 text-yellow-700',
    },
    {
      label: 'Data Exports',
      description: 'Download staff, parent & children contact lists as CSV',
      icon: Download,
      path: '/admin/data-exports',
      color: 'bg-slate-50 text-slate-700',
    },
    {
      label: 'Job Adverts',
      description: 'Post and manage public job vacancies on the careers page',
      icon: Briefcase,
      path: '/admin/job-adverts',
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Applications',
      description: 'View and manage online job applications and coach pool entries',
      icon: ClipboardList,
      path: '/admin/job-applications',
      color: 'bg-pink-50 text-pink-700',
    },
    {
      label: 'Holiday Camps',
      description: 'Add and manage summer, Easter & holiday club listings',
      icon: Tent,
      path: '/admin/holiday-camps',
      color: 'bg-amber-50 text-amber-700',
    },
  ]

  return (
    <Layout title="Admin Panel">
      <div className="px-4 pt-6 flex flex-col gap-4">
        <p className="text-gray-500 text-sm">
          {isDirector ? 'Director tools — manage your organisation.' : 'Area Lead tools — manage your schools.'}
        </p>

        {sections.map(s => {
          const Icon = s.icon
          return (
            <Card key={s.path} onClick={() => navigate(s.path)}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="font-bold text-[#1a3a6b]">{s.label}</p>
                  <p className="text-sm text-gray-400">{s.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </Layout>
  )
}
