import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Save, ArrowLeft, Image, Quote, List, Type, AlignLeft,
  Zap, Minus, ChevronUp, ChevronDown, Trash2, Upload, Eye,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const SUPABASE_URL = 'https://yhsxtjttoxzhmbeenhow.supabase.co'

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level: 2 | 3 }
  | { type: 'image'; path: string; caption: string }
  | { type: 'quote'; text: string; attribution: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; text: string; emoji: string }
  | { type: 'divider' }

const CATEGORIES = ['news', 'update', 'coaching', 'camps', 'safeguarding', 'community']

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
}

function BlockEditor({
  block, index, total,
  onChange, onDelete, onMove,
  onImageUpload,
}: {
  block: ContentBlock
  index: number
  total: number
  onChange: (b: ContentBlock) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
  onImageUpload: (index: number) => void
}) {
  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30'

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-4 flex gap-3">
      {/* Controls */}
      <div className="flex flex-col gap-1 shrink-0 pt-0.5">
        <button onClick={() => onMove(-1)} disabled={index === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-20 transition-colors">
          <ChevronUp size={14} className="text-gray-400" />
        </button>
        <button onClick={() => onMove(1)} disabled={index === total - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-20 transition-colors">
          <ChevronDown size={14} className="text-gray-400" />
        </button>
        <button onClick={onDelete} className="p-1 rounded hover:bg-red-50 transition-colors mt-1">
          <Trash2 size={13} className="text-red-400" />
        </button>
      </div>

      {/* Block content */}
      <div className="flex-1 min-w-0">
        {block.type === 'paragraph' && (
          <textarea
            value={block.text}
            onChange={e => onChange({ ...block, text: e.target.value })}
            placeholder="Write your paragraph here…"
            rows={3}
            className={`${inputCls} resize-none`}
          />
        )}

        {block.type === 'heading' && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {([2, 3] as const).map(l => (
                <button
                  key={l}
                  onClick={() => onChange({ ...block, level: l })}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors ${block.level === l ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  H{l}
                </button>
              ))}
            </div>
            <input
              value={block.text}
              onChange={e => onChange({ ...block, text: e.target.value })}
              placeholder={`Heading ${block.level} text…`}
              className={inputCls}
            />
          </div>
        )}

        {block.type === 'image' && (
          <div className="flex flex-col gap-2">
            {block.path ? (
              <div className="relative">
                <img
                  src={`${SUPABASE_URL}/storage/v1/object/public/blog-images/${block.path}`}
                  className="w-full h-36 object-cover rounded-xl"
                  alt=""
                />
                <button
                  onClick={() => onImageUpload(index)}
                  className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => onImageUpload(index)}
                className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#1a3a6b]/40 transition-colors text-gray-400 hover:text-[#1a3a6b]"
              >
                <Upload size={20} />
                <span className="text-xs font-semibold">Upload image</span>
              </button>
            )}
            <input
              value={block.caption}
              onChange={e => onChange({ ...block, caption: e.target.value })}
              placeholder="Image caption (optional)"
              className={inputCls}
            />
          </div>
        )}

        {block.type === 'quote' && (
          <div className="flex flex-col gap-2">
            <textarea
              value={block.text}
              onChange={e => onChange({ ...block, text: e.target.value })}
              placeholder="Pull quote text…"
              rows={2}
              className={`${inputCls} resize-none`}
            />
            <input
              value={block.attribution}
              onChange={e => onChange({ ...block, attribution: e.target.value })}
              placeholder="Attribution (e.g. Coach Sarah, Year 4 Teacher)"
              className={inputCls}
            />
          </div>
        )}

        {block.type === 'list' && (
          <div className="flex flex-col gap-2">
            {block.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={item}
                  onChange={e => {
                    const items = [...block.items]
                    items[i] = e.target.value
                    onChange({ ...block, items })
                  }}
                  placeholder={`List item ${i + 1}`}
                  className={`${inputCls} flex-1`}
                />
                <button
                  onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange({ ...block, items: [...block.items, ''] })}
              className="text-xs text-[#1a3a6b] font-semibold hover:underline text-left"
            >
              + Add item
            </button>
          </div>
        )}

        {block.type === 'callout' && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                value={block.emoji}
                onChange={e => onChange({ ...block, emoji: e.target.value })}
                placeholder="Emoji"
                className={`${inputCls} w-20`}
                maxLength={2}
              />
              <textarea
                value={block.text}
                onChange={e => onChange({ ...block, text: e.target.value })}
                placeholder="Callout text — great for tips, warnings or highlights…"
                rows={2}
                className={`${inputCls} flex-1 resize-none`}
              />
            </div>
          </div>
        )}

        {block.type === 'divider' && (
          <div className="flex items-center gap-2 py-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-semibold">Divider</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        <p className="text-[10px] text-gray-300 uppercase tracking-wider mt-1 font-semibold">{block.type}</p>
      </div>
    </div>
  )
}

export function BlogPostEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const isNew = !id || id === 'new'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingBlockIndex = useRef<number | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('news')
  const [tags, setTags] = useState('')
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [coverPath, setCoverPath] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (isNew) return
    supabase.from('blog_posts').select('*').eq('id', id!).single().then(({ data }) => {
      if (!data) return
      setTitle(data.title)
      setSlug(data.slug)
      setExcerpt(data.excerpt ?? '')
      setCategory(data.category)
      setTags((data.tags ?? []).join(', '))
      setBlocks(data.content ?? [])
      setCoverPath(data.cover_image_path ?? '')
      setIsPublished(data.is_published)
      setLoading(false)
    })
  }, [id, isNew])

  function handleTitleChange(t: string) {
    setTitle(t)
    if (isNew) setSlug(slugify(t))
  }

  function addBlock(type: ContentBlock['type']) {
    const defaults: Record<string, ContentBlock> = {
      paragraph: { type: 'paragraph', text: '' },
      heading:   { type: 'heading', text: '', level: 2 },
      image:     { type: 'image', path: '', caption: '' },
      quote:     { type: 'quote', text: '', attribution: '' },
      list:      { type: 'list', items: [''] },
      callout:   { type: 'callout', text: '', emoji: '💡' },
      divider:   { type: 'divider' },
    }
    setBlocks(b => [...b, defaults[type]])
  }

  function updateBlock(index: number, block: ContentBlock) {
    setBlocks(b => b.map((bl, i) => i === index ? block : bl))
  }

  function deleteBlock(index: number) {
    setBlocks(b => b.filter((_, i) => i !== index))
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const next = index + dir
    if (next < 0 || next >= blocks.length) return
    const b = [...blocks]
    ;[b[index], b[next]] = [b[next], b[index]]
    setBlocks(b)
  }

  function openImageUpload(blockIndex: number) {
    pendingBlockIndex.current = blockIndex
    fileInputRef.current?.click()
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()
    const path = `${slug || 'post'}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('blog-images').upload(path, file, { upsert: true })
    if (error) { alert('Image upload failed: ' + error.message); return }
    const idx = pendingBlockIndex.current
    if (idx !== null) {
      updateBlock(idx, { type: 'image', path, caption: '' })
    }
    e.target.value = ''
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()
    const path = `covers/${slug || 'post'}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('blog-images').upload(path, file, { upsert: true })
    if (error) { alert('Upload failed: ' + error.message); return }
    setCoverPath(path)
    e.target.value = ''
  }

  async function save(publish?: boolean) {
    if (!title.trim()) { alert('Title is required'); return }
    if (!slug.trim()) { alert('Slug is required'); return }
    setSaving(true)

    const shouldPublish = publish ?? isPublished
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content: blocks,
      cover_image_path: coverPath || null,
      author_id: profile?.id ?? null,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      is_published: shouldPublish,
      published_at: shouldPublish ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    if (isNew) {
      const { data, error } = await supabase.from('blog_posts').insert(payload).select('id').single()
      if (error) { alert('Error: ' + error.message); setSaving(false); return }
      navigate(`/admin/blog/${data.id}/edit`, { replace: true })
    } else {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', id!)
      if (error) { alert('Error: ' + error.message) }
    }

    if (publish !== undefined) setIsPublished(publish)
    setSaving(false)
  }

  if (loading) return (
    <Layout title="Loading…">
      <div className="px-4 pt-8 flex flex-col gap-3">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    </Layout>
  )

  return (
    <Layout title={isNew ? 'New Post' : 'Edit Post'}>
      <div className="px-4 pt-5 pb-16 max-w-2xl mx-auto flex flex-col gap-5">

        {/* Back */}
        <button onClick={() => navigate('/admin/blog')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 self-start">
          <ArrowLeft size={15} /> All posts
        </button>

        {/* Cover image */}
        <div>
          {coverPath ? (
            <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-2">
              <img
                src={`${SUPABASE_URL}/storage/v1/object/public/blog-images/${coverPath}`}
                className="w-full h-full object-cover"
                alt="Cover"
              />
              <button
                onClick={() => coverInputRef.current?.click()}
                className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-xl"
              >
                Change cover
              </button>
            </div>
          ) : (
            <button
              onClick={() => coverInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#1a3a6b]/40 transition-colors text-gray-400 hover:text-[#1a3a6b] mb-2"
            >
              <Image size={22} />
              <span className="text-sm font-semibold">Add cover image</span>
            </button>
          )}
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        </div>

        {/* Meta */}
        <Input label="Post title *" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. Summer GymCamp Roundup 2026" />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">URL slug *</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
            <span className="text-xs text-gray-400">/portal/blog/</span>
            <input
              value={slug}
              onChange={e => setSlug(slugify(e.target.value))}
              className="flex-1 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Excerpt (shown in listing)</label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="A short summary shown on the blog listing page and in search results…"
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <Input label="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} placeholder="gymnastics, ukag, camps" />
        </div>

        {/* Block editor */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Content Blocks</p>
          {blocks.length === 0 && (
            <div className="text-center py-8 text-gray-300 text-sm border-2 border-dashed border-gray-100 rounded-2xl">
              Add your first content block below
            </div>
          )}
          <div className="flex flex-col gap-3">
            {blocks.map((block, i) => (
              <BlockEditor
                key={i}
                block={block}
                index={i}
                total={blocks.length}
                onChange={b => updateBlock(i, b)}
                onDelete={() => deleteBlock(i)}
                onMove={dir => moveBlock(i, dir)}
                onImageUpload={openImageUpload}
              />
            ))}
          </div>

          {/* Add block buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { type: 'paragraph' as const, icon: AlignLeft,  label: 'Paragraph' },
              { type: 'heading'   as const, icon: Type,        label: 'Heading'   },
              { type: 'image'     as const, icon: Image,       label: 'Image'     },
              { type: 'quote'     as const, icon: Quote,       label: 'Quote'     },
              { type: 'list'      as const, icon: List,        label: 'List'      },
              { type: 'callout'   as const, icon: Zap,         label: 'Callout'   },
              { type: 'divider'   as const, icon: Minus,       label: 'Divider'   },
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1a3a6b] bg-[#1a3a6b]/5 hover:bg-[#1a3a6b]/10 px-3 py-2 rounded-xl transition-colors"
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Hidden file input for block images */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

        {/* Save / Publish */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={() => save(false)} disabled={saving}>
            <Save size={15} /> Save Draft
          </Button>
          <Button variant="primary" fullWidth onClick={() => save(true)} disabled={saving}>
            <Eye size={15} /> {isPublished ? 'Update & Keep Published' : 'Publish'}
          </Button>
        </div>

      </div>
    </Layout>
  )
}
