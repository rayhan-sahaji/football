import { useState, useEffect } from 'react'
import axios from 'axios'
import HighlightsModal from './HighlightsModal'
import { getApiUrl, getWsUrl } from '../config'

const FLAG_URL = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`

const FlagImg = ({ code, size = 24 }) => {
  if (!code) return null
  return <img src={FLAG_URL(code)} alt="" width={size} height={Math.round(size * 0.75)} className="inline-block rounded-sm" style={{ objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} />
}

function to12Hour(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`
}

function formatDateShort(dateStr) {
  const [y, mo, d] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${Number(d)} ${months[Number(mo) - 1]}`
}

function computeStatus(match) {
  if (match.status === 'live') return 'live'
  if (match.status === 'finished') return 'finished'
  return 'upcoming'
}

function StatusBadge({ status }) {
  if (status === 'live') {
    return (
      <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
        LIVE
      </span>
    )
  }
  if (status === 'finished') {
    return <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">FT</span>
  }
  return null
}

export default function MatchSchedule({ compact }) {
  const [matches, setMatches] = useState([])
  const [highlightsUrl, setHighlightsUrl] = useState(null)

  useEffect(() => {
    const fetchMatches = async () => {
      try { const res = await axios.get(getApiUrl('/api/schedule')); setMatches(Array.isArray(res.data) ? res.data : []) } catch { /* */ }
    }
    fetchMatches()
    const interval = setInterval(fetchMatches, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const ws = new WebSocket(getWsUrl())
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'schedule_update' && Array.isArray(msg.matches)) {
          setMatches(msg.matches)
        }
      } catch { /* */ }
    }
    return () => ws.close()
  }, [])

  if (matches.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Match Schedule
        </h3>
        <p className="text-gray-500 text-sm text-center py-4">No matches scheduled yet</p>
      </div>
    )
  }

  const processed = matches.map(m => ({ ...m, computedStatus: computeStatus(m) }))
  const displayMatches = compact ? processed.slice(0, 5) : processed

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Match Schedule
      </h3>
      <div className="space-y-3">
        {displayMatches.map((match) => {
          const status = match.computedStatus
          const hasScore = match.homeScore != null && match.awayScore != null && status === 'finished'
          return (
            <div
              key={match.id}
              className={`bg-gray-800 rounded-xl px-4 py-3 border ${
                status === 'live' ? 'border-red-800 bg-red-950/30' : 'border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">{match.league || 'Football'}</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={status} />
                  <span className="text-gray-500 text-xs">{formatDateShort(match.date)} {to12Hour(match.time)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold flex items-center gap-2">
                  <FlagImg code={match.homeFlag} size={26} />
                  {match.homeTeam}
                </span>
                {hasScore ? (
                  <span className="text-orange-400 font-black text-lg px-3">{match.homeScore} - {match.awayScore}</span>
                ) : status === 'live' ? (
                  <span className="text-red-500 font-bold text-sm px-3 animate-pulse">LIVE</span>
                ) : (
                  <span className="text-gray-500 text-sm font-bold px-3">VS</span>
                )}
                <span className="text-white font-semibold flex items-center gap-2">
                  {match.awayTeam}
                  <FlagImg code={match.awayFlag} size={26} />
                </span>
              </div>
              {status === 'finished' && match.highlightsUrl && (
                <button onClick={() => setHighlightsUrl(match.highlightsUrl)}
                  className="mt-2 inline-flex items-center gap-1.5 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-500/30 transition-colors cursor-pointer">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Watch Highlights
                </button>
              )}
            </div>
          )
        })}
      </div>
      {compact && matches.length > 5 && (
        <a href="/schedule" className="block text-center text-green-400 hover:text-green-300 text-sm mt-4 transition-colors">
          View all {matches.length} matches
        </a>
      )}
      {highlightsUrl && <HighlightsModal url={highlightsUrl} onClose={() => setHighlightsUrl(null)} />}
    </div>
  )
}
