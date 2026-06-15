import { useState, useEffect } from 'react'
import { getApiUrl } from '../config'

const FLAG_URL = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`
const FlagImg = ({ code, size = 28 }) => {
  if (!code) return null
  return <img src={FLAG_URL(code)} alt="" width={size} height={Math.round(size * 0.75)} className="inline-block rounded-sm" style={{ objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} />
}

export default function Leaderboard() {
  const [players, setPlayers] = useState([])

  useEffect(() => {
    const fetchPlayers = async () => {
      try { const res = await fetch(getApiUrl('/api/players')); const data = await res.json(); setPlayers(data) } catch { /* */ }
    }
    fetchPlayers()
    const interval = setInterval(fetchPlayers, 10000)
    return () => clearInterval(interval)
  }, [])

  const getRankStyle = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/40'
    if (index === 1) return 'bg-gradient-to-r from-gray-300/10 to-gray-400/5 border-gray-400/30'
    if (index === 2) return 'bg-gradient-to-r from-orange-600/10 to-orange-700/5 border-orange-600/30'
    return 'bg-gray-900 border-gray-800'
  }

  const getRankBadge = (index) => {
    if (index === 0) return <span className="text-yellow-400 text-lg font-black">1</span>
    if (index === 1) return <span className="text-gray-300 text-lg font-black">2</span>
    if (index === 2) return <span className="text-orange-400 text-lg font-black">3</span>
    return <span className="text-gray-500 text-lg font-bold">{index + 1}</span>
  }

  const top3 = players.slice(0, 3)
  const rest = players.slice(3)

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-3">
          <span className="text-orange-400">Top Scorers</span> Leaderboard
        </h1>
        <p className="text-gray-400">FIFA World Cup 2026 — Player Rankings</p>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800">
          <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 text-lg">No player data yet</p>
          <p className="text-gray-600 text-sm mt-1">Admin can add players from the Dashboard</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-4 mb-10">
              {/* 2nd Place */}
              <div className="flex flex-col items-center w-[180px]">
                <FlagImg code={top3[1].country} size={48} />
                <span className="text-white font-bold text-sm mt-2 text-center">{top3[1].name}</span>
                <span className="text-gray-400 text-xs">{top3[1].team}</span>
                <div className="w-full bg-gray-700/30 border border-gray-500/30 rounded-xl mt-3 p-3 text-center">
                  <span className="text-gray-300 text-2xl font-black">{top3[1].goals}</span>
                  <span className="text-gray-500 text-xs block">GOALS</span>
                </div>
                <div className="w-full h-20 bg-gray-700/20 border border-gray-600/30 rounded-t-xl mt-0 flex items-center justify-center">
                  <span className="text-gray-400 text-3xl font-black">2</span>
                </div>
              </div>
              {/* 1st Place */}
              <div className="flex flex-col items-center w-[200px]">
                <div className="text-yellow-400 text-2xl mb-1">👑</div>
                <FlagImg code={top3[0].country} size={56} />
                <span className="text-white font-bold text-base mt-2 text-center">{top3[0].name}</span>
                <span className="text-gray-400 text-xs">{top3[0].team}</span>
                <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl mt-3 p-3 text-center">
                  <span className="text-yellow-400 text-3xl font-black">{top3[0].goals}</span>
                  <span className="text-yellow-500/60 text-xs block">GOALS</span>
                </div>
                <div className="w-full h-28 bg-yellow-500/10 border border-yellow-500/30 rounded-t-xl mt-0 flex items-center justify-center">
                  <span className="text-yellow-400 text-4xl font-black">1</span>
                </div>
              </div>
              {/* 3rd Place */}
              <div className="flex flex-col items-center w-[180px]">
                <FlagImg code={top3[2].country} size={48} />
                <span className="text-white font-bold text-sm mt-2 text-center">{top3[2].name}</span>
                <span className="text-gray-400 text-xs">{top3[2].team}</span>
                <div className="w-full bg-orange-600/10 border border-orange-600/30 rounded-xl mt-3 p-3 text-center">
                  <span className="text-orange-400 text-2xl font-black">{top3[2].goals}</span>
                  <span className="text-orange-500/60 text-xs block">GOALS</span>
                </div>
                <div className="w-full h-14 bg-orange-600/10 border border-orange-600/30 rounded-t-xl mt-0 flex items-center justify-center">
                  <span className="text-orange-400 text-3xl font-black">3</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Table */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_80px_80px_100px] gap-2 px-6 py-3 bg-gray-800/50 text-gray-500 text-xs font-medium uppercase">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-center">Goals</span>
              <span className="text-center">Assists</span>
              <span className="text-right">Rating</span>
            </div>
            {players.map((player, i) => (
              <div key={player.id} className={`grid grid-cols-[60px_1fr_80px_80px_100px] gap-2 px-6 py-4 border-b border-gray-800/50 items-center ${getRankStyle(i)} ${i === 0 ? 'border-l-4 border-l-yellow-500' : ''}`}>
                <div className="flex items-center justify-center">
                  {getRankBadge(i)}
                </div>
                <div className="flex items-center gap-3">
                  <FlagImg code={player.country} size={32} />
                  <div>
                    <span className="text-white font-semibold text-sm">{player.name}</span>
                    <span className="text-gray-500 text-xs block">{player.team}</span>
                  </div>
                </div>
                <span className="text-orange-400 font-black text-lg text-center">{player.goals}</span>
                <span className="text-gray-400 font-bold text-center">{player.assists}</span>
                <div className="text-right">
                  <span className="text-green-400 font-bold text-sm">{(player.goals * 3 + player.assists).toFixed(0)}</span>
                  <span className="text-gray-600 text-xs block">pts</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
