import { useState, useEffect } from 'react'
import { Star, MessageSquare, TrendingUp, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedbackRow {
  id: string
  fun_rating: number
  safety_rating: number
  inclusion_rating: number
  development_rating: number
  professionalism_rating: number
  overall_rating: number
  comment: string | null
  reviewer_name: string | null
  school_name: string | null
  created_at: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function avg(rows: FeedbackRow[], key: keyof FeedbackRow) {
  if (!rows.length) return 0
  return rows.reduce((s, r) => s + ((r[key] as number) ?? 0), 0) / rows.length
}

function StarBar({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? 'text-[#f5c518] fill-[#f5c518]' : 'text-gray-200'}
        />
      ))}
    </div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-36 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-[#1a3a6b] rounded-full transition-all"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-sm font-bold text-gray-700 w-8 text-right">{value.toFixed(1)}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FeedbackAnalyticsPage() {
  const { profile } = useAuth()
  const [rows, setRows] = useState<FeedbackRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const isDirector = profile?.role === 'director'

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('parent_feedback')
      .select('*')
      .order('created_at', { ascending: false })
    setRows((data ?? []) as FeedbackRow[])
    setLoading(false)
  }

  async function deleteRow(id: string) {
    if (!confirm('Delete this review? This cannot be undone.')) return
    setDeleting(id)
    await supabase.from('parent_feedback').delete().eq('id', id)
    setRows(r => r.filter(x => x.id !== id))
    setDeleting(null)
  }

  const count = rows.length
  const overall = avg(rows, 'overall_rating')
  const fun = avg(rows, 'fun_rating')
  const safety = avg(rows, 'safety_rating')
  const inclusion = avg(rows, 'inclusion_rating')
  const development = avg(rows, 'development_rating')
  const professionalism = avg(rows, 'professionalism_rating')

  const withComments = rows.filter(r => r.comment)

  return (
    <Layout title="Parent Feedback" showBack>
      <div className="px-4 pt-6 pb-10 flex flex-col gap-6">

        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading…</p>
        ) : count === 0 ? (
          <div className="text-center py-12">
            <Star size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No reviews yet.</p>
          </div>
        ) : (
          <>
            {/* Summary card */}
            <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <p className="text-5xl font-extrabold leading-none">{overall.toFixed(1)}</p>
                  <StarBar value={overall} size={18} />
                  <p className="text-white/50 text-xs mt-1">{count} review{count !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 border-l border-white/20 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-[#f5c518]" />
                    <span className="text-sm font-semibold text-white/80">Overall parent rating</span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Average across fun, safety, inclusion, development, and professionalism ratings from {count} parent{count !== 1 ? 's' : ''}.
                  </p>
                </div>
              </div>

              {/* Per-value breakdown */}
              <div className="bg-white/10 rounded-xl p-4 flex flex-col gap-3">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wide mb-1">By Value</p>
                {[
                  { label: '🎉 Fun', value: fun },
                  { label: '🛡️ Safety', value: safety },
                  { label: '🤝 Inclusion', value: inclusion },
                  { label: '📈 Development', value: development },
                  { label: '⭐ Professionalism', value: professionalism },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-white/70 w-36 shrink-0">{label}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-[#f5c518] rounded-full"
                        style={{ width: `${(value / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white w-8 text-right">{value.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score bars (light version) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-bold text-[#1a3a6b] mb-4">Detailed Breakdown</p>
              <div className="flex flex-col gap-3">
                <ScoreBar label="🎉 Fun" value={fun} />
                <ScoreBar label="🛡️ Safety" value={safety} />
                <ScoreBar label="🤝 Inclusion" value={inclusion} />
                <ScoreBar label="📈 Development" value={development} />
                <ScoreBar label="⭐ Professionalism" value={professionalism} />
              </div>
            </div>

            {/* Comments feed */}
            {withComments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={16} className="text-[#1a3a6b]" />
                  <h3 className="text-sm font-bold text-[#1a3a6b]">{withComments.length} Comment{withComments.length !== 1 ? 's' : ''}</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {withComments.map(r => (
                    <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 leading-relaxed italic">"{r.comment}"</p>
                          <div className="flex items-center gap-2 mt-2">
                            <StarBar value={r.overall_rating} size={12} />
                            <span className="text-xs text-gray-400">
                              {r.reviewer_name ?? 'Anonymous'}
                              {r.school_name ? ` · ${r.school_name}` : ''}
                              {' · '}{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        {isDirector && (
                          <button
                            onClick={() => deleteRow(r.id)}
                            disabled={deleting === r.id}
                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                            aria-label="Delete review"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All reviews table */}
            <div>
              <h3 className="text-sm font-bold text-[#1a3a6b] mb-3">All Reviews ({count})</h3>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-left">
                        <th className="px-4 py-2.5 font-semibold">Date</th>
                        <th className="px-4 py-2.5 font-semibold">Name</th>
                        <th className="px-4 py-2.5 font-semibold">School</th>
                        <th className="px-4 py-2.5 font-semibold">Overall</th>
                        <th className="px-4 py-2.5 font-semibold">Fun</th>
                        <th className="px-4 py-2.5 font-semibold">Safety</th>
                        <th className="px-4 py-2.5 font-semibold">Inclusion</th>
                        <th className="px-4 py-2.5 font-semibold">Dev</th>
                        <th className="px-4 py-2.5 font-semibold">Prof</th>
                        {isDirector && <th className="px-4 py-2.5" />}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {rows.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                            {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-4 py-2.5 text-gray-700">{r.reviewer_name ?? '—'}</td>
                          <td className="px-4 py-2.5 text-gray-700">{r.school_name ?? '—'}</td>
                          <td className="px-4 py-2.5 font-bold text-[#1a3a6b]">{r.overall_rating}</td>
                          <td className="px-4 py-2.5 text-gray-600">{r.fun_rating}</td>
                          <td className="px-4 py-2.5 text-gray-600">{r.safety_rating}</td>
                          <td className="px-4 py-2.5 text-gray-600">{r.inclusion_rating}</td>
                          <td className="px-4 py-2.5 text-gray-600">{r.development_rating}</td>
                          <td className="px-4 py-2.5 text-gray-600">{r.professionalism_rating}</td>
                          {isDirector && (
                            <td className="px-4 py-2.5">
                              <button
                                onClick={() => deleteRow(r.id)}
                                disabled={deleting === r.id}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
