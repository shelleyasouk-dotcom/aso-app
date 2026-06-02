import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { APPARATUS_CPD_COURSES } from '../../data/apparatusCpd'

export function ApparatusCpdHubPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [progressMap, setProgressMap] = useState<Record<string, Set<string>>>({})
  const [certMap, setCertMap] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    async function load() {
      const courseIds = APPARATUS_CPD_COURSES.map(c => c.id)

      const [{ data: progress }, { data: certs }] = await Promise.all([
        supabase
          .from('course_progress')
          .select('course_id, module_id')
          .eq('user_id', profile!.id)
          .in('course_id', courseIds),
        supabase
          .from('course_certificates')
          .select('course_id')
          .eq('user_id', profile!.id)
          .in('course_id', courseIds),
      ])

      const pm: Record<string, Set<string>> = {}
      for (const row of progress ?? []) {
        if (!pm[row.course_id]) pm[row.course_id] = new Set()
        pm[row.course_id].add(row.module_id)
      }
      setProgressMap(pm)

      const cm: Record<string, boolean> = {}
      for (const row of certs ?? []) {
        cm[row.course_id] = true
      }
      setCertMap(cm)
      setLoading(false)
    }
    load()
  }, [profile])

  return (
    <Layout title="Apparatus CPD" showBack>
      <div className="flex flex-col gap-4 pb-10">

        {/* Header */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white px-4 pt-5 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1">Assistant Coach CPD</p>
              <h1 className="text-2xl font-extrabold leading-tight">Apparatus CPD</h1>
              <p className="text-white/70 text-sm mt-1">Four specialist coaching courses — one per apparatus</p>
            </div>
            <span className="text-4xl shrink-0">🏅</span>
          </div>
        </div>

        <div className="px-4 flex flex-col gap-3">
          {loading ? (
            <p className="text-center text-gray-400 py-8 text-sm">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {APPARATUS_CPD_COURSES.map(course => {
                const completed = progressMap[course.id] ?? new Set()
                const total = course.modules.length
                const doneCount = completed.size
                const hasCert = certMap[course.id] ?? false
                const allDone = doneCount === total

                let buttonLabel = 'Start'
                if (allDone) buttonLabel = 'Review'
                else if (doneCount > 0) buttonLabel = 'Continue'

                return (
                  <div
                    key={course.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
                  >
                    {/* Card header with gradient */}
                    <div className={`bg-gradient-to-br ${course.gradient} px-4 pt-4 pb-3 flex items-center gap-3`}>
                      <span className="text-3xl">{course.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-white text-sm leading-tight">{course.title}</p>
                        <p className="text-white/70 text-xs mt-0.5 leading-snug">{course.subtitle}</p>
                      </div>
                      {hasCert && (
                        <Award size={18} className="text-yellow-300 shrink-0" />
                      )}
                    </div>

                    {/* Progress */}
                    <div className="px-4 pt-3 pb-1">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>{doneCount}/{total} modules complete</span>
                        <span>{Math.round((doneCount / total) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${course.gradient} transition-all duration-500`}
                          style={{ width: `${(doneCount / total) * 100}%` }}
                        />
                      </div>
                      {hasCert && (
                        <p className="text-[10px] font-bold text-yellow-600 mt-1.5">Certificate earned</p>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="px-4 pb-4 pt-2">
                      <button
                        onClick={() => navigate(`/course/apparatus/${course.slug}`)}
                        className={`w-full bg-gradient-to-r ${course.gradient} text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm`}
                      >
                        {buttonLabel} <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <p className="text-xs text-gray-400 text-center pt-2">
            Complete each course at your own pace. A certificate is awarded on completion of all 4 modules per apparatus.
          </p>
        </div>
      </div>
    </Layout>
  )
}
