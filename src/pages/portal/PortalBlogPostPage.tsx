import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { ShareFacebookButton } from '../../components/ui/ShareFacebookButton'
import { AdBanner } from '../../components/ui/AdBanner'
import { useSEO } from '../../hooks/useSEO'
import type { ContentBlock } from '../admin/BlogPostEditorPage'

const SUPABASE_URL = 'https://yhsxtjttoxzhmbeenhow.supabase.co'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: ContentBlock[]
  cover_image_path: string | null
  category: string
  tags: string[]
  published_at: string
  author: { full_name: string } | null
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-gray-700 leading-relaxed text-base">{block.text}</p>

    case 'heading':
      return block.level === 2
        ? <h2 className="text-2xl font-extrabold text-[#1a3a6b] mt-2">{block.text}</h2>
        : <h3 className="text-xl font-bold text-gray-800 mt-1">{block.text}</h3>

    case 'image':
      return (
        <figure className="my-2">
          <img
            src={`${SUPABASE_URL}/storage/v1/object/public/blog-images/${block.path}`}
            alt={block.caption}
            className="w-full rounded-2xl object-cover max-h-96"
          />
          {block.caption && (
            <figcaption className="text-xs text-gray-400 italic text-center mt-2">{block.caption}</figcaption>
          )}
        </figure>
      )

    case 'quote':
      return (
        <blockquote className="border-l-4 border-[#f5c518] pl-5 py-1 my-2">
          <p className="text-lg font-bold text-[#1a3a6b] italic leading-snug">"{block.text}"</p>
          {block.attribution && (
            <p className="text-sm text-gray-400 mt-2 font-semibold">— {block.attribution}</p>
          )}
        </blockquote>
      )

    case 'list':
      return (
        <ul className="flex flex-col gap-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-700 text-base">
              <span className="text-[#f5c518] font-extrabold mt-0.5 shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      )

    case 'callout':
      return (
        <div className="bg-[#1a3a6b]/5 border border-[#1a3a6b]/15 rounded-2xl p-5 flex gap-4">
          <span className="text-3xl shrink-0">{block.emoji}</span>
          <p className="text-gray-700 leading-relaxed text-sm">{block.text}</p>
        </div>
      )

    case 'divider':
      return <hr className="border-gray-200" />

    default:
      return null
  }
}

export function PortalBlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*, author:profiles!author_id(full_name)')
      .eq('slug', slug!)
      .eq('is_published', true)
      .single()
      .then(({ data }) => {
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setPost({ ...data, author: Array.isArray((data as any).author) ? (data as any).author[0] : (data as any).author })
        }
        setLoading(false)
      })
  }, [slug])

  useSEO({
    title: post?.title ?? 'Blog',
    description: post?.excerpt ?? 'Read the latest news and updates from Active School Organisation.',
    url: `https://www.activeschool.org.uk/portal/blog/${slug}`,
    image: post?.cover_image_path
      ? `${SUPABASE_URL}/storage/v1/object/public/blog-images/${post.cover_image_path}`
      : undefined,
  })

  if (loading) return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-4">
        <div className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
        <div className="h-8 bg-gray-100 rounded-xl animate-pulse w-3/4" />
        <div className="h-4 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-4 bg-gray-100 rounded-xl animate-pulse w-5/6" />
      </div>
    </PortalLayout>
  )

  if (!post) return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-3xl mb-4">🔍</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Post not found</h1>
        <button onClick={() => navigate('/portal/blog')} className="text-[#1a3a6b] text-sm font-semibold hover:underline">
          ← Back to blog
        </button>
      </div>
    </PortalLayout>
  )

  return (
    <PortalLayout>

      {/* Hero */}
      <section className="relative">
        {post.cover_image_path ? (
          <div className="w-full h-72 sm:h-96 overflow-hidden">
            <img
              src={`${SUPABASE_URL}/storage/v1/object/public/blog-images/${post.cover_image_path}`}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c]" />
        )}

        {/* Back button */}
        <button
          onClick={() => navigate('/portal/blog')}
          className="absolute top-4 left-4 flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-2 rounded-xl backdrop-blur-sm transition-colors"
        >
          <ArrowLeft size={14} /> Blog
        </button>

        {/* Title overlay */}
        {post.cover_image_path && (
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 sm:px-8">
            <div className="max-w-3xl mx-auto">
              <span className="inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-[#f5c518] text-[#1a3a6b] mb-3">
                {post.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{post.title}</h1>
            </div>
          </div>
        )}
      </section>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-4 py-8">

        {/* Title (when no cover) */}
        {!post.cover_image_path && (
          <div className="mb-6">
            <span className="inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-[#f5c518] text-[#1a3a6b] mb-3">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{post.title}</h1>
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-6 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          {post.author?.full_name && <span>By <strong className="text-gray-600">{post.author.full_name}</strong></span>}
          {post.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag size={11} />
              {post.tags.map(t => (
                <span key={t} className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-semibold">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-base text-gray-600 font-medium leading-relaxed mb-8 border-l-4 border-[#f5c518] pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Content blocks */}
        <div className="flex flex-col gap-6">
          {post.content.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
        </div>

        {/* Ad banner */}
        <AdBanner placement="blog" className="mt-10" />

        {/* Share + back */}
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/portal/blog')}
            className="flex items-center gap-1 text-sm text-[#1a3a6b] font-semibold hover:underline"
          >
            <ArrowLeft size={14} /> Back to all posts
          </button>
          <ShareFacebookButton
            url={`https://www.activeschool.org.uk/portal/blog/${post.slug}`}
            hashtag="ActiveSchool"
            label="Share this article"
          />
        </div>

      </article>

    </PortalLayout>
  )
}
