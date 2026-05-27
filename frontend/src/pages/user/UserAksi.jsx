import { useState, useRef } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserSidebar from '../../components/UserSidebar'
import MapLocationPicker from '../../components/MapLocationPicker'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { Send, Image as ImageIcon, CheckCircle, Loader2, MapPin, X } from 'lucide-react'

const BG = '#f3f4f6'
const AKSI_DRAFT_KEY = 'gli_user_aksi_draft'

export default function UserAksi() {
  const navigate = useNavigate()
  const { user, getToken } = useAuth()
  const fileInputRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapModalKey, setMapModalKey] = useState(0)
  const [formData, setFormData] = useState({ action_name: '', description: '', location: '', latitude: null, longitude: null })

  useEffect(() => {
    const savedDraft = localStorage.getItem(AKSI_DRAFT_KEY)
    if (savedDraft) {
      try {
        setFormData(prev => ({ ...prev, ...JSON.parse(savedDraft) }))
      } catch (err) {
        console.warn('Draft aksi tidak valid:', err)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(AKSI_DRAFT_KEY, JSON.stringify(formData))
  }, [formData])

  const handleLocationSelect = (loc) => {
    setFormData(prev => ({
      ...prev,
      location: loc.address,
      latitude: loc.latitude,
      longitude: loc.longitude
    }))
    setShowMapModal(false)
  }

  const openMapModal = () => {
    setMapModalKey(prev => prev + 1)
    setShowMapModal(true)
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const userId = user?.id

    if (!userId) {
      alert("Sesi habis, login ulang!")
      setLoading(false)
      return
    }

    if (!file) {
      alert("Foto wajib diupload!")
      setLoading(false)
      return
    }

    try {
      let token = await getToken()
      if (!token) {
        alert("Tidak dapat mengambil token authentikasi!")
        setLoading(false)
        return
      }
      console.log('🔐 Token obtained, length:', token.length)
      console.log('🔐 Token preview:', token.substring(0, 50) + '...')

      const data = new FormData()
      data.append('user_id', userId)
      data.append('action_name', formData.action_name)
      data.append('description', formData.description || '')
      data.append('location', formData.location || '')
      data.append('image', file)

      try {
        await api.post('/user/actions', data)

        localStorage.removeItem(AKSI_DRAFT_KEY)
        setFormData({ action_name: '', description: '', location: '', latitude: null, longitude: null })
        setFile(null)
        setPreview(null)

        alert("✅ Berhasil!")
        navigate('/user/riwayat')
      } catch (err) {
        // Retry with fresh token if 401 (Unauthorized)
        if (err.response?.status === 401) {
          console.log('Token expired, retrying with fresh token...')
          token = await getToken()
          await api.post('/user/actions', data, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          localStorage.removeItem(AKSI_DRAFT_KEY)
          setFormData({ action_name: '', description: '', location: '', latitude: null, longitude: null })
          setFile(null)
          setPreview(null)
          alert("✅ Berhasil!")
          navigate('/user/riwayat')
        } else {
          throw err
        }
      }
    } catch (err) {
      console.error(err)
      alert("❌ " + (err.response?.data?.message || "Error server"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: BG }}>
      <UserSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-white rounded-[32px] p-8 shadow-2xl mt-10">
          <h1 className="text-3xl font-black text-green-800 mb-6 italic">Kirim Aksi Hijau 🌿</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">Nama Aksi</label>
              <input required className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus:border-green-400 outline-none transition-all"
                placeholder="Contoh: Menanam 10 Bibit Mangrove"
                value={formData.action_name}
                onChange={e => setFormData({ ...formData, action_name: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">📍 Lokasi Aksi</label>
              <button type="button" onClick={openMapModal}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-left focus:border-green-400 transition-all flex items-center gap-3 hover:bg-gray-100">
                <MapPin size={18} className="text-green-600 flex-shrink-0" />
                <span className="text-sm font-bold text-gray-700">{formData.location || 'Pilih lokasi dari peta...'}</span>
              </button>
            </div>

            <div onClick={() => fileInputRef.current.click()} className="group border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
              <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
              {preview ? (
                <img src={preview} className="w-full h-48 object-cover rounded-2xl shadow-md" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-green-600">
                  <ImageIcon size={40} />
                  <span className="font-bold text-sm">Klik untuk Upload Foto Aksi</span>
                </div>
              )}
            </div>

            <textarea className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 min-h-[100px] outline-none focus:border-green-400"
              placeholder="Ceritakan sedikit tentang aksimu..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })} />

            <button disabled={loading} className="w-full bg-green-500 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              {loading ? "MENGIRIM KE CLOUDINARY..." : "KIRIM LAPORAN SEKARANG"}
            </button>
          </form>
        </div>
      </main>

      {showMapModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowMapModal(false)}>
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white rounded-t-[40px] px-8 pt-8 pb-4 border-b border-gray-50 z-10 flex justify-between items-center">
              <h2 className="font-black text-2xl text-gray-800 uppercase italic">Pilih Lokasi Aksi</h2>
              <button onClick={() => setShowMapModal(false)} className="text-gray-300 hover:text-gray-600"><X size={22} /></button>
            </div>
            <div className="px-8 py-6">
              <MapLocationPicker
                key={mapModalKey}
                onLocationSelect={handleLocationSelect}
                initialLocation={formData.latitude && formData.longitude ? { latitude: formData.latitude, longitude: formData.longitude, address: formData.location } : null}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}