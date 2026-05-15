import { useState, useEffect } from 'react'
import { ClipboardList, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { SchoolLayout } from '../../components/layout/SchoolLayout'
import { Card } from '../../components/ui/Card'

interface Child { id: string; full_name: string }
interface Entry { id: string; child_id: string; present: boolean; child?: Child }
interface Register {
  id: string
  session_date: string
  notes: string | null
  register_entries: Entry[]
}

export function SchoolRegisterPage() {
  const { profile } = useAuth()
  const [registers, setRegisters] = useState<Register[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.school_id) return
    supabase
      .from('session_registers')
      .select('id, session_date, notes, register_entries(id, child_id, present, children(id, full_name))')
      .eq('school_id', profile.school_id)
      .order('session_date', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Register[]
        setRegisters(rows)
        if (rows.length > 0) setSelectedId(rows[0].id)
        setLoading(false)
      })
  }, [profile?.school_id])

  const selected = registers.find(r => r.id === selectedId)
  const entries = selected?.register_entries ?? []
  const present = entries.filter(e => e.present).length

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <SchoolLayout title="Weekly Register" showBack>
        <div className="px-4 pt-6 flex flex-col gap-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </SchoolLayout>
    )
  }

  return (
    <SchoolLayout title="Weekly Register" showBack>
      <div className="px-4 pt-6 pb-4 flex flex-col gap-4">

        {registers.length === 0 ? (
          <Card className="text-center py-12">
            <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No sessions recorded yet</p>
            <p className="text-sm text-gray-400 mt-1">Registers will appear here after each session.</p>
          </Card>
        ) : (
          <>
            {/* Session picker */}
            {registers.length > 1 && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Session</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                >
                  {registers.map(r => (
                    <option key={r.id} value={r.id}>
                      {formatDate(r.session_date)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selected && (
              <>
                {/* Summary */}
                <Card>
                  <p className="font-bold text-[#1a3a6b]">{formatDate(selected.session_date)}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-sm font-semibold text-gray-700">{present} present</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <XCircle size={16} className="text-red-400" />
                      <span className="text-sm font-semibold text-gray-700">{entries.length - present} absent</span>
                    </div>
                    <span className="text-sm text-gray-400">{entries.length} enrolled</span>
                  </div>
                  {selected.notes && (
                    <p className="text-sm text-gray-500 mt-2 border-t border-gray-100 pt-2">
                      <span className="font-semibold text-gray-600">Coach notes: </span>{selected.notes}
                    </p>
                  )}
                </Card>

                {/* Attendance list */}
                {entries.length === 0 ? (
                  <Card className="text-center py-6">
                    <p className="text-gray-400 text-sm">No entries recorded for this session.</p>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Attendance</p>
                    {[...entries]
                      .sort((a, b) => (a.child?.full_name ?? '').localeCompare(b.child?.full_name ?? ''))
                      .map(entry => (
                        <Card key={entry.id} className="flex items-center gap-3 py-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            entry.present ? 'bg-green-100' : 'bg-red-50'
                          }`}>
                            {entry.present
                              ? <CheckCircle size={18} className="text-green-600" />
                              : <XCircle size={18} className="text-red-400" />
                            }
                          </div>
                          <span className="font-medium text-gray-800 text-sm flex-1">
                            {entry.child?.full_name ?? 'Unknown pupil'}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            entry.present
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-50 text-red-500'
                          }`}>
                            {entry.present ? 'Present' : 'Absent'}
                          </span>
                        </Card>
                      ))
                    }
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>
    </SchoolLayout>
  )
}
