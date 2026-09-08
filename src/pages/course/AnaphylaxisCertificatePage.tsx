import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Download, Share2, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'

const DISPLAY_SCALE = 0.82

export function AnaphylaxisCertificatePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const certRef = useRef<HTMLDivElement>(null)
  const [cert, setCert] = useState<{ completed_at: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [certHeight, setCertHeight] = useState(0)

  useEffect(() => {
    if (!profile) return
    supabase.from('course_certificates')
      .select('completed_at')
      .eq('user_id', profile.id)
      .eq('course_id', 'anaphylaxis_v1')
      .maybeSingle()
      .then(({ data }) => { setCert(data); setLoading(false) })
  }, [profile])

  // Measure natural height after cert renders, so the scale wrapper clips correctly
  useEffect(() => {
    if (!cert) return
    const t = setTimeout(() => {
      if (certRef.current) setCertHeight(certRef.current.offsetHeight)
    }, 100)
    return () => clearTimeout(t)
  }, [cert])

  async function handleDownload() {
    if (!certRef.current || !profile) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      // certRef is at natural size — capture at full quality regardless of display scale
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgW = pageW - 20
      const imgH = (canvas.height / canvas.width) * imgW
      const y = Math.max(10, (pageH - imgH) / 2)
      pdf.addImage(imgData, 'PNG', 10, y, imgW, imgH)

      const fileName = `ASO_Anaphylaxis_Certificate_${profile.full_name.replace(/\s+/g, '_')}.pdf`
      const blob = pdf.output('blob')

      // 1. Try native share sheet (iOS / Android) — goes to Files, email, AirDrop etc.
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], fileName, { type: 'application/pdf' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Anaphylaxis Training Certificate' })
          setDownloading(false)
          return
        }
      }

      // 2. Open blob URL in a new tab — iOS Safari shows inline PDF with save/share option
      const url = URL.createObjectURL(blob)
      const opened = window.open(url, '_blank')
      if (opened) {
        setTimeout(() => URL.revokeObjectURL(url), 10000)
        setDownloading(false)
        return
      }

      // 3. Desktop anchor download fallback
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      console.error('PDF generation failed:', err)
    }
    setDownloading(false)
  }

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

  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <Layout title="Certificate" showBack>
      <div className="flex flex-col gap-3 px-4 pb-6 pt-2">

        {/* Download / Share button — always visible at top */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white font-bold py-3.5 rounded-2xl text-sm disabled:opacity-60 shrink-0"
        >
          {downloading
            ? <><Loader2 size={16} className="animate-spin" /> Generating PDF…</>
            : canShare
            ? <><Share2 size={16} /> Save / Share Certificate</>
            : <><Download size={16} /> Download Certificate (PDF)</>
          }
        </button>

        {/*
          Outer wrapper: clips to DISPLAY_SCALE × natural height so there's
          no blank gap below the shrunken card. The inner scale div shrinks
          the card visually. certRef stays on the full-size card so html2canvas
          captures at full resolution regardless of display scale.
        */}
        <div style={{
          height: certHeight > 0 ? Math.ceil(certHeight * DISPLAY_SCALE) : 'auto',
          overflow: 'hidden',
          borderRadius: '16px',
        }}>
          <div style={{ transform: `scale(${DISPLAY_SCALE})`, transformOrigin: 'top center' }}>
            {/* This div is what html2canvas captures — keep at natural size */}
            <div
              ref={certRef}
              className="bg-white overflow-hidden shadow-lg"
              style={{ border: '4px solid #1a3a6b', borderRadius: '16px', fontFamily: 'Georgia, serif' }}
            >
              {/* Top stripe */}
              <div style={{ background: '#1a3a6b', padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#f5c518', fontSize: '10px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'sans-serif', margin: 0 }}>
                    Active School Organisation
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', fontFamily: 'sans-serif', margin: '2px 0 0' }}>
                    Registered CPD Training Provider
                  </p>
                </div>
                <div style={{ fontSize: '26px' }}>🚨</div>
              </div>

              {/* Body */}
              <div style={{ padding: '20px 22px', textAlign: 'center', background: '#ffffff' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#9ca3af', fontFamily: 'sans-serif', margin: '0 0 8px' }}>
                  Certificate of Completion
                </p>
                <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#1a3a6b', margin: '0 0 4px', lineHeight: 1.2 }}>
                  Anaphylaxis Awareness Training
                </h1>
                <p style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'sans-serif', margin: '0 0 14px' }}>
                  Benedict's Law Mandatory Training — September 2026
                </p>

                <p style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'sans-serif', margin: '0 0 5px' }}>
                  This is to certify that
                </p>
                <p style={{ fontSize: '21px', fontWeight: 700, color: '#111827', margin: '0 0 5px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', display: 'inline-block', minWidth: '220px' }}>
                  {profile?.full_name}
                </p>

                <p style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'sans-serif', margin: '12px 0 3px' }}>
                  has successfully completed all four modules of the
                </p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', margin: '0 0 14px' }}>
                  ASO Anaphylaxis Awareness Programme
                </p>

                {/* Module summary */}
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '14px', textAlign: 'left' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#b91c1c', fontFamily: 'sans-serif', margin: '0 0 7px' }}>
                    Modules completed
                  </p>
                  {[
                    "Understanding Anaphylaxis & Benedict's Law",
                    'Recognising an Anaphylactic Reaction',
                    'Emergency Response & Adrenaline Auto-Injectors',
                    'Your Responsibilities as an ASO Coach',
                  ].map((m, i) => (
                    <div key={i} style={{ fontSize: '11px', color: '#374151', fontFamily: 'sans-serif', margin: '0 0 3px', paddingLeft: '14px', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#16a34a', fontWeight: 700 }}>✓</span>
                      {m}
                    </div>
                  ))}
                </div>

                {/* Dates + signature */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '9px', color: '#9ca3af', fontFamily: 'sans-serif', margin: '0 0 2px' }}>Date awarded</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', margin: 0 }}>{awardedDate}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#1a3a6b', fontFamily: 'sans-serif', margin: '0 0 2px' }}>Shelley Wood</p>
                    <p style={{ fontSize: '9px', color: '#6b7280', fontFamily: 'sans-serif', margin: 0 }}>Designated Safeguarding Lead</p>
                    <p style={{ fontSize: '9px', color: '#6b7280', fontFamily: 'sans-serif', margin: 0 }}>Active School Organisation</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '9px', color: '#9ca3af', fontFamily: 'sans-serif', margin: '0 0 2px' }}>Valid until</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', margin: 0 }}>{validUntil}</p>
                  </div>
                </div>
              </div>

              {/* Bottom stripe */}
              <div style={{ background: '#1a3a6b', padding: '7px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontFamily: 'sans-serif', margin: 0 }}>
                  www.activeschool.org.uk
                </p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontFamily: 'sans-serif', margin: 0 }}>
                  Issued via ASO Staff App
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Stored on your profile as evidence of compliance with Benedict's Law. Renew annually.
        </p>

      </div>
    </Layout>
  )
}
