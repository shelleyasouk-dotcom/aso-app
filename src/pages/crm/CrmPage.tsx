import { useState, useEffect } from 'react'
import { Plus, Search, Building2, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import type { CrmContact, CrmStatus } from '../../types'

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

interface NewContactForm {
  school_name: string
  contact_name: string
  email: string
  phone: string
  address: string
  area: string
  notes: string
}

const emptyForm: NewContactForm = {
  school_name: '', contact_name: '', email: '', phone: '', address: '', area: '', notes: '',
}

function ContactCard({ contact, onClick }: { contact: CrmContact; onClick: () => void }) {
  return (
    <Card onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#f4f6f9] rounded-xl flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-[#1a3a6b]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1a3a6b] truncate">{contact.school_name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <Badge color={STATUS_COLORS[contact.status]}>{STATUS_LABELS[contact.status]}</Badge>
            {contact.area && <span className="text-xs text-gray-400">{contact.area}</span>}
            {contact.contact_name && <span className="text-xs text-gray-400">{contact.contact_name}</span>}
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-300 shrink-0" />
      </div>
    </Card>
  )
}

export function CrmPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<CrmContact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<NewContactForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<CrmStatus | ''>('')
  const [filterArea, setFilterArea] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('crm_contacts')
      .select('*')
      .order('updated_at', { ascending: false })
    if (data) setContacts(data)
    setLoading(false)
  }

  async function addContact() {
    if (!form.school_name.trim() || !profile) return
    setSaving(true)
    const { data } = await supabase.from('crm_contacts').insert({
      school_name: form.school_name.trim(),
      contact_name: form.contact_name.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      area: form.area || null,
      notes: form.notes.trim() || null,
      status: 'prospect',
      created_by: profile.id,
    }).select().single()
    if (data) {
      setContacts(prev => [data, ...prev])
      navigate(`/crm/${data.id}`)
    }
    setForm(emptyForm)
    setShowForm(false)
    setSaving(false)
  }

  const filtered = contacts.filter(c => {
    const matchesSearch = !search ||
      c.school_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.contact_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !filterStatus || c.status === filterStatus
    const matchesArea = !filterArea || c.area === filterArea
    return matchesSearch && matchesStatus && matchesArea
  })

  const counts = Object.fromEntries(
    (['prospect', 'contacted', 'interested', 'onboarded', 'declined'] as CrmStatus[]).map(s => [
      s, contacts.filter(c => c.status === s).length
    ])
  )

  const SELECT_CLASS = "w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"

  return (
    <Layout title="School Outreach" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4 pb-8">

        <Button variant="primary" size="lg" fullWidth onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Add School
        </Button>

        {showForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">New School Contact</h3>
            <div className="flex flex-col gap-3">
              <Input label="School Name *" placeholder="e.g. Westfield Primary School"
                value={form.school_name} onChange={e => setForm({ ...form, school_name: e.target.value })} />
              <Input label="Contact Name" placeholder="e.g. Mrs Johnson (Head Teacher)"
                value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
              <Input label="Email" type="email" placeholder="head@westfield.sch.uk"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input label="Phone" placeholder="01234 567890"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input label="Address / Town" placeholder="e.g. Basingstoke, Hampshire"
                value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Area</label>
                <select className={SELECT_CLASS} value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}>
                  <option value="">Select area…</option>
                  {AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Notes</label>
                <textarea rows={3} placeholder="Any initial notes…"
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] resize-none" />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setShowForm(false); setForm(emptyForm) }} className="flex-1">Cancel</Button>
                <Button onClick={addContact} disabled={saving || !form.school_name.trim()} className="flex-1">
                  {saving ? 'Saving…' : 'Add School'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stats strip */}
        {contacts.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['prospect', 'contacted', 'interested', 'onboarded', 'declined'] as CrmStatus[]).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                  filterStatus === s ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]' : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                <span className={`text-lg font-bold leading-none mb-0.5 ${filterStatus === s ? 'text-white' : 'text-[#1a3a6b]'}`}>
                  {counts[s]}
                </span>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        )}

        {/* Search + area filter */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search schools or contacts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none"
            value={filterArea} onChange={e => setFilterArea(e.target.value)}>
            <option value="">All areas</option>
            {AREAS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-8">
            <Building2 size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{contacts.length === 0 ? 'No schools added yet.' : 'No results match your search.'}</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(c => (
              <ContactCard key={c.id} contact={c} onClick={() => navigate(`/crm/${c.id}`)} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
