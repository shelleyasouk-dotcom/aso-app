import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, AlertTriangle, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import type { Profile, CoachLicence, CourseEnrolment, CoachAward, LicenceStatus } from '../../types'

const LICENCE_STATUS_COLOURS: Record<LicenceStatus, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  suspended: 'bg-amber-100 text-amber-700',
  pending: 'bg-gray-100 text-gray-600',
}

export function CoachDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile: me } = useAuth()
  const [coach, setCoach] = useState<Profile | null>(null)
  const [licences, setLicences] = useState<CoachLicence[]>([])
  const [enrolments, setEnrolments] = useState<CourseEnrolment[]>([])
  const [awards, setAwards] = useState<CoachAward[]>([])
  const [loading, setLoading] = useState(true)
  const [showLicenceModal, setShowLicenceModal] = useState(false)

  const isAdmin = me?.role === 'admin'

  useEffect(() => {
    if (id) loadData(id)
  }, [id])

  async function loadData(coachId: string) {
    const [profileRes, licencesRes, enrolmentsRes, awardsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', coachId).single(),
      supabase.from('coach_licences').select('*').eq('profile_id', coachId).order('expiry_date', { ascending: false }),
      supabase.from('course_enrolments').select('*, course:courses(id, title, discipline, date, course_type)').eq('profile_id', coachId).order('created_at', { ascending: false }),
      supabase.from('coach_awards').select('*, award:awards(id, name, discipline, level)').eq('profile_id', coachId).order('date_achieved', { ascending: false }),
    ])
    setCoach(profileRes.data)
    setLicences(licencesRes.data ?? [])
    setEnrolments(enrolmentsRes.data ?? [])
    setAwards(awardsRes.data ?? [])
    setLoading(false)
  }

  if (loading) return <Layout><div className="flex justify-center py-16"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-ukag-600" /></div></Layout>
  if (!coach) return <Layout><div className="text-center py-16 text-gray-500">Coach not found.</div></Layout>

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/coaches" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{coach.full_name}</h1>
            <p className="text-gray-500 text-sm">{coach.email}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Licences */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Licences</h2>
                {isAdmin && (
                  <button onClick={() => setShowLicenceModal(true)}
                    className="flex items-center gap-1.5 text-sm text-ukag-600 hover:text-ukag-800 border border-ukag-200 hover:border-ukag-400 px-3 py-1.5 rounded-lg">
                    <Plus size={14} /> Add
                  </button>
                )}
              </div>
              {licences.length === 0 ? (
                <p className="text-gray-400 text-sm">No licences on record</p>
              ) : (
                <div className="space-y-3">
                  {licences.map(lic => (
                    <div key={lic.id} className="border border-gray-100 rounded-lg p-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{lic.licence_type}</div>
                        {lic.licence_number && <div className="text-xs text-gray-500">#{lic.licence_number}</div>}
                        {lic.expiry_date && (
                          <div className={`flex items-center gap-1 text-xs mt-1 ${isExpired(lic.expiry_date) ? 'text-red-600' : isExpiringSoon(lic.expiry_date) ? 'text-amber-600' : 'text-gray-500'}`}>
                            {isExpired(lic.expiry_date) ? <AlertTriangle size={11} /> : isExpiringSoon(lic.expiry_date) ? <AlertTriangle size={11} /> : null}
                            Expires {new Date(lic.expiry_date).toLocaleDateString('en-GB')}
                          </div>
                        )}
                        {lic.cpd_hours_required > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            CPD: {lic.cpd_hours_completed}/{lic.cpd_hours_required}h
                          </div>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${LICENCE_STATUS_COLOURS[lic.status]}`}>
                        {lic.status.charAt(0).toUpperCase() + lic.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Course enrolments */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Training Courses</h2>
              {enrolments.length === 0 ? (
                <p className="text-gray-400 text-sm">No course enrolments</p>
              ) : (
                <div className="space-y-2">
                  {enrolments.map(enrol => (
                    <div key={enrol.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{enrol.course?.title}</div>
                        <div className="text-xs text-gray-500">
                          {enrol.course?.discipline} · {enrol.course?.date ? new Date(enrol.course.date).toLocaleDateString('en-GB') : 'TBC'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {enrol.certificate_issued && <CheckCircle size={14} className="text-green-500" />}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          enrol.status === 'completed' ? 'bg-green-100 text-green-700' :
                          enrol.status === 'enrolled' ? 'bg-blue-100 text-blue-700' :
                          enrol.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {enrol.status.charAt(0).toUpperCase() + enrol.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Awards sidebar */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Awards Achieved ({awards.length})</h3>
            {awards.length === 0 ? (
              <p className="text-gray-400 text-sm">No awards recorded</p>
            ) : (
              <div className="space-y-2">
                {awards.map(a => (
                  <div key={a.id} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-ukag-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{a.award?.name}</div>
                      <div className="text-xs text-gray-500">
                        {a.award?.discipline} · Level {a.award?.level}
                        {a.date_achieved && ` · ${new Date(a.date_achieved).toLocaleDateString('en-GB')}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showLicenceModal && (
        <AddLicenceModal
          profileId={coach.id}
          onClose={() => setShowLicenceModal(false)}
          onSaved={() => { setShowLicenceModal(false); if (id) loadData(id) }}
        />
      )}
    </Layout>
  )
}

function AddLicenceModal({ profileId, onClose, onSaved }: {
  profileId: string; onClose: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState({
    licence_type: 'Gymnastics Recreational',
    licence_number: '',
    status: 'active' as LicenceStatus,
    issue_date: '',
    expiry_date: '',
    cpd_hours_required: 0,
    cpd_hours_completed: 0,
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('coach_licences').insert({ ...form, profile_id: profileId })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Add Licence</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={save} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Licence type</label>
            <select value={form.licence_type} onChange={e => setForm(f => ({ ...f, licence_type: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500">
              <option>Gymnastics Recreational</option>
              <option>Trampolining Recreational</option>
              <option>Gymnastics & Trampolining Recreational</option>
              <option>Gymnastics Foundation</option>
              <option>Trampolining Foundation</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Licence number</label>
              <input value={form.licence_number} onChange={e => setForm(f => ({ ...f, licence_number: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as LicenceStatus }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue date</label>
              <input type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry date</label>
              <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPD hours required</label>
              <input type="number" min="0" value={form.cpd_hours_required} onChange={e => setForm(f => ({ ...f, cpd_hours_required: +e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPD hours completed</label>
              <input type="number" min="0" value={form.cpd_hours_completed} onChange={e => setForm(f => ({ ...f, cpd_hours_completed: +e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-ukag-600 hover:bg-ukag-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-medium">
              {saving ? 'Saving…' : 'Add Licence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function isExpired(date: string) { return new Date(date) < new Date() }
function isExpiringSoon(date: string) { return !isExpired(date) && new Date(date).getTime() - Date.now() < 90 * 86400000 }
