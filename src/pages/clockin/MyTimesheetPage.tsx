import { useState, useEffect } from 'react'
import { Clock, MapPin, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import type { ClockRecord, School } from '../../types'

interface ClockEntry extends ClockRecord { school?: School }

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
function formatDuration(clockIn: string, clockOut: string | null): string {
  if (!clockOut) return 'In progress'
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime()
  if (ms < 0) return '—'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
function durationMs(clockIn: string, clockOut: string | null): number {
  if (!clockOut) return 0
  return Math.max(0, new Date(clockOut).getTime() - new Date(clockIn).getTime())
}
function msToHours(ms: number): string {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// Returns the Monday of a date's week as YYYY-MM-DD
function weekKey(iso: string): string {
  const d = new Date(iso)
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1 // Mon=0 … Sun=6
  d.setDate(d.getDate() - day)
  return d.toISOString().split('T')[0]
}
function weekLabel(key: string): string {
  const mon = new Date(key)
  const sun = new Date(key)
  sun.setDate(sun.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(mon)} – ${fmt(sun)}`
}

type FilterPeriod = '4w' | '3m' | 'all'

export function MyTimesheetPage() {
  const { profile } = useAuth()
  const [records, setRecords] = useState<ClockEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<FilterPeriod>('4w')

  useEffect(() => {
    if (!profile) return
    async function load() {
      setLoading(true)
      let q = supabase
        .from('clock_records')
        .select('*, school:schools(id,name,area)')
        .eq('staff_id', profile!.id)
        .order('clock_in', { ascending: false })
        .limit(500)

      if (period !== 'all') {
        const weeks = period === '4w' ? 4 : 13
        const since = new Date()
        since.setDate(since.getDate() - weeks * 7)
        q = q.gte('clock_in', since.toISOString())
      }

      const { data } = await q
      setRecords((data as ClockEntry[]) ?? [])
      setLoading(false)
    }
    load()
  }, [profile, period])

  if (!profile) return null

  // Group by week
  const weeks: Record<string, ClockEntry[]> = {}
  records.forEach(r => {
    const key = weekKey(r.clock_in)
    if (!weeks[key]) weeks[key] = []
    weeks[key].push(r)
  })
  const weekKeys = Object.keys(weeks).sort((a, b) => b.localeCompare(a))

  // Totals
  const totalMs = records.reduce((sum: number, r: ClockEntry) => sum + durationMs(r.clock_in, r.clock_out), 0)
  const completedSessions = records.filter(r => r.clock_out).length

  return (
    <Layout title="My Timesheet" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-5">

        {/* Summary bar */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2247] rounded-2xl p-4 text-white">
          <p className="text-white/60 text-xs uppercase tracking-wider mb-3">
            {period === '4w' ? 'Last 4 weeks' : period === '3m' ? 'Last 3 months' : 'All time'}
          </p>
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-extrabold">{msToHours(totalMs)}</p>
              <p className="text-white/50 text-xs mt-0.5">Total hours</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold">{completedSessions}</p>
              <p className="text-white/50 text-xs mt-0.5">Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold">{weekKeys.length}</p>
              <p className="text-white/50 text-xs mt-0.5">Weeks</p>
            </div>
          </div>
        </div>

        {/* Period filter */}
        <div className="flex gap-2">
          {([['4w', 'Last 4 weeks'], ['3m', 'Last 3 months'], ['all', 'All time']] as [FilterPeriod, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPeriod(val)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                period === val
                  ? 'bg-[#1a3a6b] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Records grouped by week */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : weekKeys.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No clock records found</p>
            <p className="text-gray-300 text-xs mt-1">Use the Clock In page to record your sessions</p>
          </div>
        ) : (
          weekKeys.map(key => {
            const weekRecords = weeks[key]
            const weekMs = weekRecords.reduce((sum: number, r: ClockEntry) => sum + durationMs(r.clock_in, r.clock_out), 0)
            const isCurrentWeek = key === weekKey(new Date().toISOString())

            return (
              <div key={key}>
                {/* Week header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500">
                      {isCurrentWeek ? 'This week' : weekLabel(key)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#1a3a6b]">
                    {msToHours(weekMs)}
                  </span>
                </div>

                {/* Records */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  {weekRecords.map((r: ClockEntry, i: number) => {
                    const ongoing = !r.clock_out
                    return (
                      <div
                        key={r.id}
                        className={`px-4 py-3.5 ${i < weekRecords.length - 1 ? 'border-b border-gray-50' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-800">{formatDate(r.clock_in)}</p>
                              {ongoing && (
                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                  LIVE
                                </span>
                              )}
                            </div>
                            {(r.school || r.location_override) && (
                              <div className="flex items-center gap-1 text-gray-400">
                                <MapPin size={11} className="shrink-0" />
                                <p className="text-xs truncate">
                                  {r.school?.name ?? r.location_override}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-[#1a3a6b]">
                              {formatDuration(r.clock_in, r.clock_out)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatTime(r.clock_in)}
                              {r.clock_out ? ` – ${formatTime(r.clock_out)}` : ' →'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </Layout>
  )
}
