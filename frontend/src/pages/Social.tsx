import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Post = { id: string; title: string; content: string; author: string; date: string; type: 'forum' | 'article' | 'discussion' }

export default function Social() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'forum' | 'article' | 'discussion'>('forum')
  const [posts, setPosts] = useState<Post[]>([
    { id: '1', title: 'Getting Started with React 19', content: 'A comprehensive guide to the latest React features and best practices.', author: 'Tech Guru', date: '2026-01-24', type: 'article' },
    { id: '2', title: 'How to prepare for system design interviews?', content: 'Share your tips and resources for mastering system design interviews.', author: 'Sarah Chen', date: '2026-01-23', type: 'discussion' },
    { id: '3', title: 'Job Interview Tips Thread', content: 'Discuss common interview questions and answers specific to Singapore tech jobs.', author: 'JobFit Team', date: '2026-01-22', type: 'forum' }
  ])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const submit = () => {
    if (!title.trim() || !content.trim()) return
    setPosts([{ id: String(Date.now()), title, content, author: 'You', date: new Date().toISOString().slice(0, 10), type: activeTab }, ...posts])
    setTitle('')
    setContent('')
  }

  const filteredPosts = posts.filter(p => p.type === activeTab)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <header className="w-full bg-white border-b border-brand">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-5xl font-extrabold text-brand mb-2">JobFit Community</h1>
          <p className="text-brand-dark text-lg">Forums, articles, and discussions to stay updated with the latest tech trends</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {(['forum', 'article', 'discussion'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition ${
                activeTab === tab
                  ? 'text-brand border-b-2 border-brand'
                  : 'text-gray-600 hover:text-brand'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}s
            </button>
          ))}
        </div>

        {/* Create Post Section */}
        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {activeTab === 'forum' && '🗣️ Start a Forum Discussion'}
            {activeTab === 'article' && '📝 Write an Article'}
            {activeTab === 'discussion' && '💬 Start a Discussion'}
          </h2>
          <input
            className="w-full p-3 border border-gray-300 rounded mb-3 focus:outline-none focus:border-brand"
            placeholder="Title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:border-brand"
            rows={5}
            placeholder="Write your content here..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              className="px-6 py-2 bg-brand text-white rounded font-medium hover:bg-brand-dark transition"
              onClick={submit}
            >
              Post
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-brand transition line-clamp-2">{p.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      By <span className="font-medium">{p.author}</span> • {p.date}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-cream text-brand rounded-full text-xs font-medium flex-shrink-0">
                    {p.type}
                  </span>
                </div>
                <p className="text-gray-700 line-clamp-3 mb-3">{p.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>👍 Likes</span>
                  <span>💬 Replies</span>
                  <span>📤 Share</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts yet in {activeTab}s. Be the first to share!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
