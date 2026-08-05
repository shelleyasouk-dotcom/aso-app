import { useState, useEffect } from 'react'
import { Phone, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { SchoolLayout } from '../../components/layout/SchoolLayout'
import { useSchoolId } from '../../hooks/useSchoolId'

interface PersonContact {
  full_name: string
  email?: string | null
  phone?: string | null
  roleLabel: string
}

interface OrgContact {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  notes: string | null
}

function ContactCard({ name, roleLabel, email, phone }: { name: string; roleLabel: string; email?: string | null; phone?: string | null }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{roleLabel}</p>
      <p className="font-bold text-[#1a3a6b] text-sm">{name}</p>
      {(phone || email) && (
        <div className="flex flex-col gap-2 mt-3">
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2.5 text-sm font-semibold text-[#1a3a6b]">
              <div className="w-8 h-8 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                <Phone size={14} className="text-[#1a3a6b]" />
              </div>
              {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-2.5 text-sm font-semibold text-[#1a3a6b]">
              <div className="w-8 h-8 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                <Mail size={14} className="text-[#1a3a6b]" />
              </div>
              {email}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export function SchoolContactsPage() {
  const schoolId = useSchoolId()
  const [schoolContacts, setSchoolContacts] = useState<PersonContact[]>([])
  const [orgContacts, setOrgContacts] = useState<OrgContact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!schoolId) return

    Promise.all([
      // Area lead for this school
      supabase
        .from('schools')
        .select('area_lead:profiles!area_lead_id(full_name, email, phone)')
        .eq('id', schoolId)
        .single(),

      // Lead coach(es) assigned to this school
      supabase
        .from('staff_school_assignments')
        .select('is_lead, staff:profiles!staff_id(full_name, email, phone)')
        .eq('school_id', schoolId)
        .eq('is_lead', true),

      // Org-wide useful contacts
      supabase
        .from('org_contacts')
        .select('id, name, title, email, phone, notes')
        .eq('type', 'useful')
        .eq('is_active', true)
        .order('display_order'),
    ]).then(([schoolRes, coachRes, orgRes]) => {
      const contacts: PersonContact[] = []

      // Area lead
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const areaLead = (schoolRes.data as any)?.area_lead
      if (areaLead?.full_name) {
        contacts.push({ full_name: areaLead.full_name, email: areaLead.email, phone: areaLead.phone, roleLabel: 'Area Lead' })
      }

      // Lead coaches
      for (const row of coachRes.data ?? []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const staff = (row as any).staff
        if (staff?.full_name) {
          contacts.push({ full_name: staff.full_name, email: staff.email, phone: staff.phone, roleLabel: 'Lead Coach' })
        }
      }

      setSchoolContacts(contacts)
      setOrgContacts((orgRes.data ?? []) as OrgContact[])
      setLoading(false)
    })
  }, [schoolId])

  if (loading) {
    return (
      <SchoolLayout title="Contacts" showBack>
        <div className="px-4 pt-6 flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </SchoolLayout>
    )
  }

  return (
    <SchoolLayout title="Contacts" showBack>
      <div className="px-4 pt-6 pb-10 flex flex-col gap-5">

        {/* School-specific contacts: area lead + lead coach */}
        {schoolContacts.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Your ASO Team</p>
            {schoolContacts.map((c, i) => (
              <ContactCard key={i} name={c.full_name} roleLabel={c.roleLabel} email={c.email} phone={c.phone} />
            ))}
          </div>
        )}

        {/* Org-wide useful contacts */}
        {orgContacts.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Key Contacts</p>
            {orgContacts.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
                {c.title && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{c.title}</p>}
                <p className="font-bold text-[#1a3a6b] text-sm">{c.name}</p>
                {c.notes && <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{c.notes}</p>}
                {(c.phone || c.email) && (
                  <div className="flex flex-col gap-2 mt-3">
                    {c.phone && (
                      <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="flex items-center gap-2.5 text-sm font-semibold text-[#1a3a6b]">
                        <div className="w-8 h-8 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                          <Phone size={14} className="text-[#1a3a6b]" />
                        </div>
                        {c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-2.5 text-sm font-semibold text-[#1a3a6b]">
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

        {/* ASO HQ — always shown */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Head Office</p>
          <div className="bg-[#1a3a6b]/5 rounded-2xl px-4 py-4">
            <p className="font-bold text-[#1a3a6b] text-sm mb-3">Active School Onside</p>
            <a href="mailto:info@activeschool.org.uk" className="flex items-center gap-2.5 text-sm font-semibold text-[#1a3a6b]">
              <div className="w-8 h-8 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                <Mail size={14} className="text-[#1a3a6b]" />
              </div>
              info@activeschool.org.uk
            </a>
          </div>
        </div>

      </div>
    </SchoolLayout>
  )
}
