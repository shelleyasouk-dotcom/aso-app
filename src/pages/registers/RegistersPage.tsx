import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardList, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import type { SessionRegister, School } from '../../types'
import { canViewAllSchools } from '../../lib/roles'

interface RegisterWithSchool extends SessionRegister {
  school?: School
}

export function RegistersPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [registers, setRegisters] = useState<RegisterWithSchool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    loadRegisters()
  }, [profile])

  async function loadRegisters() {
    let query = supabase
      .from('session_registers')
      .select('*, school:schools(*), lead_coach:profiles(*)')
      .order('session_date', { ascending: false })
      .limit(50)

    // Coaches only see their schools
    if (!canViewAllSchools(profile!.role) && profile!.role !== 'area_lead') {
      const { data: assignments } = await supabase
        .from('staff_school_assignments')
        .select('school_id')
        .eq('staff_id', profile!.id)
      const schoolIds = assignments?.map((a: any) => a.school_id) ?? []
      if (schoolIds.length > 0) query = query.in('school_id', schoolIds)
    }

    const { data } = await query
    if (data) setRegisters(data)
    setLoading(false)
  }

  return (
    <Layout title="Session Registers">
      <div className="px-4 pt-6 flex flex-col gap-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/registers/new')}
        >
          <Plus size={20} /> New Register
        </Button>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : registers.length === 0 ? (
          <Card className="text-center py-8">
            <ClipboardList size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No registers yet. Start a new session register.</p>
          </Card>
        ) : (
          registers.map(reg => (
            <Card
              key={reg.id}
              onClick={() => navigate(`/registers/${reg.id}`)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-[#1a3a6b]">{reg.school?.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar size={13} />
                    {new Date(reg.session_date).toLocaleDateString('en-GB', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Led by {(reg as any).lead_coach?.full_name}
                  </p>
                </div>
                <Badge color="blue">View</Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    </Layout>
  )
}
