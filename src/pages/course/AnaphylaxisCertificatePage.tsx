import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Printer } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'

export function AnaphylaxisCertificatePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [cert, setCert] = useState<{ completed_at: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase.from('course_certificates')
      .select('completed_at')
      .eq('user_id', profile.id)
      .eq('course_id', 'anaphylaxis_v1')
      .maybeSingle()
      .then(({ data }) => { setCert(data); setLoading(false) })
  }, [profile])

  if (loading) return (
    <Layout title="Certificate" showBack>
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading…</div>
    </Layout>
  )

  if (!cert) {
    return (
      <Layout title="Certificate" showBack>
        <div className="flex flex-col items-center justify-center px-6 py-16 gap-4 text-center">
          <Award size={40} className="text-gray-300" />
          <p className="font-bold text-gray-600">No certificate found</p>
          <p className="text-sm text-gray-400">Complete all 4 modules of the Anaphylaxis course to earn your certificate.</p>
          <button onClick={() => navigate('/course/anaphylaxis')} className="text-sm text-[#1a3a6b] font-semibold">
            Go to course →
          </button>
        </div>
      </Layout>
    )
  }

  const awardedDate = new Date(cert.completed_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const validUntil = new Date(new Date(cert.completed_at).setFullYear(new Date(cert.completed_at).getFullYear() + 1))
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Layout title="Certificate" showBack>
      <div className="flex flex-col gap-4 px-4 pb-10 pt-2">

        {/* Print button — always visible on the page */}
        <button
          onClick={() => window.print()}
          className="print:hidden w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white font-bold py-3.5 rounded-2xl text-sm"
        >
          <Printer size={16} /> Print / Save PDF
        </button>

        {/* Certificate card */}
        <div
          id="certificate"
          className="bg-white rounded-2xl overflow-hidden shadow-lg print:shadow-none print:rounded-none"
          style={{ border: '4px solid #1a3a6b', fontFamily: 'Georgia, serif' }}
        >
          {/* Top stripe */}
          <div style={{ background: '#1a3a6b', padding: '16px 24px' }} className="flex items-center justify-between">
            <div>
              <p style={{ color: '#f5c518', fontSize: '10px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'sans-serif', margin: 0 }}>
                Active School Organisation
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', fontFamily: 'sans-serif', margin: '2px 0 0' }}>
                Registered CPD Training Provider
              </p>
            </div>
            <div style={{ fontSize: '28px' }}>🚨</div>
          </div>

          {/* Body */}
          <div style={{ padding: '28px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#9ca3af', fontFamily: 'sans-serif', margin: '0 0 10px' }}>
              Certificate of Completion
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a3a6b', margin: '0 0 4px', lineHeight: 1.2 }}>
              Anaphylaxis Awareness Training
            </h1>
            <p style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'sans-serif', margin: '0 0 20px' }}>
              Benedict's Law Mandatory Training — September 2026
            </p>

            <p style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'sans-serif', margin: '0 0 6px' }}>
              This is to certify that
            </p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 6px', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px', display: 'inline-block', minWidth: '240px' }}>
              {profile?.full_name}
            </p>

            <p style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'sans-serif', margin: '14px 0 4px' }}>
              has successfully completed all four modules of the
            </p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', margin: '0 0 20px' }}>
              ASO Anaphylaxis Awareness Programme
            </p>

            {/* Module summary */}
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', marginBottom: '20px', textAlign: 'left' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#b91c1c', fontFamily: 'sans-serif', margin: '0 0 8px' }}>
                Modules completed
              </p>
              {[
                "Understanding Anaphylaxis & Benedict's Law",
                'Recognising an Anaphylactic Reaction',
                'Emergency Response & Adrenaline Auto-Injectors',
                'Your Responsibilities as an ASO Coach',
              ].map((m, i) => (
                <p key={i} style={{ fontSize: '11px', color: '#374151', fontFamily: 'sans-serif', margin: '0 0 4px', paddingLeft: '14px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#16a34a', fontWeight: 700 }}>✓</span>
                  {m}
                </p>
              ))}
            </div>

            {/* Date + signatures row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '9px', color: '#9ca3af', fontFamily: 'sans-serif', margin: '0 0 2px' }}>Date awarded</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', margin: 0 }}>{awardedDate}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a3a6b', fontFamily: 'sans-serif', margin: '0 0 2px' }}>Shelley Wood</p>
                <p style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'sans-serif', margin: 0 }}>Designated Safeguarding Lead</p>
                <p style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'sans-serif', margin: 0 }}>Active School Organisation</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '9px', color: '#9ca3af', fontFamily: 'sans-serif', margin: '0 0 2px' }}>Valid until</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', margin: 0 }}>{validUntil}</p>
              </div>
            </div>
          </div>

          {/* Bottom stripe */}
          <div style={{ background: '#1a3a6b', padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontFamily: 'sans-serif', margin: 0 }}>
              www.activeschool.org.uk
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontFamily: 'sans-serif', margin: 0 }}>
              Issued via ASO Staff App
            </p>
          </div>
        </div>

        <p className="print:hidden text-xs text-gray-400 text-center">
          This certificate is stored on your profile as evidence of compliance with Benedict's Law.
          Renew annually before your first session of each academic year.
        </p>

      </div>

      <style>{`
        @media print {
          body { margin: 0; background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </Layout>
  )
}
