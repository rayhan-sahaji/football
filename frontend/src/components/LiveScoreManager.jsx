import { useState, useEffect } from 'react'
import { authFetch } from '../utils/api'
import { getApiUrl, getWsUrl } from '../config'

const FLAG_URL = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`
const FlagImg = ({ code, size = 32 }) => {
  if (!code) return null
  return <img src={FLAG_URL(code)} alt="" width={size} height={Math.round(size * 0.75)} className="inline-block rounded-sm" style={{ objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} />
}

export default function LiveScoreManager() {
  const [matches, setMatches] = useState([])
  const [liveMatch, setLiveMatch] = useState(null)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMatches()
    const interval = setInterval(fetchMatches, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const ws = new WebSocket(getWsUrl())
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'schedule_update' && msg.matches) {
          setMatches(msg.matches)
          const live = msg.matches.find(m => m.status === 'live')
          setLiveMatch(live || null)
          if (live) {
            setHomeScore(live.homeScore ?? 0)
            setAwayScore(live.awayScore ?? 0)
          }
        }
      } catch { /* */ }
    }
    return () => ws.close()
  }, [])

  const fetchMatches = async () => {
    try {
      const res = await fetch(getApiUrl('/api/schedule'))
      const data = await res.json()
      setMatches(data)
      const live = data.find(m => m.status === 'live')
      if (live) {
        setLiveMatch(live)
        if (live.homeScore != null) setHomeScore(live.homeScore)
        if (live.awayScore != null) setAwayScore(live.awayScore)
      }
    } catch { /* */ }
  }

  const updateScore = async (newHome, newAway) => {
    if (!liveMatch) return
    setSaving(true)
    try {
      await authFetch(`/api/schedule/${liveMatch.id}`, {
        method: 'PUT',
        body: JSON.stringify({ homeScore: newHome, awayScore: newAway }),
      })
    } catch { /* */ }
    setSaving(false)
  }

  const adjustScore = (team, delta) => {
    const newHome = team === 'home' ? Math.max(0, homeScore + delta) : homeScore
    const newAway = team === 'away' ? Math.max(0, awayScore + delta) : awayScore
    setHomeScore(newHome)
    setAwayScore(newAway)
    updateScore(newHome, newAway)
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        Live Score Control
      </h2>

      {liveMatch ? (
        <div className="space-y-4">
          {/* Live match card */}
          <div className="bg-gradient-to-r from-red-900/30 to-red-800/10 border border-red-800/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-red-400 text-xs font-bold uppercase">Live Now</span>
              <span className="text-gray-500 text-xs ml-auto">{liveMatch.league}</span>
            </div>

            {/* Score display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FlagImg code={liveMatch.homeFlag} size={36} />
                <span className="text-white font-bold">{liveMatch.homeTeam}</span>
              </div>

              <div className="flex items-center gap-4">
                {/* Home score controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustScore('home', -1)}
                    className="w-9 h-9 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-orange-400 font-black text-3xl w-12 text-center">{homeScore}</span>
                  <button
                    onClick={() => adjustScore('home', 1)}
                    className="w-9 h-9 bg-green-800 hover:bg-green-700 border border-green-700 rounded-lg text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <span className="text-gray-600 font-black text-2xl">:</span>

                {/* Away score controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustScore('away', -1)}
                    className="w-9 h-9 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-orange-400 font-black text-3xl w-12 text-center">{awayScore}</span>
                  <button
                    onClick={() => adjustScore('away', 1)}
                    className="w-9 h-9 bg-green-800 hover:bg-green-700 border border-green-700 rounded-lg text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-white font-bold">{liveMatch.awayTeam}</span>
                <FlagImg code={liveMatch.awayFlag} size={36} />
              </div>
            </div>
          </div>

          {saving && <p className="text-xs text-gray-500 text-center">Saving...</p>}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-sm">No live match right now</p>
          <p className="text-gray-600 text-xs mt-1">Set a match status to "live" in Schedule Manager</p>
        </div>
      )}

      {/* All matches quick status */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 mb-2 font-medium">All Matches</p>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {matches.map(m => (
            <div key={m.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <FlagImg code={m.homeFlag} size={18} />
                <span className="text-gray-300 text-xs">{m.homeTeam}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-400 font-bold text-xs">
                  {m.homeScore != null && m.awayScore != null ? `${m.homeScore} - ${m.awayScore}` : '- : -'}
                </span>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  m.status === 'live' ? 'bg-red-900/50 text-red-400' :
                  m.status === 'finished' ? 'bg-gray-800 text-gray-500' :
                  'bg-green-900/30 text-green-400'
                }`}>
                  {m.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-xs">{m.awayTeam}</span>
                <FlagImg code={m.awayFlag} size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
