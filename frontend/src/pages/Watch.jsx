import { useState, useEffect } from 'react'
import VideoPlayer from '../components/VideoPlayer'
import MatchSchedule from '../components/MatchSchedule'
import useWebSocket from '../hooks/useWebSocket'
import { getApiUrl } from '../config'

const STREAM_URL = 'https://1nyaler.streamhostingcdn.top/stream/30/index.m3u8'
const STREAM_NAME = 'Live Stream 30'

const FLAG_URL = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`
const FlagImg = ({ code, size = 32 }) => {
  if (!code) return null
  return <img src={FLAG_URL(code)} alt="" width={size} height={Math.round(size * 0.75)} className="inline-block rounded-sm" style={{ objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} />
}

export default function Watch() {
  const [viewers, setViewers] = useState(0)
  const [liveMatch, setLiveMatch] = useState(null)
  const ws = useWebSocket()

  useEffect(() => {
    if (!ws.lastMessage) return
    if (ws.lastMessage.type === 'status') {
      setViewers(ws.lastMessage.viewers)
    }
    if (ws.lastMessage.type === 'schedule_update' && ws.lastMessage.matches) {
      const live = ws.lastMessage.matches.find(m => m.status === 'live')
      setLiveMatch(live || null)
    }
  }, [ws.lastMessage])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const scheduleRes = await fetch(getApiUrl('/api/schedule')).then(r => r.json())
        const live = Array.isArray(scheduleRes) ? scheduleRes.find(m => m.status === 'live') : null
        setLiveMatch(live || null)
      } catch { /* ignore */ }
    }
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-4">
      {/* Live Score Banner */}
      {liveMatch && (
        <div className="bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-800/50 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-400 font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Live Match
            </span>
            <span className="text-gray-500 text-xs">{liveMatch.league}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <FlagImg code={liveMatch.homeFlag} size={40} />
              <span className="text-white font-bold text-lg">{liveMatch.homeTeam}</span>
            </div>
            <div className="flex items-center gap-3">
              {liveMatch.homeScore != null && liveMatch.awayScore != null ? (
                <span className="text-orange-400 font-black text-4xl">{liveMatch.homeScore} - {liveMatch.awayScore}</span>
              ) : (
                <span className="text-gray-600 font-black text-3xl">VS</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-lg">{liveMatch.awayTeam}</span>
              <FlagImg code={liveMatch.awayFlag} size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      <VideoPlayer streamUrl={STREAM_URL} />

      {/* Stream Title & Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{STREAM_NAME}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="font-semibold">{viewers}</span>
            <span>watching</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${ws.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-xs text-gray-500">{ws.connected ? 'Connected' : 'Reconnecting...'}</span>
          </div>
        </div>
      </div>

      <MatchSchedule compact />
    </div>
  )
}
