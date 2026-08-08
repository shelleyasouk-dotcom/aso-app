import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenLine, Eye, EyeOff, Plus, Trash2, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'

interface Post {
  id: string
  title: string
  slug: string
  category: string
  is_published: boolean
  published_at: string | null
  created_at: string
}

export function BlogAdminPage() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, category, is_published, published_at, created_at')
      .order('created_at', { ascending: false })
    setPosts((data ?? []) as Post[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function togglePublish(post: Post) {
    const is_published = !post.is_published
    await supabase.from('blog_posts').update({
      is_published,
      published_at: is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('id', post.id)
    load()
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    load()
  }

  const CATEGORY_COLOURS: Record<string, string> = {
    news:        'bg-blue-100 text-blue-700',
    update:      'bg-green-100 text-green-700',
    coaching:    'bg-purple-100 text-purple-700',
    camps:       'bg-yellow-100 text-yellow-700',
    safeguarding:'bg-red-100 text-red-700',
    community:   'bg-pink-100 text-pink-700',
  }

  return (
    <Layout title="Blog & News">
      <div className="px-4 pt-5 pb-10 max-w-3xl mx-auto flex flex-col gap-5">

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Manage articles and news posts for the public website.</p>
          <Button variant="primary" size="sm" onClick={() => navigate('/admin/blog/new')}>
            <Plus size={15} /> New Post
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No posts yet. Click "New Post" to get started.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {posts.map(post => (
              <div key={post.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-900 truncate">{post.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${CATEGORY_COLOURS[post.category] ?? 'bg-gray-100 text-gray-500'}`}>
                      {post.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {post.is_published
                      ? `Published ${new Date(post.published_at!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : `Draft — created ${new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                    }
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePublish(post)}
                    title={post.is_published ? 'Unpublish' : 'Publish'}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {post.is_published
                      ? <Eye size={16} className="text-green-500" />
                      : <EyeOff size={16} className="text-gray-300" />
                    }
                  </button>
                  <button
                    onClick={() => navigate(`/admin/blog/${post.id}/edit`)}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Edit"
                  >
                    <PenLine size={16} className="text-[#1a3a6b]" />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                  <a
                    href={`/portal/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    title="View on site"
                  >
                    <ChevronRight size={16} className="text-gray-300" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
