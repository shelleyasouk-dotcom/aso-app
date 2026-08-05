import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X, ShieldCheck, Phone, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'

interface OrgContact {
  id: string
  type: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  notes: string | null
  display_order: number
}

interface ContactForm {
  type: string
  name: string
  title: string
  email: string
  phone: string
  notes: string
  display_order: number
}

const EMPTY_FORM: ContactForm = {
  type: 'useful',
  name: '',
  title: '',
  email: '',
  phone: '',
  notes: '',
  display_order: 0,
}

function ContactEditForm({
  form,
  setForm,
  onSave,
  onCancel,
  saving,
  error,
  showNotes = false,
}: {
  form: ContactForm
  setForm: React.Dispatch<React.SetStateAction<ContactForm>>
  onSave: () => void
  onCancel: () => void
  saving: boolean
  error: string | null
  showNotes?: boolean
}) {
  const inp = (key: keyof ContactForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="bg-white rounded-2xl border-2 border-[#1a3a6b]/20 px-4 py-4 flex flex-col gap-3">
      <div className="flex flex-col gap-2.5">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Full name *</label>
          <input
            value={form.name}
            onChange={inp('name')}
            placeholder="e.g. Jane Smith"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1a3a6b]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Role / title</label>
          <input
            value={form.title}
            onChange={inp('title')}
            placeholder="e.g. Director of Safeguarding"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1a3a6b]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Email</label>
          <input
            value={form.email}
            onChange={inp('email')}
            placeholder="e.g. jane@activeschool.org.uk"
            type="email"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1a3a6b]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Phone</label>
          <input
            value={form.phone}
            onChange={inp('phone')}
            placeholder="e.g. 07700 900000"
            type="tel"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1a3a6b]"
          />
        </div>
        {showNotes && (
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={inp('notes')}
              placeholder="Optional — extra context for schools"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1a3a6b] resize-none"
            />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-[#1a3a6b] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check size={15} /> {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-bold flex items-center justify-center gap-2"
        >
          <X size={15} /> Cancel
        </button>
      </div>
    </div>
  )
}

export function OrgContactsAdminPage() {
  const [contacts, setContacts] = useState<OrgContact[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('org_contacts')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    setContacts((data ?? []) as OrgContact[])
    setLoading(false)
  }

  function startEdit(c: OrgContact) {
    setEditingId(c.id)
    setForm({
      type: c.type,
      name: c.name,
      title: c.title ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      notes: c.notes ?? '',
      display_order: c.display_order,
    })
    setError(null)
  }

  function startNew(type: string) {
    setEditingId(`new-${type}`)
    setForm({ ...EMPTY_FORM, type })
    setError(null)
  }

  function cancel() {
    setEditingId(null)
    setError(null)
  }

  async function save() {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    const payload = {
      type: form.type,
      name: form.name.trim(),
      title: form.title.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      notes: form.notes.trim() || null,
      display_order: form.display_order,
      updated_at: new Date().toISOString(),
    }
    const isNew = editingId?.startsWith('new-')
    const { error: err } = isNew
      ? await supabase.from('org_contacts').insert({ ...payload, is_active: true })
      : await supabase.from('org_contacts').update(payload).eq('id', editingId!)
    if (err) { setError(err.message); setSaving(false); return }
    setSaving(false)
    setEditingId(null)
    load()
  }

  async function remove(id: string) {
    await supabase.from('org_contacts').update({ is_active: false }).eq('id', id)
    setContacts(cs => cs.filter(c => c.id !== id))
  }

  const dsl = contacts.find(c => c.type === 'dsl')
  const ddsl = contacts.find(c => c.type === 'ddsl')
  const useful = contacts.filter(c => c.type === 'useful')

  if (loading) return (
    <Layout title="Safeguarding & Contacts" showBack>
      <div className="px-4 pt-6 flex flex-col gap-3">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
      </div>
    </Layout>
  )

  function SafeguardCard({ contact, type, roleLabel }: { contact: OrgContact | undefined; type: string; roleLabel: string }) {
    const newKey = `new-${type}`
    const isEditing = editingId === (contact?.id ?? newKey)

    if (isEditing) {
      return <ContactEditForm form={form} setForm={setForm} onSave={save} onCancel={cancel} saving={saving} error={error} />
    }

    if (!contact) {
      return (
        <button
          onClick={() => startNew(type)}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-semibold text-gray-400"
        >
          <Plus size={16} /> Add {roleLabel}
        </button>
      )
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
          <ShieldCheck size={18} className="text-green-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1a3a6b] text-sm">{contact.name}</p>
          {contact.title && <p className="text-xs text-gray-500">{contact.title}</p>}
          {contact.email && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Mail size={11} /> {contact.email}
            </p>
          )}
          {contact.phone && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Phone size={11} /> {contact.phone}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => startEdit(contact)} className="p-2 rounded-xl hover:bg-gray-100">
            <Pencil size={14} className="text-gray-400" />
          </button>
          <button onClick={() => remove(contact.id)} className="p-2 rounded-xl hover:bg-red-50">
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout title="Safeguarding & Contacts" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-7">

        {/* ASO Safeguarding Leads */}
        <div className="flex flex-col gap-3">
          <div className="px-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ASO Safeguarding Leads</p>
            <p className="text-xs text-gray-400 mt-0.5">Shown to school portal users on the Safeguarding page.</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 px-1">Designated Safeguarding Lead (DSL)</p>
            <SafeguardCard contact={dsl} type="dsl" roleLabel="DSL" />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 px-1">Deputy Designated Safeguarding Lead (DDSL)</p>
            <SafeguardCard contact={ddsl} type="ddsl" roleLabel="DDSL" />
          </div>
        </div>

        {/* Useful Contacts */}
        <div className="flex flex-col gap-3">
          <div className="px-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Useful Contacts</p>
            <p className="text-xs text-gray-400 mt-0.5">Shown to school portal users on the Contacts page.</p>
          </div>

          {useful.map(c =>
            editingId === c.id ? (
              <ContactEditForm key={c.id} form={form} setForm={setForm} onSave={save} onCancel={cancel} saving={saving} error={error} showNotes />
            ) : (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1a3a6b] text-sm">{c.name}</p>
                  {c.title && <p className="text-xs text-gray-500">{c.title}</p>}
                  {c.email && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Mail size={11} /> {c.email}
                    </p>
                  )}
                  {c.phone && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone size={11} /> {c.phone}
                    </p>
                  )}
                  {c.notes && <p className="text-xs text-gray-400 mt-1.5 italic leading-relaxed">{c.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(c)} className="p-2 rounded-xl hover:bg-gray-100">
                    <Pencil size={14} className="text-gray-400" />
                  </button>
                  <button onClick={() => remove(c.id)} className="p-2 rounded-xl hover:bg-red-50">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            )
          )}

          {editingId === 'new-useful' ? (
            <ContactEditForm form={form} setForm={setForm} onSave={save} onCancel={cancel} saving={saving} error={error} showNotes />
          ) : (
            <button
              onClick={() => startNew('useful')}
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-semibold text-gray-400"
            >
              <Plus size={16} /> Add contact
            </button>
          )}
        </div>

      </div>
    </Layout>
  )
}
