import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Eye, EyeOff, ExternalLink, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const SUPABASE_URL = 'https://yhsxtjttoxzhmbeenhow.supabase.co'

interface AdBanner {
  id: string
  business_name: string
  contact_email: string | null
  image_path: string
  click_url: string | null
  placement: string
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  notes: string | null
  created_at: string
}

const PLACEMENT_LABELS: Record<string, string> = {
  homepage: 'Homepage',
  blog: 'Blog Posts',
  newsletter_archive: 'Newsletter Archive',
}

const PLACEMENT_COLOURS: Record<string, string> = {
  homepage: 'bg-blue-100 text-blue-700',
  blog: 'bg-purple-100 text-purple-700',
  newsletter_archive: 'bg-emerald-100 text-emerald-700',
}

const BLANK_FORM = {
  business_name: '',
  contact_email: '',
  click_url: '',
  placement: 'homepage',
  starts_at: '',
  ends_at: '',
  notes: '',
}

export function AdBannersAdminPage() {
  const [banners, setBanners] = useState<AdBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data } = await supabase
      .from('ad_banners')
      .select('*')
      .order('created_at', { ascending: false })
    setBanners((data ?? []) as AdBanner[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function save() {
    if (!form.business_name.trim()) { setError('Business name is required.'); return }
    if (!imageFile) { setError('Please upload a banner image.'); return }
    setError(null)
    setSaving(true)

    const ext = imageFile.name.split('.').pop()
    const slug = form.business_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const path = `${slug}-${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('ad-banners')
      .upload(path, imageFile, { upsert: false })

    if (uploadErr) { setError('Image upload failed: ' + uploadErr.message); setSaving(false); return }

    const { error: insertErr } = await supabase.from('ad_banners').insert({
      business_name: form.business_name.trim(),
      contact_email: form.contact_email.trim() || null,
      image_path: path,
      click_url: form.click_url.trim() || null,
      placement: form.placement,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      notes: form.notes.trim() || null,
    })

    if (insertErr) { setError('Save failed: ' + insertErr.message); setSaving(false); return }

    setForm(BLANK_FORM)
    setImageFile(null)
    setPreview(null)
    setShowAdd(false)
    setSaving(false)
    load()
  }

  async function toggleActive(b: AdBanner) {
    await supabase.from('ad_banners').update({ is_active: !b.is_active }).eq('id', b.id)
    load()
  }

  async function deleteBanner(b: AdBanner) {
    if (!confirm(`Remove the ad for "${b.business_name}"?`)) return
    await supabase.storage.from('ad-banners').remove([b.image_path])
    await supabase.from('ad_banners').delete().eq('id', b.id)
    load()
  }

  const now = new Date()

  function status(b: AdBanner): 'live' | 'scheduled' | 'expired' | 'inactive' {
    if (!b.is_active) return 'inactive'
    if (b.starts_at && new Date(b.starts_at) > now) return 'scheduled'
    if (b.ends_at && new Date(b.ends_at) < now) return 'expired'
    return 'live'
  }

  const STATUS_STYLES: Record<string, string> = {
    live: 'bg-green-100 text-green-700',
    scheduled: 'bg-blue-100 text-blue-700',
    expired: 'bg-gray-100 text-gray-400',
    inactive: 'bg-red-50 text-red-400',
  }

  return (
    <Layout title="Advertising Banners">
      <div className="px-4 pt-5 pb-10 max-w-3xl mx-auto flex flex-col gap-5">

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Manage paid advertising banners shown on the website. Banners rotate across blog posts, the homepage, and the newsletter archive.
          </p>
        </div>

        {/* Placement info */}
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(PLACEMENT_LABELS).map(([key, label]) => (
            <div key={key} className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
              <p className="font-bold text-[#1a3a6b] text-xs">{label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {banners.filter(b => b.placement === key && status(b) === 'live').length} live
              </p>
            </div>
          ))}
        </div>

        {/* Add button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-[#1a3a6b] hover:underline"
          >
            <Plus size={13} /> Add banner
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
            <p className="font-bold text-sm text-gray-800">New Advertising Banner</p>

            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

            {/* Image upload */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Banner Image *</p>
              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 mb-2">
                  <img src={preview} className="w-full max-h-40 object-cover" alt="Preview" />
                  <button
                    onClick={() => { setImageFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                    className="absolute top-2 right-2 bg-white/90 text-xs font-bold px-2 py-1 rounded-lg shadow"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-[#1a3a6b] hover:text-[#1a3a6b] transition-colors"
                >
                  <Upload size={22} />
                  <span className="text-xs font-semibold">Click to upload banner image</span>
                  <span className="text-[10px]">Recommended: 1200×300 px · JPG or PNG</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            <Input label="Business / Organisation name *" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="e.g. Dorset Sports Centre" />
            <Input label="Contact email (for your records)" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} type="email" placeholder="contact@business.com" />
            <Input label="Click-through URL" value={form.click_url} onChange={e => setForm(f => ({ ...f, click_url: e.target.value }))} type="url" placeholder="https://..." />

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Placement *</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(PLACEMENT_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setForm(f => ({ ...f, placement: key }))}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${form.placement === key ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#1a3a6b]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Start date" value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} type="date" />
              <Input label="End date" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} type="date" />
            </div>

            <Input label="Notes (internal only)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. 3-month package, £150 agreed" />

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setShowAdd(false); setError(null); setPreview(null); setImageFile(null) }}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Banner'}</Button>
            </div>
          </div>
        )}

        {/* Banner list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : banners.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No banners yet. Add your first advertiser above.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {banners.map(b => {
              const s = status(b)
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <img
                    src={`${SUPABASE_URL}/storage/v1/object/public/ad-banners/${b.image_path}`}
                    alt={b.business_name}
                    className="w-full h-24 object-cover"
                  />
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-gray-900 truncate">{b.business_name}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${PLACEMENT_COLOURS[b.placement] ?? 'bg-gray-100 text-gray-500'}`}>
                          {PLACEMENT_LABELS[b.placement]}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_STYLES[s]}`}>
                          {s}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {b.starts_at ? new Date(b.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Anytime'}
                        {' → '}
                        {b.ends_at ? new Date(b.ends_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No end date'}
                        {b.contact_email && <span className="ml-2">· {b.contact_email}</span>}
                      </p>
                      {b.notes && <p className="text-[10px] text-gray-300 mt-0.5 italic">{b.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {b.click_url && (
                        <a href={b.click_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <ExternalLink size={15} className="text-[#1a3a6b]" />
                        </a>
                      )}
                      <button onClick={() => toggleActive(b)} className="p-2 rounded-lg hover:bg-gray-50 transition-colors" title={b.is_active ? 'Deactivate' : 'Activate'}>
                        {b.is_active ? <Eye size={15} className="text-green-500" /> : <EyeOff size={15} className="text-gray-300" />}
                      </button>
                      <button onClick={() => deleteBanner(b)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={15} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </Layout>
  )
}
