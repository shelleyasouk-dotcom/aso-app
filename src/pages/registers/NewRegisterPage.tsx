import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Select, Input } from '../../components/ui/Input'
import type { School, Child } from '../../types'

export function NewRegisterPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [children, setChildren] = useState<Child[]>([])
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<'setup' | 'register'>('setup')

  useEffect(() => {
    if (!profile) return
    loadSchools()
  }, [profile])

  useEffect(() => {
    if (selectedSchoolId) loadChildren()
  }, [selectedSchoolId])

  async function loadSchools() {
    const { data } = await supabase
      .from('staff_school_assignments')
      .select('school:schools(*)')
      .eq('staff_id', profile!.id)
    if (data) {
      const s = data.map((d: any) => d.school).filter(Boolean) as School[]
      setSchools(s)
      if (s.length === 1) setSelectedSchoolId(s[0].id)
    }
  }

  async function loadChildren() {
    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('school_id', selectedSchoolId)
      .eq('is_active', true)
      .order('full_name')
    if (data) {
      setChildren(data)
      // Default everyone to present
      const defaults: Record<string, boolean> = {}
      data.forEach((c: Child) => { defaults[c.id] = true })
      setAttendance(defaults)
    }
  }

  function toggleAttendance(childId: string) {
    setAttendance(prev => ({ ...prev, [childId]: !prev[childId] }))
  }

  async function saveRegister() {
    if (!profile || !selectedSchoolId) return
    setSaving(true)

    const { data: register, error } = await supabase
      .from('session_registers')
      .insert({
        school_id: selectedSchoolId,
        session_date: sessionDate,
        lead_coach_id: profile.id,
        notes: notes || null,
      })
      .select()
      .single()

    if (error || !register) {
      setSaving(false)
      return
    }

    const entries = children.map(c => ({
      register_id: register.id,
      child_id: c.id,
      present: attendance[c.id] ?? false,
    }))

    await supabase.from('register_entries').insert(entries)

    setSaving(false)
    navigate(`/registers/${register.id}`)
  }

  const presentCount = Object.values(attendance).filter(Boolean).length
  const absentCount = children.length - presentCount

  return (
    <Layout title="New Register" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">
        {step === 'setup' ? (
          <>
            <Card>
              <h3 className="font-semibold text-[#1a3a6b] mb-4">Session Details</h3>
              <div className="flex flex-col gap-3">
                {schools.length > 1 && (
                  <Select
                    label="School"
                    value={selectedSchoolId}
                    onChange={e => setSelectedSchoolId(e.target.value)}
                  >
                    <option value="">Select a school…</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                )}
                {schools.length === 1 && (
                  <div className="bg-[#f4f6f9] rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500">School</p>
                    <p className="font-semibold text-[#1a3a6b]">{schools[0].name}</p>
                  </div>
                )}
                <Input
                  label="Session Date"
                  type="date"
                  value={sessionDate}
                  onChange={e => setSessionDate(e.target.value)}
                />
              </div>
            </Card>

            <Button
              size="lg"
              fullWidth
              onClick={() => setStep('register')}
              disabled={!selectedSchoolId}
            >
              Start Register
            </Button>
          </>
        ) : (
          <>
            {/* Summary bar */}
            <Card className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                <p className="text-xs text-gray-500">Present</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{absentCount}</p>
                <p className="text-xs text-gray-500">Absent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1a3a6b]">{children.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </Card>

            {/* Children list */}
            {children.length === 0 ? (
              <Card>
                <p className="text-gray-500 text-sm text-center">
                  No children registered at this school yet. Add children in the Admin panel.
                </p>
              </Card>
            ) : (
              children.map(child => {
                const present = attendance[child.id] ?? false
                return (
                  <button
                    key={child.id}
                    onClick={() => toggleAttendance(child.id)}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                      present
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <span className="font-semibold text-gray-800 text-left">{child.full_name}</span>
                    {present ? (
                      <CheckCircle size={24} className="text-green-500 shrink-0" />
                    ) : (
                      <XCircle size={24} className="text-red-400 shrink-0" />
                    )}
                  </button>
                )
              })
            )}

            {/* Notes */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Notes (optional)</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] transition-colors"
                rows={3}
                placeholder="Any session notes…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <Button
              size="lg"
              fullWidth
              onClick={saveRegister}
              disabled={saving}
            >
              <Save size={20} />
              {saving ? 'Saving…' : 'Save Register'}
            </Button>
          </>
        )}
      </div>
    </Layout>
  )
}
