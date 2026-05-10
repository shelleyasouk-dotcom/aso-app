import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Trash2, Calendar, MessageSquare, PhoneCall, Users, MoreHorizontal, Check } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import type { CrmContact, CrmInteraction, CrmStatus, CrmInteractionType, CrmOutcome } from '../../types'

const AREAS = ['Hampshire', 'Wiltshire', 'Dorset', 'Bath and North East Somerset', 'Oxfordshire']

const STATUS_LABELS: Record<CrmStatus, string> = {
  prospect: 'Prospect',
  contacted: 'Contacted',
  interested: 'Interested',
  onboarded: 'Onboarded',
  declined: 'Declined',
}

const STATUS_COLORS: Record<CrmStatus, 'gray' | 'blue' | 'yellow' | 'green' | 'red'> = {
  prospect: 'gray',
  contacted: 'blue',
  interested: 'yellow',
  onboarded: 'green',
  declined: 'red',
}

const INTERACTION_LABELS: Record<CrmInteractionType, string> = {
  email: 'Email',
  call: 'Phone Call',
  visit: 'Visit',
  meeting: 'Meeting',
  other: 'Other',
}

const INTERACTION_ICONS: Record<CrmInteractionType, React.ElementType> = {
  email: Mail,
  call: PhoneCall,
  visit: MapPin,
  meeting: Users,
  other: MoreHorizontal,
}

const OUTCOME_LABELS: Record<CrmOutcome, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
}

const OUTCOME_COLORS: Record<CrmOutcome, string> = {
  positive: 'text-green-600 bg-green-50 border-green-200',
  neutral: 'text-gray-600 bg-gray-50 border-gray-200',
  negative: 'text-red-600 bg-red-50 border-red-200',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface InteractionRowProps {
  interaction: CrmInteraction
  onDelete: (id: string) => void
  canEdit: boolean
}

function InteractionRow({ interaction, onDelete, canEdit }: InteractionRowProps) {
  const Icon = INTERACTION_ICONS[interaction.type]
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 bg-[#f4f6f9] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-[#1a3a6b]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[#1a3a6b]">{INTERACTION_LABELS[interaction.type]}</p>
          {interaction.outcome && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${OUTCOME_COLORS[interaction.outcome]}`}>
              {OUTCOME_LABELS[interaction.outcome]}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(interaction.date)}</p>
        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap leading-snug">{interaction.notes}</p>
        {interaction.follow_up_date && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Calendar size={12} className="text-amber-500" />
            <p className="text-xs text-amber-600 font-medium">Follow up: {formatDate(interaction.follow_up_date)}</p>
          </div>
        )}
      </div>
      {canEdit && (
        <button onClick={() => onDelete(interaction.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 shrink-0">
          <Trash2 size={13} />
        </button>
      )}
    </div>
  )
}

const SELECT_CLASS = "w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"

export function CrmContactPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()

  const [contact, setContact] = useState<CrmContact | null>(null)
  const [interactions, setInteractions] = useState<CrmInteraction[]>([])
  const [loading, setLoading] = useState(true)
  const [editingContact, setEditingContact] = useState(false)
  const [contactForm, setContactForm] = useState<Partial<CrmContact>>({})
  const [showInteractionForm, setShowInteractionForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [interactionForm, setInteractionForm] = useState({
    type: 'email' as CrmInteractionType,
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    outcome: '' as CrmOutcome | '',
    follow_up_date: '',
  })

  const canEdit = profile?.role === 'director' || profile?.role === 'area_lead' || profile?.role === 'outreach_worker'

  useEffect(() => {
    if (!id) return
    loadContact(id)
    loadInteractions(id)
  }, [id])

  async function loadContact(contactId: string) {
    const { data } = await supabase.from('crm_contacts').select('*').eq('id', contactId).single()
    if (data) {
      setContact(data)
      setContactForm(data)
    }
    setLoading(false)
  }

  async function loadInteractions(contactId: string) {
    const { data } = await supabase
      .from('crm_interactions')
      .select('*, staff:profiles!staff_id(full_name)')
      .eq('contact_id', contactId)
      .order('date', { ascending: false })
    if (data) setInteractions(data)
  }

  async function saveContact() {
    if (!id || !contactForm.school_name?.trim()) return
    setSaving(true)
    await supabase.from('crm_contacts').update({
      school_name: contactForm.school_name,
      contact_name: contactForm.contact_name || null,
      email: contactForm.email || null,
      phone: contactForm.phone || null,
      address: contactForm.address || null,
      area: contactForm.area || null,
      status: contactForm.status,
      notes: contactForm.notes || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    await loadContact(id)
    setEditingContact(false)
    setSaving(false)
  }

  async function updateStatus(status: CrmStatus) {
    if (!id) return
    await supabase.from('crm_contacts').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setContact(prev => prev ? { ...prev, status } : prev)
  }

  async function logInteraction() {
    if (!id || !interactionForm.notes.trim() || !profile) return
    setSaving(true)
    const { data } = await supabase.from('crm_interactions').insert({
      contact_id: id,
      staff_id: profile.id,
      type: interactionForm.type,
      date: interactionForm.date,
      notes: interactionForm.notes.trim(),
      outcome: interactionForm.outcome || null,
      follow_up_date: interactionForm.follow_up_date || null,
    }).select('*, staff:profiles!staff_id(full_name)').single()
    if (data) setInteractions(prev => [data, ...prev])
    // Auto-advance status to 'contacted' if still prospect
    if (contact?.status === 'prospect') updateStatus('contacted')
    setInteractionForm({ type: 'email', date: new Date().toISOString().slice(0, 10), notes: '', outcome: '', follow_up_date: '' })
    setShowInteractionForm(false)
    // Update contact updated_at
    await supabase.from('crm_contacts').update({ updated_at: new Date().toISOString() }).eq('id', id)
    setSaving(false)
  }

  async function deleteInteraction(interactionId: string) {
    if (!confirm('Delete this interaction log?')) return
    await supabase.from('crm_interactions').delete().eq('id', interactionId)
    setInteractions(prev => prev.filter(i => i.id !== interactionId))
  }

  if (loading) return (
    <Layout title="School Contact" showBack>
      <p className="text-center text-gray-400 py-12">Loading…</p>
    </Layout>
  )
  if (!contact) return (
    <Layout title="Not Found" showBack>
      <p className="text-center text-gray-400 py-12">Contact not found.</p>
    </Layout>
  )

  return (
    <Layout title={contact.school_name} showBack>
      <div className="px-4 pt-6 flex flex-col gap-4 pb-8">

        {/* Status bar */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['prospect', 'contacted', 'interested', 'onboarded', 'declined'] as CrmStatus[]).map(s => (
            <button
              key={s}
              onClick={() => canEdit && updateStatus(s)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                contact.status === s
                  ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              {contact.status === s && <Check size={11} />}
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Contact details card */}
        {editingContact ? (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">Edit Details</h3>
            <div className="flex flex-col gap-3">
              <Input label="School Name *" value={contactForm.school_name ?? ''}
                onChange={e => setContactForm({ ...contactForm, school_name: e.target.value })} />
              <Input label="Contact Name" value={contactForm.contact_name ?? ''}
                onChange={e => setContactForm({ ...contactForm, contact_name: e.target.value })} />
              <Input label="Email" type="email" value={contactForm.email ?? ''}
                onChange={e => setContactForm({ ...contactForm, email: e.target.value })} />
              <Input label="Phone" value={contactForm.phone ?? ''}
                onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} />
              <Input label="Address / Town" value={contactForm.address ?? ''}
                onChange={e => setContactForm({ ...contactForm, address: e.target.value })} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Area</label>
                <select className={SELECT_CLASS} value={contactForm.area ?? ''}
                  onChange={e => setContactForm({ ...contactForm, area: e.target.value })}>
                  <option value="">No area</option>
                  {AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <select className={SELECT_CLASS} value={contactForm.status ?? 'prospect'}
                  onChange={e => setContactForm({ ...contactForm, status: e.target.value as CrmStatus })}>
                  {(Object.keys(STATUS_LABELS) as CrmStatus[]).map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Notes</label>
                <textarea rows={3} value={contactForm.notes ?? ''}
                  onChange={e => setContactForm({ ...contactForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none" />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setEditingContact(false)} className="flex-1">Cancel</Button>
                <Button onClick={saveContact} disabled={saving} className="flex-1">{saving ? 'Saving…' : 'Save'}</Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-[#1a3a6b] text-lg">{contact.school_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge color={STATUS_COLORS[contact.status]}>{STATUS_LABELS[contact.status]}</Badge>
                  {contact.area && <span className="text-xs text-gray-400">{contact.area}</span>}
                </div>
              </div>
              {canEdit && (
                <button onClick={() => setEditingContact(true)}
                  className="text-xs font-medium text-[#1a3a6b] bg-blue-50 px-3 py-1.5 rounded-lg">
                  Edit
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {contact.contact_name && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Users size={14} className="text-gray-400 shrink-0" />
                  {contact.contact_name}
                </div>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-[#1a3a6b]">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-[#1a3a6b]">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  {contact.phone}
                </a>
              )}
              {contact.address && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  {contact.address}
                </div>
              )}
              {contact.notes && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{contact.notes}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Log interaction */}
        {canEdit && (
          <Button variant="primary" fullWidth onClick={() => setShowInteractionForm(!showInteractionForm)}>
            <MessageSquare size={18} /> Log Interaction
          </Button>
        )}

        {showInteractionForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">Log Interaction</h3>
            <div className="flex flex-col gap-3">
              {/* Type picker */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Type</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['email', 'call', 'visit', 'meeting', 'other'] as CrmInteractionType[]).map(t => {
                    const Icon = INTERACTION_ICONS[t]
                    return (
                      <button key={t} onClick={() => setInteractionForm({ ...interactionForm, type: t })}
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[10px] font-medium transition-colors ${
                          interactionForm.type === t
                            ? 'bg-[#1a3a6b] border-[#1a3a6b] text-white'
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}>
                        <Icon size={16} />
                        {t === 'call' ? 'Call' : INTERACTION_LABELS[t].split(' ')[0]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Input label="Date" type="date" value={interactionForm.date}
                onChange={e => setInteractionForm({ ...interactionForm, date: e.target.value })} />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Notes *</label>
                <textarea rows={3} placeholder="What happened? What was discussed?"
                  value={interactionForm.notes}
                  onChange={e => setInteractionForm({ ...interactionForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none" />
              </div>

              {/* Outcome */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Outcome</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['positive', 'neutral', 'negative'] as CrmOutcome[]).map(o => (
                    <button key={o} onClick={() => setInteractionForm({ ...interactionForm, outcome: interactionForm.outcome === o ? '' : o })}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-colors ${
                        interactionForm.outcome === o ? OUTCOME_COLORS[o] : 'bg-white border-gray-200 text-gray-500'
                      }`}>
                      {OUTCOME_LABELS[o]}
                    </button>
                  ))}
                </div>
              </div>

              <Input label="Follow-up Date (optional)" type="date" value={interactionForm.follow_up_date}
                onChange={e => setInteractionForm({ ...interactionForm, follow_up_date: e.target.value })} />

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowInteractionForm(false)} className="flex-1">Cancel</Button>
                <Button onClick={logInteraction} disabled={saving || !interactionForm.notes.trim()} className="flex-1">
                  {saving ? 'Saving…' : 'Log'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Interaction history */}
        <Card>
          <p className="text-sm font-bold text-[#1a3a6b] mb-1">
            Interaction History {interactions.length > 0 && `(${interactions.length})`}
          </p>
          {interactions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No interactions logged yet.</p>
          ) : (
            interactions.map(i => (
              <InteractionRow key={i.id} interaction={i} onDelete={deleteInteraction} canEdit={canEdit} />
            ))
          )}
        </Card>
      </div>
    </Layout>
  )
}
