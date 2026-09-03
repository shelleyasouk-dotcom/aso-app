import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Lock, Clock, ChevronRight, Award, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { ANAPHYLAXIS_COURSE } from '../../data/anaphylaxisCourse'

export function AnaphylaxisCoursePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())
  const [certificate, setCertificate] = useState<{ completed_at: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const course = ANAPHYLAXIS_COURSE
  const total = course.modules.length

  useEffect(() => {
    if (!profile) return
    async function load() {
      const [{ data: progress }, { data: cert }] = await Promise.all([
        supabase.from('course_progress')
          .select('module_id')
          .eq('user_id', profile!.id)
          .eq('course_id', course.id),
        supabase.from('course_certificates')
          .select('completed_at')
          .eq('user_id', profile!.id)
          .eq('course_id', course.id)
          .maybeSingle(),
      ])
      setCompletedModules(new Set((progress ?? []).map((p: any) => p.module_id)))
      setCertificate(cert)
      setLoading(false)
    }
    load()
  }, [profile])

  const doneCount = completedModules.size
  const allDone = doneCount === total

  return (
    <Layout title="Anaphylaxis Training" showBack>
      <div className="flex flex-col gap-4 pb-10">

        {/* Header */}
        <div className="bg-gradient-to-br from-red-700 to-red-900 text-white px-4 pt-5 pb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-yellow-300 mb-1">Mandatory Training</p>
              <h1 className="text-2xl font-extrabold leading-tight">{course.title}</h1>
              <p className="text-white/70 text-sm mt-1">{course.subtitle}</p>
            </div>
            <span className="text-4xl shrink-0">🚨</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/60 mb-1.5">
              <span>{doneCount} of {total} modules complete</span>
              <span>{Math.round((doneCount / total) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="px-4 flex flex-col gap-3">

          {/* Legal notice */}
          {!certificate && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-900 text-sm">Required before your first session</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Under Benedict's Law (September 2026), all ASO staff must complete anaphylaxis
                  training before working with children. Your certificate is stored on your profile
                  as evidence of compliance.
                </p>
              </div>
            </div>
          )}

          {/* Certificate banner */}
          {certificate ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <Award size={28} className="text-green-600 shrink-0" />
              <div>
                <p className="font-extrabold text-green-800 text-sm">Certificate Earned</p>
                <p className="text-xs text-gray-500">
                  Completed {new Date(certificate.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs text-green-700 font-semibold mt-0.5">Visible on your profile · Renew every 3 years</p>
              </div>
            </div>
          ) : allDone ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <p className="font-extrabold text-green-800">All modules complete!</p>
              <p className="text-xs text-green-600 mt-0.5">Your certificate is being generated…</p>
            </div>
          ) : null}

          {/* Module list */}
          {loading ? (
            <p className="text-center text-gray-400 py-8 text-sm">Loading…</p>
          ) : (
            course.modules.map((mod, index) => {
              const done = completedModules.has(mod.id)
              const unlocked = index === 0 || completedModules.has(course.modules[index - 1].id)
              return (
                <button
                  key={mod.id}
                  onClick={() => unlocked && navigate(`/course/anaphylaxis/${mod.id}`)}
                  disabled={!unlocked}
                  className={`w-full text-left bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm transition-opacity ${
                    unlocked ? 'active:opacity-80' : 'opacity-50'
                  } ${done ? 'border-green-200' : 'border-gray-100'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-gradient-to-br ${mod.gradient}`}>
                    {done ? <CheckCircle size={22} className="text-white" /> : <span>{mod.emoji}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Module {mod.number}</span>
                      {done && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Complete</span>}
                    </div>
                    <p className="font-extrabold text-gray-800 text-sm leading-tight">{mod.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {mod.duration}
                    </p>
                  </div>
                  {unlocked
                    ? <ChevronRight size={16} className="text-gray-300 shrink-0" />
                    : <Lock size={14} className="text-gray-300 shrink-0" />
                  }
                </button>
              )
            })
          )}

          <p className="text-xs text-gray-400 text-center pt-2">
            Complete each module in order. A certificate is awarded on completion and saved to your profile as evidence under Benedict's Law.
          </p>
        </div>
      </div>
    </Layout>
  )
}
