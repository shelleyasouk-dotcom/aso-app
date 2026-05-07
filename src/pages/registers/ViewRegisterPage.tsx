import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, XCircle, Calendar, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import type { SessionRegister, RegisterEntry, Child, Profile, School } from '../../types'

interface FullRegister extends SessionRegister {
  school?: School
  lead_coach?: Profile
  entries?: (RegisterEntry & { child?: Child })[]
}

export function ViewRegisterPage() {
  const { id } = useParams<{ id: string }>()
  const [register, setRegister] = useState<FullRegister | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadRegister(id)
  }, [id])

  async function loadRegister(registerId: string) {
    const { data } = await supabase
      .from('session_registers')
      .select('*, school:schools(*), lead_coach:profiles(*)')
      .eq('id', registerId)
      .single()

    if (data) {
      const { data: entries } = await supabase
        .from('register_entries')
        .select('*, child:children(*)')
        .eq('register_id', registerId)
        .order('child(full_name)')

      setRegister({ ...data, entries: entries ?? [] })
    }
    setLoading(false)
  }

  if (loading) return <Layout title="Register" showBack><div className="p-8 text-center text-gray-400">Loading…</div></Layout>
  if (!register) return <Layout title="Register" showBack><div className="p-8 text-center text-gray-400">Register not found.</div></Layout>

  const present = register.entries?.filter(e => e.present) ?? []
  const absent = register.entries?.filter(e => !e.present) ?? []

  return (
    <Layout title="Register" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">
        {/* Header info */}
        <Card>
          <h2 className="font-bold text-[#1a3a6b] text-lg">{register.school?.name}</h2>
          <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
            <Calendar size={13} />
            {new Date(register.session_date).toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
            <User size={13} /> {register.lead_coach?.full_name}
          </p>
          {register.notes && (
            <div className="mt-3 bg-[#f4f6f9] rounded-xl px-3 py-2">
              <p className="text-xs text-gray-500">Notes</p>
              <p className="text-sm text-gray-700">{register.notes}</p>
            </div>
          )}
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <p className="text-2xl font-bold text-green-600">{present.length}</p>
            <p className="text-xs text-gray-500">Present</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-red-500">{absent.length}</p>
            <p className="text-xs text-gray-500">Absent</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-[#1a3a6b]">{register.entries?.length ?? 0}</p>
            <p className="text-xs text-gray-500">Total</p>
          </Card>
        </div>

        {/* Attendance list */}
        {register.entries && register.entries.length > 0 && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-3">Attendance</h3>
            <div className="flex flex-col gap-2">
              {register.entries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-800">{entry.child?.full_name}</span>
                  {entry.present ? (
                    <Badge color="green">
                      <CheckCircle size={12} className="mr-1" /> Present
                    </Badge>
                  ) : (
                    <Badge color="red">
                      <XCircle size={12} className="mr-1" /> Absent
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
