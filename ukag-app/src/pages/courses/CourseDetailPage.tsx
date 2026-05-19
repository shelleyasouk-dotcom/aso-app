import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Users, Pound, CheckCircle, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import type { Course, CourseEnrolment, EnrolmentStatus } from '../../types'

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile: me } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrolments, setEnrolments] = useState<CourseEnrolment[]>([])
  const [myEnrolment, setMyEnrolment] = useState<CourseEnrolment | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  const isAdmin = me?.role === 'admin'

  useEffect(() => { if (id) loadData(id) }, [id, me])

  async function loadData(courseId: string) {
    const [courseRes, enrolmentsRes] = await Promise.all([
      supabase.from('courses').select('*').eq('id', courseId).single(),
      supabase.from('course_enrolments')
        .select('*, profile:profiles(id, full_name, email)')
        .eq('course_id', courseId)
        .order('created_at'),
    ])
    setCourse(courseRes.data)
    setEnrolments(enrolmentsRes.data ?? [])
    if (me) {
      setMyEnrolment((enrolmentsRes.data ?? []).find(e => e.profile_id === me.id) ?? null)
    }
    setLoading(false)
  }

  async function enrolSelf() {
    if (!me || !id) return
    setEnrolling(true)
    await supabase.from('course_enrolments').insert({ course_id: id, profile_id: me.id, status: 'enrolled' })
    await loadData(id)
    setEnrolling(false)
  }

  async function updateEnrolmentStatus(enrolmentId: string, status: EnrolmentStatus) {
    await supabase.from('course_enrolments').update({ status }).eq('id', enrolmentId)
    if (id) await loadData(id)
  }

  async function toggleCertificate(enrolmentId: string, current: boolean) {
    await supabase.from('course_enrolments').update({ certificate_issued: !current }).eq('id', enrolmentId)
    if (id) await loadData(id)
  }

  if (loading) return <Layout><div className="flex justify-center py-16"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-ukag-600" /></div></Layout>
  if (!course) return <Layout><div className="text-center py-16 text-gray-500">Course not found.</div></Layout>

  const spotsLeft = course.capacity ? course.capacity - enrolments.filter(e => e.status === 'enrolled' || e.status === 'completed').length : null
  const canEnrol = !myEnrolment && course.status === 'open' && (spotsLeft === null || spotsLeft > 0)

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/courses" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{course.title}</h1>
          {canEnrol && (
            <button onClick={enrolSelf} disabled={enrolling}
              className="flex items-center gap-2 bg-ukag-600 hover:bg-ukag-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Plus size={16} />
              {enrolling ? 'Enrolling…' : 'Enrol'}
            </button>
          )}
          {myEnrolment && (
            <span className={`text-sm px-3 py-1.5 rounded-lg font-medium ${
              myEnrolment.status === 'completed' ? 'bg-green-100 text-green-700' :
              myEnrolment.status === 'enrolled' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {myEnrolment.status === 'enrolled' ? 'You are enrolled' :
               myEnrolment.status === 'completed' ? 'Completed' : myEnrolment.status}
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Course Details</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-ukag-500 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">Date</div>
                    <div>{course.date ? new Date(course.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'TBC'}</div>
                    {course.end_date && course.end_date !== course.date && (
                      <div className="text-gray-400 text-xs">to {new Date(course.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    )}
                  </div>
                </div>
                {course.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="text-ukag-500 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400">Location</div>
                      <div>{course.location}</div>
                    </div>
                  </div>
                )}
                {course.capacity && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} className="text-ukag-500 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400">Capacity</div>
                      <div>{enrolments.filter(e => e.status === 'enrolled' || e.status === 'completed').length}/{course.capacity} enrolled{spotsLeft !== null && ` · ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}</div>
                    </div>
                  </div>
                )}
                {course.cost !== undefined && course.cost !== null && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Pound size={16} className="text-ukag-500 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400">Cost</div>
                      <div>£{Number(course.cost).toFixed(2)}</div>
                    </div>
                  </div>
                )}
                {course.tutor && (
                  <div>
                    <div className="text-xs text-gray-400">Tutor</div>
                    <div className="text-gray-600">{course.tutor}</div>
                  </div>
                )}
              </div>
              {course.description && (
                <p className="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4">{course.description}</p>
              )}
            </div>

            {/* Enrolments — admin only */}
            {isAdmin && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Enrolments ({enrolments.length})</h2>
                {enrolments.length === 0 ? (
                  <p className="text-gray-400 text-sm">No enrolments yet</p>
                ) : (
                  <div className="space-y-2">
                    {enrolments.map(enrol => (
                      <div key={enrol.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-ukag-100 flex items-center justify-center text-xs font-semibold text-ukag-700">
                            {enrol.profile?.full_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{enrol.profile?.full_name}</div>
                            <div className="text-xs text-gray-500">{enrol.profile?.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleCertificate(enrol.id, enrol.certificate_issued)}
                            className={`p-1 rounded ${enrol.certificate_issued ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                            title={enrol.certificate_issued ? 'Certificate issued' : 'Mark certificate issued'}>
                            <CheckCircle size={16} />
                          </button>
                          <select value={enrol.status}
                            onChange={e => updateEnrolmentStatus(enrol.id, e.target.value as EnrolmentStatus)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ukag-500">
                            <option value="enrolled">Enrolled</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                    course.status === 'open' ? 'bg-green-100 text-green-700' :
                    course.status === 'full' ? 'bg-amber-100 text-amber-700' :
                    course.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-100 text-red-700'
                  }`}>{course.status.charAt(0).toUpperCase() + course.status.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discipline</span>
                  <span className="font-medium text-gray-900">{course.discipline.charAt(0).toUpperCase() + course.discipline.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-900">{course.course_type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
