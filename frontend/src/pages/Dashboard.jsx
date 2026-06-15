import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import VideoPlayer from '../components/VideoPlayer'
import LiveScoreManager from '../components/LiveScoreManager'
import ScheduleManager from '../components/ScheduleManager'
import PlayerManager from '../components/PlayerManager'
import ColorGradingPanel, { buildColorFilter } from '../components/ColorGradingPanel'
import { getApiUrl } from '../config'

const DEFAULT_COLORS = {
  brightness: 100, contrast: 100, saturation: 100, hue: 0,
  temperature: 0, exposure: 0, gamma: 100, sepia: 0, blur: 0, grayscale: 0,
}

export default function Dashboard() {
  const { logout } = useAuth()
  const [streams, setStreams] = useState([])
  const [colorValues, setColorValues] = useState(() => {
    try { const s = localStorage.getItem('colorgrading'); return s ? JSON.parse(s) : DEFAULT_COLORS } catch { return DEFAULT_COLORS }
  })

  useEffect(() => {
    fetch(getApiUrl('/api/streams')).then(r => r.json()).then(setStreams).catch(() => {})
  }, [])

  useEffect(() => {
    localStorage.setItem('colorgrading', JSON.stringify(colorValues))
  }, [colorValues])

  const activeStream = streams.find(s => s.active) || streams[0]
  const filterStyle = buildColorFilter(colorValues)

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Live preview, score control, schedule and player management.</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Preview */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Live Preview
            </h3>
            <VideoPlayer streamUrl={activeStream?.url || null} filterStyle={filterStyle} />
          </div>

          {/* Live Score Control */}
          <LiveScoreManager />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <ColorGradingPanel values={colorValues} onChange={setColorValues} />
          <ScheduleManager />
          <PlayerManager />
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
            <div className="space-y-2">
              <a href="/watch" className="block bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-3 text-gray-300 hover:text-white transition-colors">
                Watch Live Stream
              </a>
              <a href="/leaderboard" className="block bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-3 text-gray-300 hover:text-white transition-colors">
                View Leaderboard
              </a>
              <a href="/schedule" className="block bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-3 text-gray-300 hover:text-white transition-colors">
                View Schedule
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
