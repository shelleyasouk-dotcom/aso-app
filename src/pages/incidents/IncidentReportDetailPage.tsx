import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import type { IncidentReport, IncidentStatus } from '../../types'

const TYPE_CONFIG = {
  accident: { label: 'Accident', color: 'bg-red-100 text-red-700' },
  incident: { label: 'Incident', color: 'bg-amber-100 text-amber-700' },
  near_miss: { label: 'Near Miss', color: 'bg-blue-100 text-blue-700' },
}

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-500' },
  submitted: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700' },
  reviewed: { label: 'Reviewed', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-400' },
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function YesNo({ label, value, details }: { label: string; value: boolean; details?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        {value
          ? <CheckCircle size={15} className="text-green-500" />
          : <XCircle size={15} className="text-gray-300" />
        }
        <p className="text-sm text-gray-800">{value ? 'Yes' : 'No'}</p>
      </div>
      {value && details && <p className="text-sm text-gray-600 mt-1">{details}</p>}
    </div>
  )
}


export function IncidentReportDetailPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [report, setReport] = useState<IncidentReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [furtherAction, setFurtherAction] = useState(false)
  const [furtherNotes, setFurtherNotes] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  const isAdmin = profile?.role === 'director' || profile?.role === 'area_lead'
  const isOwner = report?.reported_by === profile?.id
  const canEdit = isOwner && (report?.status === 'draft' || report?.status === 'submitted')
  const canReview = isAdmin && report?.status === 'submitted'
  const alreadyReviewed = report?.status === 'reviewed' || report?.status === 'closed'

  useEffect(() => {
    if (!id) return
    supabase
      .from('incident_reports')
      .select('*, school:schools(id,name), reporter:profiles!reported_by(id,full_name), reviewer:profiles!reviewed_by(id,full_name)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setReport(data as IncidentReport)
          setFurtherAction(data.further_action_required ?? false)
          setFurtherNotes(data.further_action_notes ?? '')
        }
        setLoading(false)
      })
  }, [id])

  async function submitReview(newStatus: 'reviewed' | 'closed') {
    if (!report) return
    setReviewError(null)
    setReviewing(true)
    const { error } = await supabase
      .from('incident_reports')
      .update({
        status: newStatus,
        reviewed_by: profile!.id,
        reviewed_at: new Date().toISOString(),
        further_action_required: furtherAction,
        further_action_notes: furtherNotes || null,
      })
      .eq('id', report.id)
    setReviewing(false)
    if (error) {
      setReviewError(error.message)
    } else {
      navigate('/incidents')
    }
  }

  if (loading) return null
  if (!report) return (
    <Layout title="Report">
      <div className="px-4 pt-6">
        <p className="text-gray-500 text-sm">Report not found.</p>
      </div>
    </Layout>
  )

  const typeConf = TYPE_CONFIG[report.incident_type]
  const statusConf = STATUS_CONFIG[report.status]
  const school = report.school as any
  const reporter = report.reporter as any
  const reviewer = report.reviewer as any

  return (
    <Layout title="Incident Report">
      <div className="px-4 pt-6 pb-10 flex flex-col gap-5">

        {/* Header badges */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${typeConf.color}`}>
              {typeConf.label}
            </span>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusConf.color}`}>
              {statusConf.label}
            </span>
          </div>

          <div className="bg-[#1a3a6b] rounded-2xl px-4 py-3">
            <p className="text-white font-bold text-base">{report.persons_involved}</p>
            <p className="text-white/70 text-sm mt-0.5">
              {new Date(report.incident_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {report.incident_time && ` · ${report.incident_time}`}
            </p>
            {school?.name && <p className="text-white/60 text-xs mt-1">{school.name}</p>}
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Field label="Location" value={report.incident_location} />
            <Field label="Persons Involved" value={report.persons_involved} />
          </div>

          <div className="px-4 py-4 flex flex-col gap-3">
            <Field label="Description" value={report.description} />
            <Field label="Injuries" value={report.injuries} />
          </div>

          <div className="px-4 py-4 flex flex-col gap-3">
            <YesNo
              label="First Aid Given"
              value={report.first_aid_given}
              details={[report.first_aid_given_by, report.first_aid_details].filter(Boolean).join(' — ')}
            />
            <YesNo
              label="Parent / Guardian Notified"
              value={report.parent_notified}
              details={report.parent_notified_details}
            />
          </div>

          {(report.witnesses || report.immediate_action) && (
            <div className="px-4 py-4 flex flex-col gap-3">
              <Field label="Witnesses" value={report.witnesses} />
              <Field label="Immediate Action Taken" value={report.immediate_action} />
            </div>
          )}

          <div className="px-4 py-3 bg-gray-50">
            <p className="text-xs text-gray-400">
              Reported by {reporter?.full_name ?? 'unknown'} on{' '}
              {new Date(report.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Edit button for owner with draft/submitted status */}
        {canEdit && (
          <button
            onClick={() => navigate(`/incidents/${report.id}/edit`)}
            className="flex items-center gap-2 text-sm font-semibold text-[#1a3a6b]"
          >
            <Edit2 size={15} /> Edit this report
          </button>
        )}

        {/* Reviewed section */}
        {alreadyReviewed && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-sm font-bold text-green-800">
                {report.status === 'closed' ? 'Closed' : 'Reviewed'}
                {reviewer?.full_name && ` by ${reviewer.full_name}`}
              </p>
            </div>
            {report.reviewed_at && (
              <p className="text-xs text-green-700">
                {new Date(report.reviewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            <div className="flex items-center gap-1.5">
              {report.further_action_required
                ? <AlertTriangle size={14} className="text-amber-500" />
                : <CheckCircle size={14} className="text-green-500" />
              }
              <p className="text-sm text-green-800">
                Further action: {report.further_action_required ? 'Required' : 'Not required'}
              </p>
            </div>
            {report.further_action_notes && (
              <p className="text-sm text-green-800 mt-1">{report.further_action_notes}</p>
            )}
          </div>
        )}

        {/* Review panel for area leads / directors */}
        {canReview && (
          <div className="bg-[#1a3a6b]/5 border border-[#1a3a6b]/20 rounded-2xl px-4 py-5 flex flex-col gap-4">
            <p className="text-sm font-bold text-[#1a3a6b]">Area Lead Review</p>

            {/* Further action toggle */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Further action required?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFurtherAction(false)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    !furtherAction ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  No Further Action
                </button>
                <button
                  type="button"
                  onClick={() => setFurtherAction(true)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    furtherAction ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  Action Required
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Notes / action plan</label>
              <textarea
                value={furtherNotes}
                onChange={e => setFurtherNotes(e.target.value)}
                placeholder={furtherAction ? 'Describe what action is required…' : 'Optional notes for record…'}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
            </div>

            {reviewError && (
              <p className="text-sm text-red-600">{reviewError}</p>
            )}

            <div className="flex flex-col gap-2">
              <Button size="lg" fullWidth disabled={reviewing} onClick={() => submitReview('reviewed')}>
                {reviewing ? 'Saving…' : 'Mark as Reviewed'}
              </Button>
              <Button size="lg" fullWidth variant="secondary" disabled={reviewing} onClick={() => submitReview('closed')}>
                Close Report
              </Button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
