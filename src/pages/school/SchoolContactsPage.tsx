import { useState, useEffect } from 'react'
import { Phone, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { SchoolLayout } from '../../components/layout/SchoolLayout'

interface OrgContact {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  notes: string | null
}

export function SchoolContactsPage() {
  const [contacts, setContacts] = useState<OrgContact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('org_contacts')
      .select('id, name, title, email, phone, notes')
      .eq('type', 'useful')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => {
        setContacts((data ?? []) as OrgContact[])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <SchoolLayout title="Useful Contacts" showBack>
        <div className="px-4 pt-6 flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </SchoolLayout>
    )
  }

  return (
    <SchoolLayout title="Useful Contacts" showBack>
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">

        {contacts.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Key Contacts</p>
            {contacts.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
                <p className="font-bold text-[#1a3a6b] text-sm">{c.name}</p>
                {c.title && <p className="text-xs text-gray-500 mt-0.5">{c.title}</p>}
                {c.notes && <p className="text-xs text-gray-400 mt-2 leading-relaxed">{c.notes}</p>}
                {(c.phone || c.email) && (
                  <div className="flex flex-col gap-2 mt-3">
                    {c.phone && (
                      <a
                        href={`tel:${c.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-2.5 text-sm font-semibold text-[#1a3a6b]"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                          <Phone size={14} className="text-[#1a3a6b]" />
                        </div>
                        {c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        className="flex items-center gap-2.5 text-sm font-semibold text-[#1a3a6b]"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                          <Mail size={14} className="text-[#1a3a6b]" />
                        </div>
                        {c.email}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ASO General Contact — always shown */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Active School Onside</p>
          <div className="bg-[#1a3a6b]/5 rounded-2xl px-4 py-4 flex flex-col gap-3">
            <p className="font-bold text-[#1a3a6b] text-sm">General Enquiries</p>
            <a
              href="mailto:info@activeschool.org.uk"
              className="flex items-center gap-2.5 text-sm font-semibold text-[#1a3a6b]"
            >
              <div className="w-8 h-8 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                <Mail size={14} className="text-[#1a3a6b]" />
              </div>
              info@activeschool.org.uk
            </a>
          </div>
        </div>

        {contacts.length === 0 && (
          <p className="text-center text-xs text-gray-400 pt-2">
            Additional contacts will appear here once added by your ASO coordinator.
          </p>
        )}

      </div>
    </SchoolLayout>
  )
}
