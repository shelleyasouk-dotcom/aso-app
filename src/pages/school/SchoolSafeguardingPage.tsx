import { useState, useEffect } from 'react'
import { ShieldCheck, CheckCircle, Mail, Phone } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { SchoolLayout } from '../../components/layout/SchoolLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useSchoolId } from '../../hooks/useSchoolId'

type ContactFields = {
  dsl_name: string
  dsl_email: string
  dsl_phone: string
  ddsl_name: string
  ddsl_email: string
  ddsl_phone: string
}

interface AsoContact {
  id: string
  type: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
}

export function SchoolSafeguardingPage() {
  useAuth()
  const schoolId = useSchoolId()
  const [form, setForm] = useState<ContactFields>({
    dsl_name: '', dsl_email: '', dsl_phone: '',
    ddsl_name: '', ddsl_email: '', ddsl_phone: '',
  })
  const [asoContacts, setAsoContacts] = useState<AsoContact[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load ASO safeguarding leads
    supabase
      .from('org_contacts')
      .select('id, type, name, title, email, phone')
      .in('type', ['dsl', 'ddsl'])
      .eq('is_active', true)
      .then(({ data }) => setAsoContacts((data ?? []) as AsoContact[]))
  }, [])

  useEffect(() => {
    if (!schoolId) return
    supabase
      .from('schools')
      .select('dsl_name, dsl_email, dsl_phone, ddsl_name, ddsl_email, ddsl_phone')
      .eq('id', schoolId)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            dsl_name:   data.dsl_name   ?? '',
            dsl_email:  data.dsl_email  ?? '',
            dsl_phone:  data.dsl_phone  ?? '',
            ddsl_name:  data.ddsl_name  ?? '',
            ddsl_email: data.ddsl_email ?? '',
            ddsl_phone: data.ddsl_phone ?? '',
          })
        }
        setLoading(false)
      })
  }, [schoolId])

  async function save() {
    if (!schoolId) return
    setSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('schools')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', schoolId)
    if (err) {
      setError('Could not save changes. Please try again.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const set = (key: keyof ContactFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const asoDsl  = asoContacts.find(c => c.type === 'dsl')
  const asoDdsl = asoContacts.find(c => c.type === 'ddsl')

  if (loading) {
    return (
      <SchoolLayout title="Safeguarding Contacts" showBack>
        <div className="px-4 pt-6 flex flex-col gap-4">
          {[1, 2].map(i => <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </SchoolLayout>
    )
  }

  return (
    <SchoolLayout title="Safeguarding Contacts" showBack>
      <div className="px-4 pt-6 pb-4 flex flex-col gap-5">

        {/* ASO Safeguarding Team */}
        {(asoDsl || asoDdsl) && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">ASO Safeguarding Team</p>
            {[asoDsl, asoDdsl].filter(Boolean).map(c => c && (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {c.type === 'dsl' ? 'Designated Safeguarding Lead' : 'Deputy Designated Safeguarding Lead'}
                  </p>
                  <p className="font-bold text-[#1a3a6b] text-sm">{c.name}</p>
                  {c.title && <p className="text-xs text-gray-500">{c.title}</p>}
                  <div className="flex flex-col gap-1.5 mt-2">
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="text-xs font-semibold text-[#1a3a6b] flex items-center gap-1.5">
                        <Mail size={12} /> {c.email}
                      </a>
                    )}
                    {c.phone && (
                      <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="text-xs font-semibold text-[#1a3a6b] flex items-center gap-1.5">
                        <Phone size={12} /> {c.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Your School's Safeguarding Contacts</p>

          <Card className="bg-[#1a3a6b]/5">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="text-[#1a3a6b] shrink-0 mt-0.5" />
              <p className="text-sm text-[#1a3a6b]">
                Keep your safeguarding contacts up to date. ASO will be notified automatically when you save changes.
              </p>
            </div>
          </Card>
        </div>

        {/* School DSL */}
        <Card>
          <p className="font-bold text-[#1a3a6b] mb-4">Designated Safeguarding Lead (DSL)</p>
          <div className="flex flex-col gap-3">
            <Input label="Full name" value={form.dsl_name}  onChange={set('dsl_name')}  placeholder="e.g. Jane Smith" />
            <Input label="Email"     value={form.dsl_email} onChange={set('dsl_email')} placeholder="e.g. j.smith@school.org" type="email" />
            <Input label="Phone"     value={form.dsl_phone} onChange={set('dsl_phone')} placeholder="e.g. 07700 900000" type="tel" />
          </div>
        </Card>

        {/* School DDSL */}
        <Card>
          <p className="font-bold text-[#1a3a6b] mb-4">Deputy Designated Safeguarding Lead (DDSL)</p>
          <div className="flex flex-col gap-3">
            <Input label="Full name" value={form.ddsl_name}  onChange={set('ddsl_name')}  placeholder="e.g. John Brown" />
            <Input label="Email"     value={form.ddsl_email} onChange={set('ddsl_email')} placeholder="e.g. j.brown@school.org" type="email" />
            <Input label="Phone"     value={form.ddsl_phone} onChange={set('ddsl_phone')} placeholder="e.g. 07700 900001" type="tel" />
          </div>
        </Card>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {saved && (
          <Card className="bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle size={18} className="text-green-600" />
              <p className="text-sm font-semibold text-green-700">Contacts saved successfully</p>
            </div>
          </Card>
        )}

        <Button variant="primary" size="lg" fullWidth onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Safeguarding Contacts'}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          Changes are saved to your school record and ASO will be notified at{' '}
          <a href="mailto:info@activeschool.org.uk" className="text-[#1a3a6b] font-semibold">
            info@activeschool.org.uk
          </a>
        </p>

      </div>
    </SchoolLayout>
  )
}
