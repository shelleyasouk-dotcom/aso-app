import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, BookOpen, MapPin, Calendar, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import type { Course, CourseStatus, Discipline } from '../../types'

const STATUS_COLOURS: Record<CourseStatus, string> = {
  open: 'bg-green-100 text-green-700',
  full: 'bg-amber-100 text-amber-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
}

const DISCIPLINE_COLOURS: Record<string, string> = {
  gymnastics: 'bg-purple-50 text-purple-700',
  trampolining: 'bg-blue-50 text-blue-700',
  both: 'bg-ukag-50 text-ukag-700',
}

export function CoursesPage() {
  const { profile } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [filtered, setFiltered] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [disciplineFilter, setDisciplineFilter] = useState<Discipline | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const isAdmin = profile?.role === 'admin'

  useEffect(() => { loadCourses() }, [])

  useEffect(() => {
    let result = courses
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c => c.title.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q) || c.tutor?.toLowerCase().includes(q))
    }
    if (disciplineFilter !== 'all') result = result.filter(c => c.discipline === disciplineFilter)
    if (statusFilter !== 'all') result = result.filter(c => c.status === statusFilter)
    setFiltered(result)
  }, [courses, search, disciplineFilter, statusFilter])

  async function loadCourses() {
    const { data } = await supabase
      .from('courses')
      .select('*, enrolment_count:course_enrolments(count)')
      .order('date', { ascending: true })
    const mapped = (data ?? []).map(c => ({
      ...c,
      enrolment_count: c.enrolment_count?.[0]?.count ?? 0,
    }))
    setCourses(mapped)
    setLoading(false)
  }

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Training Courses</h1>
            <p className="text-gray-500 text-sm mt-0.5">{filtered.length} course{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-ukag-600 hover:bg-ukag-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add Course
            </button>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
          </div>
          <select value={disciplineFilter} onChange={e => setDisciplineFilter(e.target.value as Discipline | 'all')}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ukag-500">
            <option value="all">All disciplines</option>
            <option value="gymnastics">Gymnastics</option>
            <option value="trampolining">Trampolining</option>
            <option value="both">Both</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as CourseStatus | 'all')}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ukag-500">
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="full">Full</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-ukag-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No courses found</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map(course => (
              <Link key={course.id} to={`/courses/${course.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm hover:border-ukag-200 transition-all flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{course.title}</div>
                    {course.course_type && (
                      <div className="text-xs text-gray-400 mt-0.5">{course.course_type}</div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLOURS[course.status]}`}>
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  {course.date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(course.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  {course.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {course.location}
                    </span>
                  )}
                  {course.capacity && (
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {course.enrolment_count}/{course.capacity} places
                    </span>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium self-start ${DISCIPLINE_COLOURS[course.discipline]}`}>
                  {course.discipline.charAt(0).toUpperCase() + course.discipline.slice(1)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showAddModal && isAdmin && (
        <AddCourseModal onClose={() => setShowAddModal(false)} onSaved={() => { setShowAddModal(false); loadCourses() }} />
      )}
    </Layout>
  )
}

function AddCourseModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: '', discipline: 'gymnastics' as Discipline, course_type: 'Foundation',
    description: '', date: '', end_date: '', location: '',
    capacity: '', tutor: '', cost: '', status: 'open' as CourseStatus,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, value: string) { setForm(f => ({ ...f, [key]: value })) }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    const { error } = await supabase.from('courses').insert({
      ...form,
      capacity: form.capacity ? +form.capacity : null,
      cost: form.cost ? +form.cost : null,
      date: form.date || null,
      end_date: form.end_date || null,
    })
    if (error) { setError(error.message); setSaving(false) }
    else onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Add Training Course</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={save} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course title *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" placeholder="e.g. Recreational Gymnastics Foundation" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
              <select value={form.discipline} onChange={e => set('discipline', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500">
                <option value="gymnastics">Gymnastics</option>
                <option value="trampolining">Trampolining</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course type</label>
              <select value={form.course_type} onChange={e => set('course_type', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500">
                <option>Foundation</option>
                <option>Award Level 1</option>
                <option>Award Level 2</option>
                <option>Award Level 3</option>
                <option>CPD</option>
                <option>Refresher</option>
                <option>Safeguarding</option>
                <option>First Aid</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
              <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" placeholder="Venue name and town" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" min="0" value={form.capacity} onChange={e => set('capacity', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost (£)</label>
              <input type="number" min="0" step="0.01" value={form.cost} onChange={e => set('cost', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500">
                <option value="open">Open</option>
                <option value="full">Full</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tutor</label>
            <input value={form.tutor} onChange={e => set('tutor', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-ukag-600 hover:bg-ukag-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-medium">
              {saving ? 'Saving…' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
