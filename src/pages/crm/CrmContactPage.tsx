import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Trash2, Calendar, MessageSquare, PhoneCall, Users, MoreHorizontal, Check, Ban, Star } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { STATUS_LABELS, STATUS_CHIP, STATUS_BORDER } from './CrmPage'
import type { CrmContact, CrmInteraction, CrmStatus, CrmInteractionType, CrmOutcome } from '../../types'

const INTERACTION_LABELS: Record<CrmInteractionType, string> = {
  email: 'Email', call: 'Phone Call', visit: 'Visit', meeting: 'Meeting', other: 'Other',
}
const INTERACTION_ICONS: Record<CrmInteractionType, React.ElementType> = {
  email: Mail, call: PhoneCall, visit: MapPin, meeting: Users, other: MoreHorizontal,
}
const OUTCOME_STYLES: Record<CrmOutcome, string> = {
  positive: 'text-green-700 bg-green-50 border-green-200',
  neutral: 'text-gray-600 bg-gray-50 border-gray-200',
  negative: 'text-red-600 bg-red-50 border-red-200',
}

const SCHOOL_TYPES = ['Primary', 'Secondary', 'Special', 'Independent', 'Academy', 'Other']
const STATUSES = Object.keys(STATUS_LABELS) as CrmStatus[]
const SELECT = "w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 bg-white"
const today = new Date().toISOString().slice(0, 10)

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Next follow-up date = 7 days from today by default
function defaultFollowUp() {
  const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10)
}

interface InteractionRowProps {
  i: CrmInteraction
  canEdit: boolean
  onDelete: (id: string) => void
}

function InteractionRow({ i, canEdit, onDelete }: InteractionRowProps) {
  const Icon = INTERACTION_ICONS[i.type]
  const isOverdue = i.follow_up_date && i.follow_up_date < today
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 bg-[#f4f6f9] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-[#1a3a6b]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[#1a3a6b]">{INTERACTION_LABELS[i.type]}</p>
          {i.outcome && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${OUTCOME_STYLES[i.outcome]}`}>
              {i.outcome.charAt(0).toUpperCase() + i.outcome.slice(1)}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto">{fmt(i.date)}</span>
        </div>
        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap leading-snug">{i.notes}</p>
        {i.follow_up_date && (
          <p className={`text-xs mt-1.5 flex items-center gap-1 font-medium ${isOverdue ? 'text-red-500' : 'text-amber-600'}`}>
            <Calendar size={11} /> Follow up: {fmt(i.follow_up_date)} {isOverdue ? '(overdue)' : ''}
          </p>
        )}
      </div>
      {canEdit && (
        <button onClick={() => onDelete(i.id)} className="p-1.5 text-gray-300 hover:text-red-400 shrink-0 self-start">
          <Trash2 size={13} />
        </button>
      )}
    </div>
  )
}

export function CrmContactPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [contact, setContact] = useState<CrmContact | null>(null)
  const [interactions, setInteractions] = useState<CrmInteraction[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<CrmContact>>({})
  const [showLog, setShowLog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [logForm, setLogForm] = useState({
    type: 'email' as CrmInteractionType,
    date: today,
    notes: '',
    outcome: '' as CrmOutcome | '',
    follow_up_date: defaultFollowUp(),
    schedule_follow_up: true,
  })

  const canEdit = profile?.role === 'director' || profile?.role === 'area_lead' || profile?.role === 'outreach_worker'

  useEffect(() => { if (id) { loadContact(); loadInteractions() } }, [id])

  async function loadContact() {
    const { data } = await supabase.from('crm_contacts').select('*').eq('id', id!).single()
    if (data) { setContact(data); setEditForm(data) }
    setLoading(false)
  }

  async function loadInteractions() {
    const { data } = await supabase.from('crm_interactions').select('*, staff:profiles!staff_id(full_name)')
      .eq('contact_id', id!).order('date', { ascending: false })
    if (data) setInteractions(data)
  }

  async function saveContact() {
    if (!id || !editForm.school_name?.trim()) return
    setSaving(true)
    await supabase.from('crm_contacts').update({
      school_name: editForm.school_name, contact_name: editForm.contact_name || null,
      email: editForm.email || null, phone: editForm.phone || null,
      address: editForm.address || null, area: editForm.area || null,
      school_type: editForm.school_type || null, notes: editForm.notes || null,
      status: editForm.status, updated_at: new Date().toISOString(),
    }).eq('id', id)
    await loadContact()
    setEditing(false)
    setSaving(false)
  }

  async function updateStatus(status: CrmStatus) {
    if (!id || !canEdit) return
    const updates: Partial<CrmContact> = { status, updated_at: new Date().toISOString() as unknown as undefined }
    if (status === 'do_not_contact') updates.next_follow_up_date = null
    await supabase.from('crm_contacts').update(updates as any).eq('id', id)
    setContact(prev => prev ? { ...prev, status } : prev)
  }

  async function logInteraction() {
    if (!id || !profile || !logForm.notes.trim()) return
    setSaving(true)
    await supabase.from('crm_interactions').insert({
      contact_id: id, staff_id: profile.id,
      type: logForm.type, date: logForm.date,
      notes: logForm.notes.trim(),
      outcome: logForm.outcome || null,
      follow_up_date: logForm.schedule_follow_up ? logForm.follow_up_date : null,
    })

    // Update contact: advance status, record dates
    const newFollowUpNum = (contact?.follow_up_number ?? 0) + 1
    const newStatus: CrmStatus = contact?.status === 'prospect' ? 'initial_sent' : 'following_up'
    await supabase.from('crm_contacts').update({
      status: ['interested', 'onboarded', 'do_not_contact'].includes(contact?.status ?? '') ? contact!.status : newStatus,
      follow_up_number: newFollowUpNum,
      last_contacted_date: logForm.date,
      next_follow_up_date: logForm.schedule_follow_up ? logForm.follow_up_date : contact?.next_follow_up_date,
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    await loadContact()
    await loadInteractions()
    setLogForm({ type: 'email', date: today, notes: '', outcome: '', follow_up_date: defaultFollowUp(), schedule_follow_up: true })
    setShowLog(false)
    setSaving(false)
  }

  async function deleteInteraction(interactionId: string) {
    if (!confirm('Delete this interaction?')) return
    await supabase.from('crm_interactions').delete().eq('id', interactionId)
    setInteractions(prev => prev.filter(i => i.id !== interactionId))
  }

  async function deleteContact() {
    if (!confirm(`Permanently delete "${contact?.school_name}"?`)) return
    await supabase.from('crm_contacts').delete().eq('id', id!)
    navigate('/crm')
  }

  if (loading) return <Layout title="Loading…" showBack><p className="text-center text-gray-400 py-12">Loading…</p></Layout>
  if (!contact) return <Layout title="Not Found" showBack><p className="text-center text-gray-400 py-12">Contact not found.</p></Layout>

  const isOverdue = contact.next_follow_up_date && contact.next_follow_up_date < today && contact.status !== 'do_not_contact' && contact.status !== 'onboarded'

  return (
    <Layout title={contact.school_name} showBack>
      <div className={`h-1.5 ${STATUS_BORDER[contact.status].replace('border-l-', 'bg-').replace('border-l', 'bg')}`} />
      <div className="px-4 pt-4 flex flex-col gap-4 pb-8">

        {/* Status pipeline */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => canEdit && updateStatus(s)}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                contact.status === s ? `${STATUS_CHIP[s]} border-current` : 'bg-white text-gray-400 border-gray-200'
              }`}>
              {contact.status === s && <Check size={10} />}
              {s === 'do_not_contact' ? <><Ban size={10} /> DNC</> : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Overdue banner */}
        {isOverdue && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <Calendar size={15} className="text-amber-500 shrink-0" />
            <p className="text-sm font-semibold text-amber-800">Follow-up overdue since {fmt(contact.next_follow_up_date!)}</p>
          </div>
        )}

        {/* Contact card */}
        {editing ? (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">Edit Details</h3>
            <div className="flex flex-col gap-3">
              <Input label="School Name *" value={editForm.school_name ?? ''} onChange={e => setEditForm({ ...editForm, school_name: e.target.value })} />
              <Input label="Contact Name" value={editForm.contact_name ?? ''} onChange={e => setEditForm({ ...editForm, contact_name: e.target.value })} />
              <Input label="Email" type="email" value={editForm.email ?? ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
              <Input label="Phone" value={editForm.phone ?? ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
              <Input label="Town / Address" value={editForm.address ?? ''} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
              <Input label="Area / Region" value={editForm.area ?? ''} onChange={e => setEditForm({ ...editForm, area: e.target.value })} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">School Type</label>
                <select className={SELECT} value={editForm.school_type ?? ''} onChange={e => setEditForm({ ...editForm, school_type: e.target.value })}>
                  <option value="">Select…</option>
                  {SCHOOL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <select className={SELECT} value={editForm.status ?? 'prospect'} onChange={e => setEditForm({ ...editForm, status: e.target.value as CrmStatus })}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Notes</label>
                <textarea rows={3} value={editForm.notes ?? ''} onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none" />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
                <Button onClick={saveContact} disabled={saving} className="flex-1">{saving ? 'Saving…' : 'Save'}</Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-[#1a3a6b] text-lg leading-tight">{contact.school_name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {contact.school_type && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{contact.school_type}</span>}
                  {contact.area && <span className="text-xs text-gray-400">{contact.area}</span>}
                </div>
              </div>
              {canEdit && (
                <button onClick={() => setEditing(true)} className="text-xs font-medium text-[#1a3a6b] bg-blue-50 px-3 py-1.5 rounded-lg shrink-0">Edit</button>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              {contact.contact_name && (
                <div className="flex items-center gap-2.5 text-sm text-gray-700"><Users size={15} className="text-gray-400 shrink-0" />{contact.contact_name}</div>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 text-sm text-[#1a3a6b] font-medium"><Mail size={15} className="text-gray-400 shrink-0" />{contact.email}</a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2.5 text-sm text-[#1a3a6b] font-medium"><Phone size={15} className="text-gray-400 shrink-0" />{contact.phone}</a>
              )}
              {contact.address && (
                <div className="flex items-center gap-2.5 text-sm text-gray-700"><MapPin size={15} className="text-gray-400 shrink-0" />{contact.address}</div>
              )}
            </div>
            {/* Follow-up info */}
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Last contacted</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{contact.last_contacted_date ? fmt(contact.last_contacted_date) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Next follow-up</p>
                <p className={`text-sm font-medium mt-0.5 ${isOverdue ? 'text-red-500' : 'text-gray-700'}`}>
                  {contact.next_follow_up_date ? fmt(contact.next_follow_up_date) : '—'}
                </p>
              </div>
              {contact.follow_up_number > 0 && (
                <div>
                  <p className="text-xs text-gray-400">Follow-ups sent</p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">{contact.follow_up_number}</p>
                </div>
              )}
            </div>
            {contact.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
          </Card>
        )}

        {/* Quick action buttons */}
        {canEdit && contact.status !== 'do_not_contact' && (
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => { setLogForm(f => ({ ...f, type: 'email' })); setShowLog(true) }}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700">
              <Mail size={20} /><span className="text-xs font-semibold">Email sent</span>
            </button>
            <button onClick={() => { setLogForm(f => ({ ...f, type: 'call' })); setShowLog(true) }}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700">
              <PhoneCall size={20} /><span className="text-xs font-semibold">Called</span>
            </button>
            <button onClick={() => updateStatus('interested')}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border ${contact.status === 'interested' ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
              <Star size={20} /><span className="text-xs font-semibold">Interested</span>
            </button>
          </div>
        )}

        {/* Log form */}
        {showLog && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">Log Interaction</h3>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-5 gap-1.5">
                {(['email', 'call', 'visit', 'meeting', 'other'] as CrmInteractionType[]).map(t => {
                  const Icon = INTERACTION_ICONS[t]
                  return (
                    <button key={t} onClick={() => setLogForm({ ...logForm, type: t })}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[10px] font-medium transition-colors ${
                        logForm.type === t ? 'bg-[#1a3a6b] border-[#1a3a6b] text-white' : 'bg-white border-gray-200 text-gray-600'
                      }`}>
                      <Icon size={16} />
                      {INTERACTION_LABELS[t].split(' ')[0]}
                    </button>
                  )
                })}
              </div>
              <Input label="Date" type="date" value={logForm.date} onChange={e => setLogForm({ ...logForm, date: e.target.value })} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Notes *</label>
                <textarea rows={3} placeholder="What happened? What was discussed?"
                  value={logForm.notes} onChange={e => setLogForm({ ...logForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Outcome</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['positive', 'neutral', 'negative'] as CrmOutcome[]).map(o => (
                    <button key={o} onClick={() => setLogForm({ ...logForm, outcome: logForm.outcome === o ? '' : o })}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-colors ${
                        logForm.outcome === o ? OUTCOME_STYLES[o] : 'bg-white border-gray-200 text-gray-500'
                      }`}>
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Follow-up scheduler */}
              <div className="bg-amber-50 rounded-xl p-3 flex flex-col gap-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => setLogForm({ ...logForm, schedule_follow_up: !logForm.schedule_follow_up })}
                    className={`w-10 h-5 rounded-full transition-colors shrink-0 relative ${logForm.schedule_follow_up ? 'bg-[#1a3a6b]' : 'bg-gray-300'}`}>
                    <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                      style={{ transform: logForm.schedule_follow_up ? 'translateX(20px)' : 'translateX(2px)' }} />
                  </button>
                  <span className="text-sm font-semibold text-amber-800">Schedule follow-up</span>
                </label>
                {logForm.schedule_follow_up && (
                  <Input label="Follow-up date" type="date" value={logForm.follow_up_date}
                    onChange={e => setLogForm({ ...logForm, follow_up_date: e.target.value })} />
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowLog(false)} className="flex-1">Cancel</Button>
                <Button onClick={logInteraction} disabled={saving || !logForm.notes.trim()} className="flex-1">
                  {saving ? 'Saving…' : 'Log'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Mark as onboarded */}
        {canEdit && contact.status === 'interested' && (
          <Button variant="primary" fullWidth onClick={() => updateStatus('onboarded')}>
            <Check size={18} /> Mark as Onboarded
          </Button>
        )}

        {/* Interaction history */}
        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-[#1a3a6b]">Interaction History {interactions.length > 0 && `(${interactions.length})`}</p>
            {canEdit && !showLog && (
              <button onClick={() => setShowLog(true)} className="flex items-center gap-1.5 text-xs font-medium text-[#1a3a6b] bg-blue-50 px-3 py-1.5 rounded-lg">
                <MessageSquare size={12} /> Log
              </button>
            )}
          </div>
          {interactions.length === 0
            ? <p className="text-sm text-gray-400 text-center py-4">No interactions logged yet.</p>
            : interactions.map(i => <InteractionRow key={i.id} i={i} canEdit={canEdit} onDelete={deleteInteraction} />)
          }
        </Card>

        {/* Delete contact */}
        {canEdit && (
          <button onClick={deleteContact} className="text-xs text-red-400 text-center mt-2">
            Delete this contact
          </button>
        )}
      </div>
    </Layout>
  )
}
