import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { TaskComponentProps, QuizQuestion, SubmitQuizResult } from '../../../types/onboarding'

type QuizPhase =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'answering'; attemptId: string; questions: QuizQuestion[]; resumed: boolean }
  | { phase: 'submitting'; attemptId: string; questions: QuizQuestion[] }
  | { phase: 'result'; result: SubmitQuizResult }
  | { phase: 'passed' }

export function QuizTask({ task, assignment, onComplete, onRefresh }: TaskComponentProps) {
  const [quizState, setQuizState] = useState<QuizPhase>({ phase: 'idle' })
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [retryCountdown, setRetryCountdown] = useState(0)
  const [drawError, setDrawError] = useState<string | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (assignment.status === 'completed' || assignment.status === 'approved') {
      setQuizState({ phase: 'passed' })
    }
  }, [])

  function startRetryCountdown(seconds: number) {
    setRetryCountdown(seconds)
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current)
            countdownRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function drawQuestions() {
    setQuizState({ phase: 'loading' })
    setAnswers({})
    setDrawError(null)
    const { data, error } = await supabase.rpc('draw_quiz_questions', {
      p_task_assignment_id: assignment.id,
    })
    if (error || !data) {
      setQuizState({ phase: 'idle' })
      setDrawError(error?.message ?? 'Failed to load quiz. Please try again.')
      return
    }
    if (!data.questions || data.questions.length === 0) {
      setQuizState({ phase: 'idle' })
      setDrawError('No questions are available for this quiz yet. Please try again later.')
      return
    }
    setQuizState({
      phase: 'answering',
      attemptId: data.attempt_id,
      questions: data.questions,
      resumed: data.resumed,
    })
  }

  async function submitAnswers() {
    if (quizState.phase !== 'answering') return
    setQuizState({ phase: 'submitting', attemptId: quizState.attemptId, questions: quizState.questions })
    const answersArray = quizState.questions.map(q => ({
      question_id: q.id,
      answer_index: answers[q.id] ?? -1,
    }))
    const { data, error } = await supabase.rpc('submit_quiz_attempt', {
      p_attempt_id: quizState.attemptId,
      p_answers: answersArray,
    })
    if (error || !data) {
      setQuizState({ phase: 'idle' })
      return
    }
    if (data.passed) {
      onRefresh()
    }
    setQuizState({ phase: 'result', result: data })
    if (data.can_retry && data.retry_after_seconds > 0) {
      startRetryCountdown(data.retry_after_seconds)
    }
  }

  function formatDelay(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`
    return `${Math.round(seconds / 3600)} hr`
  }

  if (quizState.phase === 'idle' || quizState.phase === 'loading') {
    const isLoading = quizState.phase === 'loading'
    const hasAttempts = assignment.attempts > 0
    const passThreshold = task.pass_threshold_pct ?? 80

    return (
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-24 max-w-lg mx-auto w-full">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-4">
          <h2 className="font-bold text-[#1a3a6b] text-base mb-4">Quiz details</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Pass mark</span>
              <span className="text-sm font-semibold text-[#1a3a6b]">{passThreshold}%</span>
            </div>
            {task.questions_per_attempt !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Questions</span>
                <span className="text-sm font-semibold text-[#1a3a6b]">{task.questions_per_attempt}</span>
              </div>
            )}
            {task.max_attempts !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Max attempts</span>
                <span className="text-sm font-semibold text-[#1a3a6b]">{task.max_attempts}</span>
              </div>
            )}
            {task.retry_delay_seconds > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Retry delay</span>
                <span className="text-sm font-semibold text-[#1a3a6b]">{formatDelay(task.retry_delay_seconds)}</span>
              </div>
            )}
          </div>
        </div>

        {hasAttempts && assignment.best_score_pct !== null && (
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b] text-xs font-semibold">
              Best score: {Math.round(assignment.best_score_pct)}%
            </span>
          </div>
        )}

        {hasAttempts && assignment.status !== 'completed' && assignment.status !== 'approved' && (
          <p className="text-sm text-gray-500 mb-4">
            {task.max_attempts !== null
              ? `Attempt ${assignment.attempts} of ${task.max_attempts} used — try again to improve your score.`
              : `You've made ${assignment.attempts} previous attempt${assignment.attempts !== 1 ? 's' : ''} — try again to improve your score.`}
          </p>
        )}

        {drawError && (
          <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{drawError}</p>
          </div>
        )}

        <button
          onClick={drawQuestions}
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-[#1a3a6b] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading…
            </>
          ) : hasAttempts ? 'Retry Quiz' : 'Start Quiz'}
        </button>
      </div>
    )
  }

  if (quizState.phase === 'answering' || quizState.phase === 'submitting') {
    const questions = quizState.questions
    const isSubmitting = quizState.phase === 'submitting'
    const resumed = quizState.phase === 'answering' ? quizState.resumed : false
    const answeredCount = questions.filter(q => answers[q.id] !== undefined).length
    const allAnswered = answeredCount === questions.length

    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-36 max-w-lg mx-auto w-full">
          {resumed && (
            <div className="mb-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium">Resuming your previous attempt.</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-medium text-gray-400">
              {answeredCount} of {questions.length} answered
            </p>
            <div className="flex gap-1.5">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    answers[q.id] !== undefined ? 'bg-[#1a3a6b]' : 'bg-gray-200'
                  }`}
                  aria-label={`Question ${i + 1} ${answers[q.id] !== undefined ? 'answered' : 'unanswered'}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {questions.map((q, qi) => (
              <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-400 mb-1.5">Question {qi + 1}</p>
                <p className="font-semibold text-[#1a3a6b] text-sm leading-snug mb-4">{q.question}</p>
                <div className="space-y-2">
                  {q.options.map((option, oi) => {
                    const isSelected = answers[q.id] === oi
                    const letter = String.fromCharCode(65 + oi)
                    return (
                      <button
                        key={oi}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                        disabled={isSubmitting}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                          isSelected
                            ? 'border-[#1a3a6b] bg-[#1a3a6b]/5 text-[#1a3a6b] font-semibold'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isSelected ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-sm leading-snug">{option}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pb-safe-bottom pt-3">
          <div className="max-w-lg mx-auto">
            <button
              onClick={submitAnswers}
              disabled={!allAnswered || isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-[#1a3a6b] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting…
                </>
              ) : allAnswered
                ? 'Submit Answers'
                : `Submit Answers (${answeredCount} / ${questions.length})`}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (quizState.phase === 'result') {
    const { result } = quizState
    const passed = result.passed

    return (
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-24 max-w-lg mx-auto w-full">
        <div
          className={`rounded-2xl p-5 mb-5 ${
            passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            {passed
              ? <CheckCircle2 size={22} className="text-green-600 shrink-0" />
              : <XCircle size={22} className="text-red-500 shrink-0" />}
            <p className={`font-bold text-base ${passed ? 'text-green-800' : 'text-red-700'}`}>
              {passed ? 'Passed!' : 'Not passed'}
            </p>
          </div>
          <p className={`text-sm font-medium ${passed ? 'text-green-700' : 'text-red-600'}`}>
            {result.score} / {result.max_score} correct — {Math.round(result.score_pct)}%
          </p>
          {!passed && (
            <p className="text-xs text-red-400 mt-1">
              Pass mark: {task.pass_threshold_pct ?? 80}%
            </p>
          )}
        </div>

        {result.feedback.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Question review
            </p>
            <div className="space-y-3">
              {result.feedback.map(item => (
                <div key={item.question_id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    {item.correct
                      ? <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      : <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-3">
                        {item.question}
                      </p>
                      {!item.correct && item.selected_option !== null && (
                        <p className="text-xs text-red-500 mt-1.5">
                          <span className="font-semibold">Your answer:</span> {item.selected_option}
                        </p>
                      )}
                      {item.correct_option !== null && (
                        <p className={`text-xs mt-1 ${item.correct ? 'text-green-600' : 'text-green-700'}`}>
                          <span className="font-semibold">{item.correct ? 'Correct:' : 'Correct answer:'}</span> {item.correct_option}
                        </p>
                      )}
                      {item.explanation && (
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {passed ? (
          <button
            onClick={onComplete}
            className="w-full py-3.5 rounded-2xl bg-green-600 text-white text-sm font-bold flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Continue
          </button>
        ) : (
          <div className="space-y-3">
            {result.can_retry ? (
              retryCountdown > 0 ? (
                <button
                  disabled
                  className="w-full py-3.5 rounded-2xl bg-gray-100 text-gray-400 text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <RefreshCw size={15} />
                  Try again in {retryCountdown}s
                </button>
              ) : (
                <button
                  onClick={drawQuestions}
                  className="w-full py-3.5 rounded-2xl bg-[#1a3a6b] text-white text-sm font-bold flex items-center justify-center gap-2"
                >
                  <RefreshCw size={15} />
                  Try again
                </button>
              )
            ) : (
              <button
                onClick={onComplete}
                className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 text-sm font-bold"
              >
                ← Back to stage
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4 pb-8">
      <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
        <CheckCircle2 size={30} className="text-green-500" />
      </div>
      <div>
        <p className="font-bold text-[#1a3a6b] text-lg">Quiz passed</p>
        {assignment.best_score_pct !== null && (
          <p className="text-sm text-gray-400 mt-1">
            Best score: {Math.round(assignment.best_score_pct)}%
          </p>
        )}
      </div>
      {assignment.best_score_pct !== null && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
          <CheckCircle2 size={12} />
          {Math.round(assignment.best_score_pct)}% — Passed
        </span>
      )}
      <button
        onClick={onComplete}
        className="mt-2 text-sm font-bold text-[#1a3a6b]"
      >
        ← Back to stage
      </button>
    </div>
  )
}
