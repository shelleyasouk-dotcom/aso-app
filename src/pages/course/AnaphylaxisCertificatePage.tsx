import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Printer, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading…</div>

  if (!cert) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 gap-4 text-center">
        <Award size={40} className="text-gray-300" />
        <p className="font-bold text-gray-600">No certificate found</p>
        <p className="text-sm text-gray-400">Complete all 4 modules of the Anaphylaxis course to earn your certificate.</p>
        <button onClick={() => navigate('/course/anaphylaxis')} className="text-sm text-[#1a3a6b] font-semibold hover:underline">
          Go to course →
        </button>
      </div>
    )
  }

  const awardedDate = new Date(cert.completed_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Top bar — hidden when printing */}
      <div className="print:hidden bg-[#1a3a6b] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/course/anaphylaxis')}
          className="flex items-center gap-2 text-white/80 text-sm font-semibold hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#f5c518]/90 transition-colors"
        >
          <Printer size={15} /> Print / Save PDF
        </button>
      </div>

      {/* Certificate */}
      <div className="flex-1 flex items-center justify-center p-6 print:p-0 print:block">
        <div
          className="bg-white w-full max-w-2xl print:max-w-none print:w-full shadow-2xl print:shadow-none"
          style={{ minHeight: '540px', border: '8px solid #1a3a6b', fontFamily: 'Georgia, serif' }}
        >
          {/* Top stripe */}
          <div style={{ background: '#1a3a6b', padding: '20px 32px' }} className="flex items-center justify-between">
            <div>
              <p style={{ color: '#f5c518', fontSize: '11px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'sans-serif', margin: 0 }}>
                Active School Organisation
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontFamily: 'sans-serif', margin: '2px 0 0' }}>
                Registered CPD Training Provider
              </p>
            </div>
            <div style={{ fontSize: '36px' }}>🚨</div>
          </div>

          {/* Body */}
          <div style={{ padding: '40px 48px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#9ca3af', fontFamily: 'sans-serif', margin: '0 0 12px' }}>
              Certificate of Completion
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a3a6b', margin: '0 0 4px', lineHeight: 1.2 }}>
              Anaphylaxis Awareness Training
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'sans-serif', margin: '0 0 32px' }}>
              Benedict's Law Mandatory Training — September 2026
            </p>

            <p style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'sans-serif', margin: '0 0 8px' }}>
              This is to certify that
            </p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 8px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px', display: 'inline-block', minWidth: '300px' }}>
              {profile?.full_name}
            </p>

            <p style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'sans-serif', margin: '16px 0 4px' }}>
              has successfully completed all four modules of the
            </p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', margin: '0 0 24px' }}>
              ASO Anaphylaxis Awareness Programme
            </p>

            {/* Module summary */}
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '28px', textAlign: 'left' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#b91c1c', fontFamily: 'sans-serif', margin: '0 0 10px' }}>
                Modules completed
              </p>
              {[
                "Understanding Anaphylaxis & Benedict's Law",
                'Recognising an Anaphylactic Reaction',
                'Emergency Response & Adrenaline Auto-Injectors',
                'Your Responsibilities as an ASO Coach',
              ].map((m, i) => (
                <p key={i} style={{ fontSize: '12px', color: '#374151', fontFamily: 'sans-serif', margin: '0 0 4px', paddingLeft: '16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#16a34a', fontWeight: 700 }}>✓</span>
                  {m}
                </p>
              ))}
            </div>

            {/* Date + signatures row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'sans-serif', margin: '0 0 2px' }}>Date awarded</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', margin: 0 }}>{awardedDate}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a3a6b', fontFamily: 'sans-serif', margin: '0 0 2px' }}>Shelley Wood</p>
                <p style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'sans-serif', margin: 0 }}>Designated Safeguarding Lead</p>
                <p style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'sans-serif', margin: 0 }}>Active School Organisation</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'sans-serif', margin: '0 0 2px' }}>Valid until</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', margin: 0 }}>
                  {new Date(new Date(cert.completed_at).setFullYear(new Date(cert.completed_at).getFullYear() + 3))
                    .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom stripe */}
          <div style={{ background: '#1a3a6b', padding: '10px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontFamily: 'sans-serif', margin: 0 }}>
              www.activeschool.org.uk
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontFamily: 'sans-serif', margin: 0 }}>
              Issued via ASO Staff App
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
