import { useState, useEffect } from 'react'
import UserSidebar from '../../components/UserSidebar'
import { useAuth } from '../../context/AuthContext'
import { getPublicLeaderboard } from '../../services/api'
import { Trophy, Medal, Star, User as UserIcon } from 'lucide-react'

const BG = '#f3f4f6'
const medals = ['🥇', '🥈', '🥉']

const getInitials = (name) =>
  name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'

export default function UserPeringkat() {
  const { user: currentUser } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [period, setPeriod] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchLeaderboard() }, [])

  const fetchLeaderboard = async () => {
    try {
      // ✅ Use public leaderboard endpoint (no admin required)
      const res = await getPublicLeaderboard()
      const apiData = res.data?.data || res.data || []
      setPeriod(res.data?.period || 'Season Baru')

      const mapped = apiData.map((u) => ({
        id: u.id,
        rank: u.rank,
        name: u.name,
        initials: getInitials(u.name),
        aksi: u.total_actions || 0,
        poin: u.points || 0,
        isMe: u.id === currentUser?.id  // ✅ FIXED: use .id not .uid
      }))

      setLeaderboard(mapped)
    } catch (err) {
      console.error('❌ Error fetching leaderboard:', err)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: BG }}>
      <UserSidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-10">

        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-black text-4xl text-gray-900 tracking-tighter uppercase italic">Leaderboard</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="px-3 py-1 bg-yellow-400 rounded-full text-[10px] font-black uppercase text-green-900">
                Active Season
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{period}</p>
            </div>
          </div>
          <Trophy size={48} className="text-green-200 -rotate-12" />
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl w-full" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          /* EMPTY STATE YANG TETAP KEREN */
          <div className="bg-white border border-gray-100 rounded-[40px] p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="text-green-400" size={40} />
            </div>
            <h2 className="text-gray-900 font-black text-xl uppercase italic">Belum ada kompetisi</h2>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">
              Jadilah orang pertama yang melakukan aksi lingkungan bulan ini dan raih medali emas!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {leaderboard.map((item) => {
              const isTop3 = item.rank <= 3

              return (
                <div
                  key={item.id}
                  className={`relative flex items-center justify-between p-5 rounded-[28px] transition-all border ${item.isMe ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]' : 'border-gray-100'
                    }`}
                  style={{
                    background: isTop3
                      ? '#f0fdf4'
                      : '#ffffff',
                    backdropBlur: '10px'
                  }}
                >
                  {/* RANK INDICATOR */}
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xl ${isTop3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {isTop3 ? medals[item.rank - 1] : `#${item.rank}`}
                    </div>

                    {/* USER INFO */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-black uppercase italic tracking-tight ${isTop3 ? 'text-green-900' : 'text-gray-900'}`}>
                          {item.name}
                        </span>
                        {item.isMe && (
                          <span className="bg-green-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black">YOU</span>
                        )}
                      </div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${isTop3 ? 'text-green-700/60' : 'text-gray-500'}`}>
                        {item.aksi} Aksi Tervalidasi
                      </div>
                    </div>
                  </div>

                  {/* POINTS */}
                  <div className="text-right">
                    <div className={`text-2xl font-black italic ${isTop3 ? 'text-green-800' : 'text-green-600'}`}>
                      {item.poin.toLocaleString()}
                    </div>
                    <div className={`text-[8px] font-black uppercase tracking-[0.2em] ${isTop3 ? 'text-green-900/40' : 'text-gray-400'}`}>
                      Green Points
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}