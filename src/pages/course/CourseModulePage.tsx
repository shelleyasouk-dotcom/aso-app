import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronRight, CheckCircle, XCircle, Award, BookOpen, ChevronDown, ChevronUp,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { LEADERSHIP_COURSE } from '../../data/leadershipCourse'

export function CourseModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const course = LEADERSHIP_COURSE
  const mod = course.modules.find(m => m.id === moduleId)

  const [phase, setPhase] = useState<'reading' | 'quiz' | 'result'>('reading')
  const [openSection, setOpenSection] = useState<number>(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [revealed, setRevealed] = useState<boolean[]>([])
  const [saving, setSaving] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  useEffect(() => {
    if (!profile || !mod) return
    supabase.from('course_progress')
      .select('id')
      .eq('user_id', profile.id)
      .eq('course_id', course.id)
      .eq('module_id', mod.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setAlreadyDone(true) })
  }, [profile, mod])

  useEffect(() => {
    if (mod) {
      setAnswers(new Array(mod.quiz.length).fill(null))
      setRevealed(new Array(mod.quiz.length).fill(false))
    }
  }, [mod])

  if (!mod) {
    return <Layout title="Not Found" showBack><p className="text-center text-gray-400 py-16">Module not found.</p></Layout>
  }

  function selectAnswer(qIdx: number, aIdx: number) {
    if (revealed[qIdx]) return
    setAnswers(prev => { const n = [...prev]; n[qIdx] = aIdx; return n })
    setRevealed(prev => { const n = [...prev]; n[qIdx] = true; return n })
  }

  const score = answers.filter((a, i) => a === mod.quiz[i].correct).length
  const passed = score >= mod.passThreshold
  const allAnswered = answers.every(a => a !== null)

  async function completeModule() {
    if (!profile || saving) return
    setSaving(true)
    await supabase.from('course_progress').upsert({
      user_id: profile.id,
      course_id: course.id,
      module_id: mod!.id,
      quiz_score: score,
    }, { onConflict: 'user_id,course_id,module_id' })

    // Check if all modules done → award certificate
    const { data: allProgress } = await supabase
      .from('course_progress')
      .select('module_id')
      .eq('user_id', profile.id)
      .eq('course_id', course.id)

    const completedIds = new Set((allProgress ?? []).map((p: any) => p.module_id))
    const allDone = course.modules.every(m => completedIds.has(m.id))

    if (allDone) {
      await supabase.from('course_certificates').upsert({
        user_id: profile.id,
        course_id: course.id,
        course_title: course.certificateTitle,
      }, { onConflict: 'user_id,course_id' })
    }

    setSaving(false)
    navigate('/course/leadership')
  }

  function resetQuiz() {
    setAnswers(new Array(mod.quiz.length).fill(null))
    setRevealed(new Array(mod.quiz.length).fill(false))
    setPhase('quiz')
  }

  return (
    <Layout title={`Module ${mod.number}`} showBack>
      <div className="flex flex-col gap-4 pb-12">

        {/* Header */}
        <div className={`bg-gradient-to-br ${mod.gradient} text-white px-4 pt-4 pb-6`}>
          <p className={`text-xs font-extrabold uppercase tracking-widest ${mod.accent} mb-1`}>
            Module {mod.number} · {mod.duration}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight">{mod.title}</h1>
          <p className="text-white/70 text-sm mt-1">{mod.subtitle}</p>
        </div>

        {/* Already completed banner */}
        {alreadyDone && (
          <div className="px-4">
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle size={16} className="text-green-500 shrink-0" />
              <p className="text-sm font-bold text-green-800">You have already completed this module.</p>
            </div>
          </div>
        )}

        {/* READING PHASE */}
        {phase === 'reading' && (
          <div className="px-4 flex flex-col gap-3">
            {mod.sections.map((section, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3.5"
                  onClick={() => setOpenSection(openSection === i ? -1 : i)}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={15} className="text-gray-400 shrink-0" />
                    <span className="font-bold text-gray-800 text-sm text-left">{section.heading}</span>
                  </div>
                  {openSection === i
                    ? <ChevronUp size={15} className="text-gray-400 shrink-0" />
                    : <ChevronDown size={15} className="text-gray-400 shrink-0" />
                  }
                </button>
                {openSection === i && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{section.body}</p>
                    {section.bullets && (
                      <div className="flex flex-col gap-1.5">
                        {section.bullets.map((b, j) => (
                          <div key={j} className="flex items-start gap-2.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${mod.cardText.replace('text-', 'bg-')} shrink-0 mt-2`} />
                            <p className="text-sm text-gray-700 leading-snug">{b}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={() => { setOpenSection(-1); setPhase('quiz') }}
              className={`w-full bg-gradient-to-r ${mod.gradient} text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-2`}
            >
              Start Knowledge Check <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* QUIZ PHASE */}
        {phase === 'quiz' && (
          <div className="px-4 flex flex-col gap-4">
            <div className={`${mod.cardBg} border ${mod.cardBorder} rounded-xl px-4 py-3`}>
              <p className={`text-xs font-extrabold uppercase tracking-wide ${mod.cardText}`}>
                Knowledge Check — {mod.quiz.length} questions · Pass: {mod.passThreshold}/{mod.quiz.length}
              </p>
            </div>

            {mod.quiz.map((q, qi) => (
              <div key={qi} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">
                <p className="font-bold text-gray-800 text-sm leading-snug">
                  <span className="text-gray-400 mr-1">Q{qi + 1}.</span> {q.question}
                </p>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = answers[qi] === oi
                    const isCorrect = oi === q.correct
                    const isRevealed = revealed[qi]
                    let cls = 'border border-gray-200 bg-gray-50 text-gray-700'
                    if (isRevealed && isCorrect) cls = 'border border-green-300 bg-green-50 text-green-800'
                    else if (isRevealed && isSelected && !isCorrect) cls = 'border border-red-300 bg-red-50 text-red-800'
                    return (
                      <button
                        key={oi}
                        onClick={() => selectAnswer(qi, oi)}
                        disabled={isRevealed}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-2.5 transition-colors ${cls}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] font-bold">
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt}
                        {isRevealed && isCorrect && <CheckCircle size={14} className="text-green-600 ml-auto shrink-0" />}
                        {isRevealed && isSelected && !isCorrect && <XCircle size={14} className="text-red-500 ml-auto shrink-0" />}
                      </button>
                    )
                  })}
                </div>
                {revealed[qi] && (
                  <p className={`text-xs px-3 py-2 rounded-lg ${answers[qi] === q.correct ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))}

            {allAnswered && (
              <button
                onClick={() => setPhase('result')}
                className={`w-full bg-gradient-to-r ${mod.gradient} text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2`}
              >
                See Results <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}

        {/* RESULT PHASE */}
        {phase === 'result' && (
          <div className="px-4 flex flex-col gap-4">
            <div className={`rounded-2xl p-6 text-center ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="text-4xl mb-3">{passed ? '🎉' : '📖'}</div>
              <p className={`text-xl font-extrabold mb-1 ${passed ? 'text-green-800' : 'text-red-800'}`}>
                {passed ? 'Module Passed!' : 'Not Quite'}
              </p>
              <p className={`text-sm ${passed ? 'text-green-600' : 'text-red-600'}`}>
                You scored {score} out of {mod.quiz.length} — {Math.round((score / mod.quiz.length) * 100)}%
              </p>
              {!passed && (
                <p className="text-xs text-gray-500 mt-2">
                  You need {mod.passThreshold} correct to pass. Review the content and try again.
                </p>
              )}
            </div>

            {passed ? (
              <button
                onClick={completeModule}
                disabled={saving}
                className="w-full bg-[#1a3a6b] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                <Award size={18} /> {saving ? 'Saving…' : alreadyDone ? 'Return to Course' : 'Complete Module'}
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={resetQuiz}
                  className={`w-full bg-gradient-to-r ${mod.gradient} text-white font-bold py-4 rounded-2xl`}
                >
                  Retake Quiz
                </button>
                <button
                  onClick={() => setPhase('reading')}
                  className="w-full border border-gray-200 text-gray-600 font-bold py-3 rounded-2xl text-sm"
                >
                  Review Content First
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  )
}
