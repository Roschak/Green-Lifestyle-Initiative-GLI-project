import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { ArrowLeft } from 'lucide-react'

const getImageUrl = (img) => {
  if (!img || img === 'no-image.jpg' || img === 'undefined' || img === 'null') return null
  
  // ✅ AUDIT FIX: Prevent base64 data URIs from being processed as URLs
  if (String(img).startsWith('data:image')) {
    console.warn('⚠️ Base64 image data detected - ignoring to prevent 414 errors')
    return null  // Reject base64 data URIs - they shouldn't be stored
  }
  
  if (String(img).startsWith('http')) return String(img)
  
  const normalized = String(img).replace(/\\/g, '/')
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const baseUrl = apiUrl.replace('/api', '')
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmgypsno6'

  if (normalized.includes('/uploads/gli_actions/')) {
    let publicId = normalized.split('/uploads/gli_actions/')[1]?.replace(/^\/+/,'')
    if (!publicId || publicId === 'undefined' || publicId === 'null' || publicId === '[object Object]') return null
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`
  }

  const uploadsIndex = normalized.lastIndexOf('/uploads/')
  if (uploadsIndex >= 0) return `${baseUrl}${normalized.slice(uploadsIndex)}`
  if (normalized.startsWith('uploads/')) return `${baseUrl}/${normalized}`
  return `${baseUrl}/${normalized.replace(/^\/+/, '')}`
}

export default function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    (async () => {
      try {
        const res = await api.get(`/articles/${id}`)
        setArticle(res.data.article)
      } catch (err) {
        console.error('Gagal ambil artikel:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!article) return <div className="min-h-screen flex items-center justify-center">Artikel tidak ditemukan</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600">
            <ArrowLeft size={16} /> Kembali
          </button>
        </div>
        {getImageUrl(article.image) && (
          <div className="w-full h-64">
            <img src={getImageUrl(article.image)} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="p-8">
          <h1 className="text-2xl font-black mb-3">{article.title}</h1>
          <p className="text-sm text-gray-500 mb-6">{new Date(article.created_at).toLocaleString()}</p>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content || article.body || '' }} />
        </div>
      </div>
    </div>
  )
}
