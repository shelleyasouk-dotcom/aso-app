import { useState, useEffect } from 'react'
import { Clock, MapPin, CheckCircle, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Input'
import type { School, ClockRecord } from '../../types'

const CUSTOM_ID = '__custom__'

export function ClockInPage() {
  const { profile } = useAuth()
  const canClockAnywhere = profile?.can_clock_anywhere ?? false

  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [activeRecord, setActiveRecord] = useState<ClockRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<'in' | 'out' | null>(null)
  const [clockError, setClockError] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!profile) return
    loadSchools()
    checkActiveSession()
  }, [profile])

  async function loadSchools() {
    if (canClockAnywhere) {
      const { data } = await supabase.from('schools').select('*').order('name')
      if (data) {
        setSchools(data)
        if (data.length === 1) setSelectedSchoolId(data[0].id)
      }
    } else {
      const { data } = await supabase
        .from('staff_school_assignments')
        .select('school:schools(*)')
        .eq('staff_id', profile!.id)

      if (data) {
        const schoolList = data.map((d: any) => d.school).filter(Boolean) as School[]
        setSchools(schoolList)
        if (schoolList.length === 1) setSelectedSchoolId(schoolList[0].id)
      }
    }
    setLoading(false)
  }

  async function checkActiveSession() {
    const { data } = await supabase
      .from('clock_records')
      .select('*')
      .eq('staff_id', profile!.id)
      .is('clock_out', null)
      .order('clock_in', { ascending: false })
      .limit(1)
      .single()

    if (data) setActiveRecord(data)
  }

  async function handleClockIn() {
    if (!profile) return
    const isCustom = selectedSchoolId === CUSTOM_ID
    if (isCustom && !customLocation.trim()) return
    if (!isCustom && !selectedSchoolId) return

    setSubmitting(true)
    setClockError(null)

    const payload: Record<string, unknown> = {
      staff_id: profile.id,
      school_id: isCustom ? null : selectedSchoolId,
    }
    if (isCustom) payload.location_override = customLocation.trim()

    const { data, error } = await supabase
      .from('clock_records')
      .insert(payload)
      .select()
      .single()

    if (error) {
      setClockError(error.message)
    } else if (data) {
      setActiveRecord(data)
      setSuccess('in')
      setTimeout(() => setSuccess(null), 3000)
    }
    setSubmitting(false)
  }

  async function handleClockOut() {
    if (!activeRecord) return
    setSubmitting(true)
    const { error } = await supabase
      .from('clock_records')
      .update({ clock_out: new Date().toISOString() })
      .eq('id', activeRecord.id)

    if (!error) {
      setActiveRecord(null)
      setSuccess('out')
      setTimeout(() => setSuccess(null), 3000)
    }
    setSubmitting(false)
  }

  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const isCustom = selectedSchoolId === CUSTOM_ID
  const canSubmitClockIn = isCustom ? customLocation.trim().length > 0 : selectedSchoolId.length > 0

  return (
    <Layout title="Clock In / Out">
      <div className="px-4 pt-6 flex flex-col gap-4">

        {/* Live clock */}
        <Card className="text-center py-6">
          <p className="text-5xl font-mono font-bold text-[#1a3a6b]">{timeStr}</p>
          <p className="text-gray-500 text-sm mt-2">{dateStr}</p>
        </Card>

        {/* Success toast */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <CheckCircle className="text-green-500 shrink-0" size={20} />
            <p className="text-green-800 font-medium">
              {success === 'in' ? 'Clocked in successfully!' : 'Clocked out successfully!'}
            </p>
          </div>
        )}

        {/* Error */}
        {clockError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-red-700 text-sm">{clockError}</p>
          </div>
        )}

        {/* Active session banner */}
        {activeRecord && (
          <Card className="bg-[#1a3a6b] text-white border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f5c518] rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-[#1a3a6b]" />
              </div>
              <div>
                <p className="font-semibold">Session Active</p>
                <p className="text-blue-200 text-sm">
                  {activeRecord.location_override
                    ? activeRecord.location_override
                    : `Started at ${new Date(activeRecord.clock_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Clock-in form */}
        {!activeRecord && !loading && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4 flex items-center gap-2">
              <MapPin size={18} /> Select Location
            </h3>
            {schools.length === 0 && !canClockAnywhere ? (
              <p className="text-gray-500 text-sm">No schools assigned. Contact your Area Lead.</p>
            ) : schools.length === 1 && !canClockAnywhere ? (
              <div className="bg-[#f4f6f9] rounded-xl px-4 py-3">
                <p className="font-semibold text-[#1a3a6b]">{schools[0].name}</p>
                <p className="text-gray-500 text-sm">{schools[0].address}</p>
              </div>
            ) : (
              <>
                <Select
                  value={selectedSchoolId}
                  onChange={e => setSelectedSchoolId(e.target.value)}
                >
                  <option value="">Select a location…</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  {canClockAnywhere && (
                    <option value={CUSTOM_ID}>Other / Custom Location…</option>
                  )}
                </Select>
                {isCustom && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Enter location name…"
                      value={customLocation}
                      onChange={e => setCustomLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        {/* Action button */}
        {!loading && (
          <Button
            size="lg"
            fullWidth
            variant={activeRecord ? 'danger' : 'primary'}
            onClick={activeRecord ? handleClockOut : handleClockIn}
            disabled={submitting || (!activeRecord && !canSubmitClockIn)}
          >
            {activeRecord ? (
              <><LogOut size={22} /> Clock Out</>
            ) : (
              <><LogIn size={22} /> Clock In</>
            )}
          </Button>
        )}
      </div>
    </Layout>
  )
}
