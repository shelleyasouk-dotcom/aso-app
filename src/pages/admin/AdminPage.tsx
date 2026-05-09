import { useNavigate } from 'react-router-dom'
import { School, Users, BookOpen, Upload, MapPin } from 'lucide-react'
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
      label: 'Bulk Import',
      description: 'Upload schools, staff & children via CSV',
      icon: Upload,
      path: '/admin/bulk-import',
      color: 'bg-yellow-50 text-[#1a3a6b]',
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
