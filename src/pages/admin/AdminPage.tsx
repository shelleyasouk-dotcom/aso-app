import { useNavigate } from 'react-router-dom'
import { School, Users, BookOpen } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'

export function AdminPage() {
  const navigate = useNavigate()

  const sections = [
    {
      label: 'Schools',
      description: 'Add, edit, or remove schools',
      icon: School,
      path: '/admin/schools',
      color: 'bg-blue-50 text-[#1a3a6b]',
    },
    {
      label: 'Staff',
      description: 'Manage staff accounts and roles',
      icon: Users,
      path: '/admin/staff',
      color: 'bg-yellow-50 text-[#1a3a6b]',
    },
    {
      label: 'Children',
      description: 'Register children at schools',
      icon: BookOpen,
      path: '/admin/children',
      color: 'bg-green-50 text-green-800',
    },
  ]

  return (
    <Layout title="Admin Panel">
      <div className="px-4 pt-6 flex flex-col gap-4">
        <p className="text-gray-500 text-sm">Director tools — manage your organisation.</p>

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
