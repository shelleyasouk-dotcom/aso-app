import { useState, useEffect } from 'react'
import { MapPin, CheckCircle, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { SchoolPicker } from '../../components/SchoolPicker'
import type { School } from '../../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_ROLES = [
  { value: 'lead_coach',      label: 'Lead Coach' },
  { value: 'assistant_coach', label: 'Assistant Coach' },
  { value: 'junior_coach',    label: 'Junior Coach' },
]

const ROLE_COLORS: Record<string, string> = {
  lead_coach:      'bg-[#1a3a6b] text-white',
  assistant_coach: 'bg-purple-600 text-white',
  junior_coach:    'bg-green-600 text-white',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateToDisplayStr(dateStr: string) {
  const today = todayStr()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  if (dateStr === today) return 'Today'
  if (dateStr === yStr) return 'Yesterday'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function dateLong(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ClockInPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const defaultRole = profile?.role === 'lead_coach'
    ? 'lead_coach'
    : profile?.role === 'assistant_coach'
    ? 'assistant_coach'
    : 'junior_coach'

  const [schools, setSchools] = useState<School[]>([])
  const [mySchoolIds, setMySchoolIds] = useState<Set<string>>(new Set())
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [sessionDate, setSessionDate] = useState(searchParams.get('date') ?? todayStr())
  const [sessionRole, setSessionRole] = useState(defaultRole)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.role) {
      const r = profile.role
      setSessionRole(r === 'lead_coach' ? 'lead_coach' : r === 'assistant_coach' ? 'assistant_coach' : 'junior_coach')
    }
  }, [profile?.role])

  useEffect(() => {
    if (profile) loadSchools()
  }, [profile?.id])

  async function loadSchools() {
    const [{ data: allSchools }, { data: assignments }] = await Promise.all([
      supabase.from('schools').select('*').order('name'),
      supabase.from('staff_school_assignments').select('school_id').eq('staff_id', profile!.id),
    ])
    setSchools(allSchools ?? [])
    const ids = new Set<string>((assignments ?? []).map((a: any) => a.school_id))
    setMySchoolIds(ids)
    if (ids.size === 1) setSelectedSchoolId([...ids][0])
    setLoading(false)
  }

  async function handleSubmit() {
    if (!profile || !selectedSchoolId || isFuture) return
    setSubmitting(true)
    setError(null)

    const { error: err } = await supabase
      .from('clock_records')
      .insert({
        staff_id: profile.id,
        school_id: selectedSchoolId,
        session_date: sessionDate,
        session_role: sessionRole,
      })

    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSubmitting(false)
  }

  const isFuture = sessionDate > todayStr()
  const canSubmit = !!selectedSchoolId && !isFuture

  return (
    <Layout title="Log Session">
      <div className="px-4 pt-5 pb-10 flex flex-col gap-4 max-w-lg mx-auto w-full">

        {/* Date selector */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSessionDate(addDays(sessionDate, -1))}
              className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center active:bg-gray-100"
            >
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
            <div className="text-center">
              <p className="font-extrabold text-[#1a3a6b] text-lg leading-tight">{dateToDisplayStr(sessionDate)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{dateLong(sessionDate)}</p>
            </div>
            <button
              onClick={() => setSessionDate(addDays(sessionDate, 1))}
              disabled={!isFuture && sessionDate >= todayStr()}
              className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center active:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* School picker */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <MapPin size={11} /> School
          </p>
          {loading ? (
            <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <SchoolPicker
              schools={schools}
              mySchoolIds={mySchoolIds}
              value={selectedSchoolId}
              onChange={setSelectedSchoolId}
            />
          )}
        </div>

        {/* Role picker */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Role today</p>
          <div className="flex gap-2">
            {SESSION_ROLES.map(r => (
              <button
                key={r.value}
                onClick={() => setSessionRole(r.value)}
                className={`flex-1 py-2.5 rounded-xl text-[11px] font-extrabold transition-colors ${
                  sessionRole === r.value ? ROLE_COLORS[r.value] : 'bg-gray-100 text-gray-500 hover:bg-gray-150'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <CheckCircle className="text-green-500 shrink-0" size={18} />
            <p className="text-green-800 font-semibold text-sm">Session logged successfully</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {isFuture && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <p className="text-amber-700 text-sm font-medium">You can't log a session for a future date</p>
          </div>
        )}

        <Button size="lg" fullWidth onClick={handleSubmit} disabled={submitting || !canSubmit}>
          {submitting ? 'Logging…' : 'Log Session'}
        </Button>

        {/* Link to timesheet */}
        <button
          onClick={() => navigate('/my-timesheet')}
          className="flex items-center justify-center gap-2 text-sm font-semibold text-[#1a3a6b] py-2"
        >
          <ClipboardList size={16} />
          View My Timesheet
        </button>

      </div>
    </Layout>
  )
}
