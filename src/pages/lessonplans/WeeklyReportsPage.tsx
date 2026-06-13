import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, FileText, Camera } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'

interface ReportRow {
  id: string
  submitted_at: string
  week_number: number
  semester_number: number
  academic_year: string
  days_worked: string[]
  skills_covered: string[]
  award_sign_offs: string | null
  highlights: string | null
  challenges: string | null
  photos: string[]
  coach: { id: string; full_name: string } | null
  school: { id: string; name: string } | null
}


export function WeeklyReportsPage() {
  const { profile } = useAuth()
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterWeek, setFilterWeek] = useState('')
  const [filterStaff, setFilterStaff] = useState('')

  useEffect(() => {
    if (!profile) return
    load()
  }, [profile])

  async function load() {
    setLoading(true)

    let q = supabase
      .from('session_feedback')
      .select('*, coach:profiles(id, full_name), school:schools(id, name)')
      .eq('feedback_type', 'lead')
      .order('submitted_at', { ascending: false })
      .limit(300)

    // Scope area leads to their own area's staff
    if (profile?.role === 'area_lead') {
      const areaList = profile.areas && profile.areas.length > 0
        ? profile.areas
        : profile.area ? [profile.area] : []
      if (areaList.length > 0) {
        const { data: areaSchools } = await supabase
          .from('schools').select('id').in('area', areaList)
        const schoolIds = (areaSchools ?? []).map((s: { id: string }) => s.id)
        if (schoolIds.length > 0) q = q.in('school_id', schoolIds)
        else { setReports([]); setLoading(false); return }
      }
    }

    const { data } = await q
    setReports((data ?? []) as ReportRow[])
    setLoading(false)
  }

  const filtered = reports.filter(r => {
    if (filterWeek && String(r.week_number) !== filterWeek) return false
    if (filterStaff && r.coach?.id !== filterStaff) return false
    return true
  })

  const staffList = Array.from(
    new Map(reports.filter(r => r.coach).map(r => [r.coach!.id, r.coach!.full_name])).entries()
  )

  const unreadCount = reports.filter(r => {
    const age = Date.now() - new Date(r.submitted_at).getTime()
    return age < 7 * 24 * 60 * 60 * 1000
  }).length

  return (
    <Layout title="Weekly Reports" showBack>
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText size={20} className="text-[#1a3a6b]" />
              <h1 className="text-xl font-extrabold text-gray-900">Weekly Reports</h1>
              {unreadCount > 0 && (
                <span className="bg-[#1a3a6b] text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} this week</span>
              )}
            </div>
            <p className="text-sm text-gray-500">End-of-week reports submitted by lead coaches</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <select
            value={filterWeek}
            onChange={e => setFilterWeek(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
          >
            <option value="">All weeks</option>
            {[1,2,3,4,5,6].map(w => <option key={w} value={w}>Week {w}</option>)}
          </select>
          {staffList.length > 1 && (
            <select
              value={filterStaff}
              onChange={e => setFilterStaff(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
            >
              <option value="">All staff</option>
              {staffList.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <FileText size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No reports yet — they'll appear here once lead coaches submit their weekly reports.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(report => {
              const isNew = Date.now() - new Date(report.submitted_at).getTime() < 7 * 24 * 60 * 60 * 1000
              const isExpanded = expanded === report.id
              return (
                <div
                  key={report.id}
                  className={`bg-white rounded-2xl border transition-all ${isNew ? 'border-[#1a3a6b]/30 shadow-sm' : 'border-gray-100'}`}
                >
                  <button
                    onClick={() => setExpanded(v => v === report.id ? null : report.id)}
                    className="w-full flex items-start gap-3 px-5 py-4 text-left"
                  >
                    {isNew && <div className="w-2 h-2 rounded-full bg-[#1a3a6b] mt-2 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{report.coach?.full_name ?? 'Unknown'}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Week {report.week_number}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          S{report.semester_number} · {report.academic_year}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{report.school?.name ?? '—'}</p>
                      {!isExpanded && report.highlights && (
                        <p className="text-sm text-gray-500 mt-1 truncate">{report.highlights}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs text-gray-300">
                        {new Date(report.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                      {isExpanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-50 pt-4 flex flex-col gap-4">

                      {report.days_worked.length > 0 && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1.5">Days Worked</p>
                          <div className="flex flex-wrap gap-1.5">
                            {report.days_worked.map(d => (
                              <span key={d} className="bg-[#1a3a6b]/10 text-[#1a3a6b] text-xs font-semibold px-2.5 py-1 rounded-full">{d}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {report.skills_covered.length > 0 && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Skills Covered</p>
                          <div className="flex flex-col gap-0.5">
                            {report.skills_covered.map(s => (
                              <p key={s} className="text-sm text-gray-700">· {s}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {report.award_sign_offs && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Award Sign-offs</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{report.award_sign_offs}</p>
                        </div>
                      )}

                      {report.highlights && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Highlights</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{report.highlights}</p>
                        </div>
                      )}

                      {report.challenges && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Challenges</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{report.challenges}</p>
                        </div>
                      )}

                      {report.photos.length > 0 && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1.5 flex items-center gap-1">
                            <Camera size={10} /> Photos
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {report.photos.map(url => (
                              <a key={url} href={url} target="_blank" rel="noreferrer">
                                <img src={url} alt="" className="w-full aspect-square object-cover rounded-xl" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-gray-300">
                        Submitted {new Date(report.submitted_at).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}
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
