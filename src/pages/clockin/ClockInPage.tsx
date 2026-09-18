import { useState, useEffect, useRef } from 'react'
import { MapPin, CheckCircle, ChevronLeft, ChevronRight, Search, ClipboardList, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import type { School, ClockRecord } from '../../types'

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

const ROLE_LABELS: Record<string, string> = {
  lead_coach:      'Lead Coach',
  assistant_coach: 'Assistant Coach',
  junior_coach:    'Junior Coach',
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

// ─── School picker ────────────────────────────────────────────────────────────

function SchoolPicker({ schools, mySchoolIds, value, onChange }: {
  schools: School[]
  mySchoolIds: Set<string>
  value: string
  onChange: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = schools.find(s => s.id === value)

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  const lq = query.toLowerCase()
  const filtered = query
    ? schools.filter(s => s.name.toLowerCase().includes(lq) || (s.area ?? '').toLowerCase().includes(lq))
    : schools

  const mySchools = filtered.filter(s => mySchoolIds.has(s.id))
  const others = filtered.filter(s => !mySchoolIds.has(s.id))

  const byArea: Record<string, School[]> = {}
  others.forEach(s => {
    const a = s.area || 'Other'
    if (!byArea[a]) byArea[a] = []
    byArea[a].push(s)
  })
  const areaGroups = Object.entries(byArea).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search for a school…"
          value={open ? query : (selected?.name ?? '')}
          onFocus={() => { setOpen(true); setQuery('') }}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        />
        {value && !open && (
          <button
            type="button"
            onClick={() => { onChange(''); setQuery('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto mt-1.5">
          {mySchools.length > 0 && (
            <>
              <div className="px-3 pt-2.5 pb-1 text-[10px] font-extrabold text-[#1a3a6b] uppercase tracking-widest">
                Your Schools
              </div>
              {mySchools.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { onChange(s.id); setOpen(false); setQuery('') }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors ${value === s.id ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm font-semibold text-[#1a3a6b]">{s.name}</p>
                  {s.area && <p className="text-[11px] text-gray-400">{s.area}</p>}
                </button>
              ))}
              {areaGroups.length > 0 && <div className="border-t border-gray-100 mx-3 my-1" />}
            </>
          )}

          {areaGroups.map(([area, areaSchools]) => (
            <div key={area}>
              <div className="px-3 py-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                {area}
              </div>
              {areaSchools.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { onChange(s.id); setOpen(false); setQuery('') }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${value === s.id ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm text-gray-700">{s.name}</p>
                </button>
              ))}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-400 text-center">
              No schools match "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SessionEntry = ClockRecord & { school?: School }

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
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.role) {
      const r = profile.role
      setSessionRole(r === 'lead_coach' ? 'lead_coach' : r === 'assistant_coach' ? 'assistant_coach' : 'junior_coach')
    }
  }, [profile?.role])

  useEffect(() => {
    if (profile) loadSchools()
  }, [profile?.id])

  useEffect(() => {
    if (profile) loadSessions(sessionDate)
  }, [profile?.id, sessionDate])

  async function loadSchools() {
    const [{ data: allSchools }, { data: assignments }] = await Promise.all([
      supabase.from('schools').select('id, name, area, address').order('name'),
      supabase.from('staff_school_assignments').select('school_id').eq('staff_id', profile!.id),
    ])
    setSchools(allSchools ?? [])
    const ids = new Set<string>((assignments ?? []).map((a: any) => a.school_id))
    setMySchoolIds(ids)
    if (ids.size === 1) setSelectedSchoolId([...ids][0])
    setLoading(false)
  }

  async function loadSessions(date: string) {
    const { data } = await supabase
      .from('clock_records')
      .select('*, school:schools(id, name, area)')
      .eq('staff_id', profile!.id)
      .eq('session_date', date)
      .order('clock_in', { ascending: false })
    setSessions((data as SessionEntry[]) ?? [])
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
      await loadSessions(sessionDate)
    }
    setSubmitting(false)
  }

  async function deleteSession(id: string) {
    await supabase.from('clock_records').delete().eq('id', id)
    setSessions(prev => prev.filter(r => r.id !== id))
    setConfirmDeleteId(null)
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

        {/* Sessions logged on this date */}
        {sessions.length > 0 && (
          <div>
            <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest px-1 mb-2">
              Logged on {dateToDisplayStr(sessionDate)}
            </p>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {sessions.map((r, i) => {
                const role = r.session_role
                const isConfirming = confirmDeleteId === r.id
                return (
                  <div
                    key={r.id}
                    className={`px-4 py-3.5 ${i < sessions.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    {isConfirming ? (
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-gray-600">Remove this session?</p>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteSession(r.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {(r.school as any)?.name ?? r.location_override ?? 'Unknown school'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {role && (
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-500'}`}>
                                {ROLE_LABELS[role] ?? role}
                              </span>
                            )}
                            <span className="text-[11px] text-gray-400">
                              Logged {new Date(r.clock_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setConfirmDeleteId(r.id)}
                          className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0"
                        >
                          <X size={14} className="text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

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
