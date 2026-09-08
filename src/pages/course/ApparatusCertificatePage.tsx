import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Award, Download, Share2, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { APPARATUS_CPD_COURSES } from '../../data/apparatusCpd'

const APPARATUS_MODULES: Record<string, string[]> = {
  floor: [
    'Floor Skills: UKAG Level 1–3 Progressions',
    'Coaching Delivery on Floor',
    'Behaviour Management on Floor',
    'Floor Safety & Risk Assessment',
  ],
  bars: [
    'Bars Skills: UKAG Level 1–3 Progressions',
    'Coaching Delivery on Bars',
    'Group Management on Bars',
    'Bars Safety & Risk Assessment',
  ],
  beam: [
    'Beam Skills: UKAG Level 1–3 Progressions',
    'Coaching Delivery on Beam',
    'Building Confidence on Beam',
    'Beam Safety & Risk Assessment',
  ],
  vault: [
    'Vault Skills: UKAG Level 1–3 Progressions',
    'Coaching Delivery on Vault',
    'Queue Management on Vault',
    'Vault Safety & Risk Assessment',
  ],
}

export function ApparatusCertificatePage() {
  const { courseSlug } = useParams<{ courseSlug: string }>()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const certRef = useRef<HTMLDivElement>(null)
  const [cert, setCert] = useState<{ completed_at: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  const course = APPARATUS_CPD_COURSES.find(c => c.slug === courseSlug) ?? null

  useEffect(() => {
    if (!profile || !course) return
    supabase.from('course_certificates')
      .select('completed_at')
      .eq('user_id', profile.id)
      .eq('course_id', course.id)
      .maybeSingle()
      .then(({ data }) => { setCert(data); setLoading(false) })
  }, [profile, course])

  async function handleDownload() {
    if (!certRef.current || !profile || !course) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

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

      const safeName = profile.full_name.replace(/\s+/g, '_')
      const safeTitle = course.title.replace(/\s+/g, '_')
      const fileName = `ASO_${safeTitle}_Certificate_${safeName}.pdf`

      if (navigator.share && navigator.canShare) {
        const blob = pdf.output('blob')
        const file = new File([blob], fileName, { type: 'application/pdf' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `${course.title} Certificate` })
          setDownloading(false)
          return
        }
      }

      pdf.save(fileName)
    } catch (err) {
      console.error('PDF generation failed:', err)
    }
    setDownloading(false)
  }

  if (!course) {
    return (
      <Layout title="Certificate" showBack>
        <p className="text-center text-gray-400 py-16">Course not found.</p>
      </Layout>
    )
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
          <p className="text-sm text-gray-400">Complete all modules of {course.title} to earn your certificate.</p>
          <button onClick={() => navigate(`/course/apparatus/${courseSlug}`)} className="text-sm text-[#1a3a6b] font-semibold">
            Go to course →
          </button>
        </div>
      </Layout>
    )
  }

  const awardedDate = new Date(cert.completed_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const modules = APPARATUS_MODULES[courseSlug ?? ''] ?? []
  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <Layout title="Certificate" showBack>
      <div className="flex flex-col gap-4 px-4 pb-10 pt-2">

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white font-bold py-3.5 rounded-2xl text-sm disabled:opacity-60"
        >
          {downloading
            ? <><Loader2 size={16} className="animate-spin" /> Generating PDF…</>
            : canShare
            ? <><Share2 size={16} /> Save / Share Certificate</>
            : <><Download size={16} /> Download Certificate (PDF)</>
          }
        </button>

        <div
          ref={certRef}
          className="bg-white rounded-2xl overflow-hidden shadow-lg"
          style={{ border: '4px solid #1a3a6b', fontFamily: 'Georgia, serif' }}
        >
          {/* Top stripe */}
          <div style={{ background: '#1a3a6b', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#f5c518', fontSize: '10px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'sans-serif', margin: 0 }}>
                Active School Organisation
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', fontFamily: 'sans-serif', margin: '2px 0 0' }}>
                Registered CPD Training Provider
              </p>
            </div>
            <div style={{ fontSize: '28px' }}>🏅</div>
          </div>

          {/* Body */}
          <div style={{ padding: '28px 24px', textAlign: 'center', background: '#ffffff' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#9ca3af', fontFamily: 'sans-serif', margin: '0 0 10px' }}>
              Certificate of Completion
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a3a6b', margin: '0 0 4px', lineHeight: 1.2 }}>
              {course.title}
            </h1>
            <p style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'sans-serif', margin: '0 0 20px' }}>
              {course.subtitle}
            </p>

            <p style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'sans-serif', margin: '0 0 6px' }}>
              This is to certify that
            </p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 6px', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px', display: 'inline-block', minWidth: '240px' }}>
              {profile?.full_name}
            </p>

            <p style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'sans-serif', margin: '14px 0 4px' }}>
              has successfully completed all modules of the
            </p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', margin: '0 0 20px' }}>
              ASO Apparatus CPD Programme — {course.title}
            </p>

            {/* Module summary */}
            {modules.length > 0 && (
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', marginBottom: '20px', textAlign: 'left' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#6b7280', fontFamily: 'sans-serif', margin: '0 0 8px' }}>
                  Modules completed
                </p>
                {modules.map((m, i) => (
                  <div key={i} style={{ fontSize: '11px', color: '#374151', fontFamily: 'sans-serif', margin: '0 0 4px', paddingLeft: '14px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#16a34a', fontWeight: 700 }}>✓</span>
                    {m}
                  </div>
                ))}
              </div>
            )}

            {/* Date + signature */}
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
                <p style={{ fontSize: '9px', color: '#9ca3af', fontFamily: 'sans-serif', margin: '0 0 2px' }}>CPD Hours</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', margin: 0 }}>4 hours</p>
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

        <p className="text-xs text-gray-400 text-center">
          This certificate is stored on your profile as evidence of CPD completion.
        </p>

      </div>
    </Layout>
  )
}
