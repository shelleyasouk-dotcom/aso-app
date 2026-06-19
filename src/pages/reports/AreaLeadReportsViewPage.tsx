import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'

interface SubmitterProfile {
  id: string
  full_name: string
  area: string | null
}

interface WeeklyReport {
  id: string
  submitted_by: string
  area: string | null
  week_ending: string
  staff_absences: string | null
  cover_arranged: string | null
  incidents_concerns: string | null
  actions_taken: string | null
  flags_next_week: string | null
  general_notes: string | null
  created_at: string
  submitted_by_profile: SubmitterProfile | null
}

function formatWeekEnding(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function isThisWeek(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
}

interface SectionBlockProps {
  label: string
  content: string | null
}

function SectionBlock({ label, content }: SectionBlockProps) {
  if (!content || !content.trim()) return null
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}

export function AreaLeadReportsViewPage() {
  const { profile } = useAuth()
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterSubmitter, setFilterSubmitter] = useState('')
  const [filterWeek, setFilterWeek] = useState('')

  const isDirector = profile?.role === 'director'

  useEffect(() => {
    if (!profile) return
    load()
  }, [profile])

  async function load() {
    setLoading(true)
    let query = supabase
      .from('area_lead_weekly_reports')
      .select('*, submitted_by_profile:profiles!submitted_by(id, full_name, area)')
      .order('week_ending', { ascending: false })

    if (!isDirector) {
      query = query.eq('submitted_by', profile!.id)
    }

    const { data } = await query
    setReports((data ?? []) as WeeklyReport[])
    setLoading(false)
  }

  const submitterList = Array.from(
    new Map(
      reports
        .filter(r => r.submitted_by_profile)
        .map(r => [r.submitted_by_profile!.id, r.submitted_by_profile!.full_name])
    ).entries()
  )

  const weekList = Array.from(new Set(reports.map(r => r.week_ending))).sort((a, b) => b.localeCompare(a))

  const filtered = reports.filter(r => {
    if (filterSubmitter && r.submitted_by !== filterSubmitter) return false
    if (filterWeek && r.week_ending !== filterWeek) return false
    return true
  })

  return (
    <Layout title="Admin Weekly Reports" showBack>
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <FileText size={20} className="text-[#1a3a6b]" />
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Admin Weekly Reports</h1>
            <p className="text-sm text-gray-500">
              {isDirector ? 'All area lead weekly admin reports' : 'Your submitted weekly admin reports'}
            </p>
          </div>
        </div>

        {/* Filters */}
        {(isDirector || weekList.length > 1) && (
          <div className="flex gap-2 mb-4">
            {isDirector && submitterList.length > 1 && (
              <select
                value={filterSubmitter}
                onChange={e => setFilterSubmitter(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
              >
                <option value="">All area leads</option>
                {submitterList.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            )}
            {weekList.length > 1 && (
              <select
                value={filterWeek}
                onChange={e => setFilterWeek(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
              >
                <option value="">All weeks</option>
                {weekList.map(w => (
                  <option key={w} value={w}>Week ending {formatWeekEnding(w)}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <FileText size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No reports found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(report => {
              const recent = isThisWeek(report.created_at)
              const isOpen = expanded === report.id
              const submitterName = report.submitted_by_profile?.full_name ?? 'Unknown'
              const submitterArea = report.submitted_by_profile?.area ?? report.area ?? null

              return (
                <div
                  key={report.id}
                  className={`bg-white rounded-2xl border transition-all ${recent ? 'border-[#1a3a6b]/30 shadow-sm' : 'border-gray-100'}`}
                >
                  <button
                    onClick={() => setExpanded(v => v === report.id ? null : report.id)}
                    className="w-full flex items-start gap-3 px-5 py-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{submitterName}</span>
                        {submitterArea && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {submitterArea}
                          </span>
                        )}
                        {recent && (
                          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            This week
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Week ending {formatWeekEnding(report.week_ending)}
                      </p>
                    </div>
                    <div className="shrink-0 ml-2 mt-0.5">
                      {isOpen
                        ? <ChevronUp size={15} className="text-gray-400" />
                        : <ChevronDown size={15} className="text-gray-400" />
                      }
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-gray-50 pt-4 flex flex-col gap-4">
                      <SectionBlock label="Staff & Absences" content={report.staff_absences} />
                      <SectionBlock label="Cover Arranged" content={report.cover_arranged} />
                      <SectionBlock label="Incidents & Concerns" content={report.incidents_concerns} />
                      <SectionBlock label="Actions Taken" content={report.actions_taken} />
                      <SectionBlock label="Flags for Next Week" content={report.flags_next_week} />
                      <SectionBlock label="General Notes" content={report.general_notes} />
                      <p className="text-[10px] text-gray-300">
                        Submitted {new Date(report.created_at).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
