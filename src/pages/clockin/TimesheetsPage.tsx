import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Input'
import type { ClockRecord, Profile, School } from '../../types'
import { ROLE_LABELS } from '../../lib/roles'

interface EnrichedRecord extends ClockRecord {
  staff?: Profile
  school?: School
}

export function TimesheetsPage() {
  const [records, setRecords] = useState<EnrichedRecord[]>([])
  const [staff, setStaff] = useState<Profile[]>([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStaff()
  }, [])

  useEffect(() => {
    loadRecords()
  }, [selectedStaff])

  async function loadStaff() {
    const { data } = await supabase.from('profiles').select('*').order('full_name')
    if (data) setStaff(data)
  }

  async function loadRecords() {
    let query = supabase
      .from('clock_records')
      .select('*, staff:profiles(*), school:schools(*)')
      .order('clock_in', { ascending: false })
      .limit(100)

    if (selectedStaff) query = query.eq('staff_id', selectedStaff)

    const { data } = await query
    if (data) setRecords(data)
    setLoading(false)
  }

  function formatDuration(clockIn: string, clockOut: string | null): string {
    if (!clockOut) return 'Active'
    const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime()
    const hours = Math.floor(ms / 3600000)
    const mins = Math.floor((ms % 3600000) / 60000)
    return `${hours}h ${mins}m`
  }

  // Group records by staff member
  const grouped = records.reduce<Record<string, EnrichedRecord[]>>((acc, rec) => {
    const key = rec.staff_id
    if (!acc[key]) acc[key] = []
    acc[key].push(rec)
    return acc
  }, {})

  return (
    <Layout title="Timesheets" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">
        <Select
          label="Filter by staff member"
          value={selectedStaff}
          onChange={e => setSelectedStaff(e.target.value)}
        >
          <option value="">All staff</option>
          {staff.map(s => (
            <option key={s.id} value={s.id}>{s.full_name}</option>
          ))}
        </Select>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : records.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center">No clock records found.</p>
          </Card>
        ) : (
          Object.entries(grouped).map(([staffId, recs]) => {
            const member = recs[0].staff
            const totalMs = recs
              .filter(r => r.clock_out)
              .reduce((sum, r) => sum + (new Date(r.clock_out!).getTime() - new Date(r.clock_in).getTime()), 0)
            const totalHours = (totalMs / 3600000).toFixed(1)

            return (
              <Card key={staffId}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-[#1a3a6b]">{member?.full_name}</p>
                    <Badge color="blue">{member ? ROLE_LABELS[member.role] : ''}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold text-[#1a3a6b]">{totalHours}h</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {recs.map(rec => (
                    <div key={rec.id} className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{rec.school?.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(rec.clock_in).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {' · '}
                          {new Date(rec.clock_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          {rec.clock_out && ` – ${new Date(rec.clock_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                      </div>
                      <Badge color={rec.clock_out ? 'green' : 'yellow'}>
                        {formatDuration(rec.clock_in, rec.clock_out)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </Layout>
  )
}
