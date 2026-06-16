import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import HighlightsModal from '../components/HighlightsModal'
import { getApiUrl, getWsUrl } from '../config'

const FLAG_URL = (code) => `https://flagcdn.com/160x120/${code.toLowerCase()}.png`

const FlagImg = ({ code, size = 80 }) => {
  if (!code) return null
  return <img src={FLAG_URL(code)} alt="" width={size} height={Math.round(size * 0.75)} className="object-cover rounded" style={{ imageRendering: 'auto' }} onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60"><rect fill="%23374151" width="80" height="60"/></svg>' }} />
}

const GROUP_LABELS = [
  'All Matches', 'Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F',
  'Group G', 'Group H', 'Group I', 'Group J', 'Group K', 'Group L',
  'Round of 32', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', '3rd Place', 'Final'
]

const GROUP_COLORS = {
  'Group A': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'Group B': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'Group C': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'Group D': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'Group E': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'Group F': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'Group G': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'Group H': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'Group I': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'Group J': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'Group K': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'Group L': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function to12Hour(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

function formatDateDisplay(dateStr) {
  const [y, mo, d] = dateStr.split('-')
  return `${Number(d)} ${MONTHS_SHORT[Number(mo) - 1]} ${y}`
}

function getDateGroup(dateStr) {
  const [y, mo, d] = dateStr.split('-')
  return `${MONTHS_FULL[Number(mo) - 1]} ${Number(d)}, ${y}`
}

function computeStatus(match) {
  if (match.status === 'live') return 'live'
  if (match.status === 'finished') return 'finished'
  return 'upcoming'
}

function StatusBadge({ status }) {
  if (status === 'live') {
    return (
      <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
        LIVE
      </span>
    )
  }
  if (status === 'finished') {
    return <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">Finished</span>
  }
  return <span className="bg-blue-600/20 text-blue-400 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-500/30">Upcoming</span>
}

export default function Schedule() {
  const [matches, setMatches] = useState([])
  const [activeFilter, setActiveFilter] = useState('All Matches')
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

  const getGroup = (league) => {
    const m = league.match(/Group ([A-L])/i)
    return m ? `Group ${m[1]}` : ''
  }

  const processedMatches = useMemo(() => {
    return matches.map(m => ({ ...m, computedStatus: computeStatus(m) }))
  }, [matches])

  const filtered = useMemo(() => {
    if (activeFilter === 'All Matches') return processedMatches
    return processedMatches.filter(m => getGroup(m.league) === activeFilter)
  }, [processedMatches, activeFilter])

  const groupedByDate = useMemo(() => {
    const groups = {}
    filtered.forEach(match => {
      const key = getDateGroup(match.date)
      if (!groups[key]) groups[key] = []
      groups[key].push(match)
    })
    return groups
  }, [filtered])

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {GROUP_LABELS.map(label => {
            const isActive = activeFilter === label
            return (
              <button
                key={label}
                onClick={() => setActiveFilter(label)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No matches in this category yet</p>
        </div>
      ) : (
        Object.entries(groupedByDate).map(([dateLabel, dateMatches]) => (
          <div key={dateLabel} className="mb-8">
            <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-orange-400">|</span> {dateLabel}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dateMatches.map(match => {
                const group = getGroup(match.league)
                const status = match.computedStatus
                const hasScore = match.homeScore != null && match.awayScore != null && status === 'finished'
                const isLive = status === 'live'

                return (
                  <div
                    key={match.id}
                    className={`bg-[#1a1a2e]/80 rounded-2xl overflow-hidden border transition-all hover:scale-[1.02] ${
                      isLive ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-gray-800/80'
                    }`}
                  >
                    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                      <span className={`text-xs font-bold px-3 py-1 rounded-md ${GROUP_COLORS[group] || 'bg-gray-700 text-gray-300'}`}>
                        {group || 'TBD'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs font-medium">{match.matchday || 'Matchday 1'}</span>
                        <StatusBadge status={status} />
                      </div>
                    </div>

                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center w-[100px]">
                          <FlagImg code={match.homeFlag} size={80} />
                          <span className="text-white font-bold text-sm mt-3 text-center leading-tight">{match.homeTeam}</span>
                        </div>

                        <div className="flex flex-col items-center px-3">
                          {hasScore ? (
                            <div className="flex items-center gap-2">
                              <span className="text-4xl font-black text-orange-400">{match.homeScore}</span>
                              <span className="text-gray-600 text-2xl font-bold">-</span>
                              <span className="text-4xl font-black text-orange-400">{match.awayScore}</span>
                            </div>
                          ) : isLive ? (
                            <div className="flex flex-col items-center">
                              <span className="text-red-500 font-bold text-sm animate-pulse">LIVE</span>
                              <span className="text-2xl font-black text-orange-400 mt-1">VS</span>
                            </div>
                          ) : (
                            <span className="text-2xl font-black text-gray-600">VS</span>
                          )}
                        </div>

                        <div className="flex flex-col items-center w-[100px]">
                          <FlagImg code={match.awayFlag} size={80} />
                          <span className="text-white font-bold text-sm mt-3 text-center leading-tight">{match.awayTeam}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3 border-t border-gray-800/60 flex items-center justify-between">
                      <span className="text-gray-500 text-xs">{formatDateDisplay(match.date)} {to12Hour(match.time)}</span>
                      <div className="flex items-center gap-3">
                        {match.stadium && (
                          <span className="text-gray-500 text-xs flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            {match.stadium}
                          </span>
                        )}
                        {status === 'finished' && match.highlightsUrl && (
                          <button onClick={() => setHighlightsUrl(match.highlightsUrl)}
                            className="bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-500/30 flex items-center gap-1.5 transition-colors cursor-pointer">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            Highlights
                          </button>
                        )}
                      </div>
                    </div>

                    {isLive && <div className="h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600 animate-pulse"></div>}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
      {highlightsUrl && <HighlightsModal url={highlightsUrl} onClose={() => setHighlightsUrl(null)} />}
    </div>
  )
}
