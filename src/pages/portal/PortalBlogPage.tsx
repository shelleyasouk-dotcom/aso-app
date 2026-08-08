import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Tag, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { useSEO } from '../../hooks/useSEO'

const SUPABASE_URL = 'https://yhsxtjttoxzhmbeenhow.supabase.co'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_path: string | null
  category: string
  tags: string[]
  published_at: string
  author: { full_name: string } | null
}

const CATEGORY_STYLES: Record<string, string> = {
  news:         'bg-blue-100 text-blue-700',
  update:       'bg-green-100 text-green-700',
  coaching:     'bg-purple-100 text-purple-700',
  camps:        'bg-yellow-100 text-yellow-700',
  safeguarding: 'bg-red-100 text-red-700',
  community:    'bg-pink-100 text-pink-700',
}

export function PortalBlogPage() {
  useSEO({
    title: 'Blog & News — ASO Updates',
    description: 'Latest news, coaching tips, camp updates and community stories from Active School Organisation.',
    url: 'https://www.activeschool.org.uk/portal/blog',
  })

  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image_path, category, tags, published_at, author:profiles!author_id(full_name)')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setPosts((data ?? []).map((p: any) => ({
          ...p,
          author: Array.isArray(p.author) ? p.author[0] : p.author,
        })))
        setLoading(false)
      })
  }, [])

  const categories = [...new Set(posts.map(p => p.category))]
  const filtered = activeCategory ? posts.filter(p => p.category === activeCategory) : posts
  const [featured, ...rest] = filtered

  return (
    <PortalLayout>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] via-[#1e4a8c] to-[#142f58] text-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            📰 Latest from ASO
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Blog &amp; News</h1>
          <p className="text-white/70 text-base max-w-xl">
            Coaching updates, camp roundups, community stories and tips from the ASO team.
          </p>
        </div>
      </section>

      {/* Category filter */}
      {categories.length > 1 && (
        <section className="bg-gray-50 border-b border-gray-100 px-4 py-3">
          <div className="max-w-5xl mx-auto flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${!activeCategory ? 'bg-[#1a3a6b] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#1a3a6b]'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize transition-colors ${activeCategory === cat ? 'bg-[#1a3a6b] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#1a3a6b]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-sm">No posts yet — check back soon!</p>
        ) : (
          <>
            {/* Featured (first post — larger) */}
            {featured && (
              <div
                onClick={() => navigate(`/portal/blog/${featured.slug}`)}
                className="cursor-pointer mb-8 group rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row"
              >
                {featured.cover_image_path ? (
                  <div className="sm:w-1/2 h-52 sm:h-auto overflow-hidden shrink-0">
                    <img
                      src={`${SUPABASE_URL}/storage/v1/object/public/blog-images/${featured.cover_image_path}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={featured.title}
                    />
                  </div>
                ) : (
                  <div className="sm:w-1/2 h-52 sm:h-auto bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] shrink-0 flex items-center justify-center">
                    <span className="text-6xl">📰</span>
                  </div>
                )}
                <div className="flex-1 p-6 flex flex-col justify-center bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${CATEGORY_STYLES[featured.category] ?? 'bg-gray-100 text-gray-500'}`}>
                      {featured.category}
                    </span>
                    <span className="text-xs text-gray-400">Featured</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight mb-3 group-hover:text-[#1a3a6b] transition-colors">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{featured.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(featured.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    {featured.author?.full_name && <span>· {featured.author.full_name}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Rest of posts grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map(post => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/portal/blog/${post.slug}`)}
                    className="cursor-pointer group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    {post.cover_image_path ? (
                      <div className="h-44 overflow-hidden">
                        <img
                          src={`${SUPABASE_URL}/storage/v1/object/public/blog-images/${post.cover_image_path}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={post.title}
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-gradient-to-br from-[#1a3a6b]/10 to-[#1a3a6b]/5 flex items-center justify-center">
                        <span className="text-4xl">📰</span>
                      </div>
                    )}
                    <div className="flex-1 p-4 flex flex-col">
                      <span className={`self-start text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase mb-2 ${CATEGORY_STYLES[post.category] ?? 'bg-gray-100 text-gray-500'}`}>
                        {post.category}
                      </span>
                      <h3 className="font-extrabold text-gray-900 text-base leading-tight mb-2 group-hover:text-[#1a3a6b] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-xs text-gray-500 leading-relaxed flex-1 line-clamp-2 mb-3">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                        <span className="text-xs text-gray-400">
                          {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {post.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag size={10} className="text-gray-300" />
                            <span className="text-xs text-gray-300">{post.tags[0]}</span>
                          </div>
                        )}
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-[#1a3a6b] transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

    </PortalLayout>
  )
}
