import { useEffect, useState } from 'react'
import { Award, BookOpen, ShieldCheck, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import type { CoachLicence, CourseEnrolment, CoachAward, LicenceStatus } from '../../types'

const LICENCE_STATUS_COLOURS: Record<LicenceStatus, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  suspended: 'bg-amber-100 text-amber-700',
  pending: 'bg-gray-100 text-gray-600',
}

export function ProfilePage() {
  const { profile, user } = useAuth()
  const [licences, setLicences] = useState<CoachLicence[]>([])
  const [enrolments, setEnrolments] = useState<CourseEnrolment[]>([])
  const [awards, setAwards] = useState<CoachAward[]>([])
  const [loading, setLoading] = useState(true)
  const [changingPassword, setChangingPassword] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    if (profile) loadData(profile.id)
  }, [profile])

  async function loadData(profileId: string) {
    const [licencesRes, enrolmentsRes, awardsRes] = await Promise.all([
      supabase.from('coach_licences').select('*').eq('profile_id', profileId).order('expiry_date', { ascending: false }),
      supabase.from('course_enrolments').select('*, course:courses(id, title, discipline, date, course_type)').eq('profile_id', profileId).order('created_at', { ascending: false }),
      supabase.from('coach_awards').select('*, award:awards(id, name, discipline, level)').eq('profile_id', profileId).order('date_achieved', { ascending: false }),
    ])
    setLicences(licencesRes.data ?? [])
    setEnrolments(enrolmentsRes.data ?? [])
    setAwards(awardsRes.data ?? [])
    setLoading(false)
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError(null)
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match'); return }
    if (pwForm.next.length < 8) { setPwError('Password must be at least 8 characters'); return }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    if (error) setPwError(error.message)
    else { setPwSuccess(true); setPwForm({ current: '', next: '', confirm: '' }); setChangingPassword(false) }
  }

  if (!profile) return null

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="space-y-4">
            {/* Profile card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-ukag-100 flex items-center justify-center text-ukag-700 font-bold text-xl">
                  {profile.full_name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{profile.full_name}</div>
                  <div className="text-gray-500 text-sm">{profile.email}</div>
                  <div className="text-xs mt-0.5 text-ukag-600 font-medium capitalize">{profile.role.replace('_', ' ')}</div>
                </div>
              </div>
              {profile.phone && <div className="text-sm text-gray-600">{profile.phone}</div>}

              <div className="mt-4 pt-4 border-t border-gray-100">
                {pwSuccess && <p className="text-sm text-green-600 mb-2">Password updated successfully.</p>}
                {!changingPassword ? (
                  <button onClick={() => setChangingPassword(true)} className="text-sm text-ukag-600 hover:text-ukag-800 font-medium">
                    Change password
                  </button>
                ) : (
                  <form onSubmit={changePassword} className="space-y-3">
                    <input type="password" placeholder="New password" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" required />
                    <input type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" required />
                    {pwError && <p className="text-xs text-red-600">{pwError}</p>}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setChangingPassword(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="flex-1 bg-ukag-600 hover:bg-ukag-700 text-white rounded-lg py-2 text-xs font-medium">Update</button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Awards */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-ukag-500" />
                <h3 className="font-semibold text-gray-900 text-sm">My Awards ({awards.length})</h3>
              </div>
              {loading ? <div className="h-8 animate-pulse bg-gray-100 rounded" /> :
               awards.length === 0 ? <p className="text-gray-400 text-sm">No awards yet</p> : (
                <div className="space-y-2">
                  {awards.map(a => (
                    <div key={a.id} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-ukag-100 flex items-center justify-center text-xs font-bold text-ukag-700">{a.award?.level}</div>
                      <div>
                        <div className="font-medium text-gray-900">{a.award?.name}</div>
                        <div className="text-xs text-gray-400">{a.award?.discipline}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {/* Licences */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={16} className="text-ukag-500" />
                <h2 className="font-semibold text-gray-900">My Licences</h2>
              </div>
              {loading ? <div className="h-16 animate-pulse bg-gray-100 rounded" /> :
               licences.length === 0 ? <p className="text-gray-400 text-sm">No licences on record</p> : (
                <div className="space-y-3">
                  {licences.map(lic => (
                    <div key={lic.id} className={`border rounded-lg p-3 flex items-start justify-between gap-3 ${
                      lic.expiry_date && isExpiringSoon(lic.expiry_date) ? 'border-amber-200 bg-amber-50' : 'border-gray-100'
                    }`}>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{lic.licence_type}</div>
                        {lic.licence_number && <div className="text-xs text-gray-500">#{lic.licence_number}</div>}
                        {lic.expiry_date && (
                          <div className={`flex items-center gap-1 text-xs mt-1 ${
                            isExpired(lic.expiry_date) ? 'text-red-600' :
                            isExpiringSoon(lic.expiry_date) ? 'text-amber-600' : 'text-gray-500'
                          }`}>
                            {(isExpired(lic.expiry_date) || isExpiringSoon(lic.expiry_date)) && <AlertTriangle size={11} />}
                            {isExpired(lic.expiry_date) ? 'Expired' : 'Expires'} {new Date(lic.expiry_date).toLocaleDateString('en-GB')}
                          </div>
                        )}
                        {lic.cpd_hours_required > 0 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>CPD Hours</span>
                              <span>{lic.cpd_hours_completed}/{lic.cpd_hours_required}h</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-ukag-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (lic.cpd_hours_completed / lic.cpd_hours_required) * 100)}%` }} />
                            </div>
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

            {/* Course history */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-ukag-500" />
                <h2 className="font-semibold text-gray-900">My Training Courses</h2>
              </div>
              {loading ? <div className="h-16 animate-pulse bg-gray-100 rounded" /> :
               enrolments.length === 0 ? <p className="text-gray-400 text-sm">No course history</p> : (
                <div className="space-y-2">
                  {enrolments.map(enrol => (
                    <div key={enrol.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{enrol.course?.title}</div>
                        <div className="text-xs text-gray-500">
                          {enrol.course?.discipline} · {enrol.course?.date ? new Date(enrol.course.date).toLocaleDateString('en-GB') : 'TBC'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {enrol.certificate_issued && <span className="text-xs text-green-600 font-medium">Cert ✓</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          enrol.status === 'completed' ? 'bg-green-100 text-green-700' :
                          enrol.status === 'enrolled' ? 'bg-blue-100 text-blue-700' :
                          enrol.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{enrol.status.charAt(0).toUpperCase() + enrol.status.slice(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function isExpired(date: string) { return new Date(date) < new Date() }
function isExpiringSoon(date: string) { return !isExpired(date) && new Date(date).getTime() - Date.now() < 90 * 86400000 }
