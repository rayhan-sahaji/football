import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Football3D from '../components/Football3D'
import VideoPlayer from '../components/VideoPlayer'
import MatchSchedule from '../components/MatchSchedule'
import { getApiUrl } from '../config'
import { getWsUrl } from '../config'

gsap.registerPlugin(ScrollTrigger)

const FLAG_URL = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`
const FlagImg = ({ code, size = 24 }) => {
  if (!code) return null
  return <img src={FLAG_URL(code)} alt="" width={size} height={Math.round(size * 0.75)} className="inline-block rounded-sm" style={{ objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} />
}

function to12Hour(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function formatDateShort(dateStr) {
  const [y, mo, d] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${Number(d)} ${months[Number(mo) - 1]}`
}

const STATS = [
  { value: '48', label: 'Matches' },
  { value: '32', label: 'Teams' },
  { value: '12', label: 'Venues' },
  { value: '2026', label: 'World Cup' },
]

const FEATURES = [
  { icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', color: 'red', title: 'HD Live Streaming', desc: 'Watch football in crystal-clear HD quality with zero lag.' },
  { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'yellow', title: 'Live Scores', desc: 'Real-time scores updated live during the match.' },
  { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', color: 'blue', title: 'Quality Settings', desc: 'Choose your preferred resolution from multiple quality options.' },
  { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'green', title: 'Global Access', desc: 'Watch from anywhere in the world, on any device.' },
]

export default function Home() {
  const [matches, setMatches] = useState([])
  const [streams, setStreams] = useState([])
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleRes, streamsRes] = await Promise.all([
          fetch(getApiUrl('/api/schedule')).then(r => r.json()),
          fetch(getApiUrl('/api/streams')).then(r => r.json()),
        ])
        setMatches(scheduleRes)
        setStreams(streamsRes.filter(s => s.active))
      } catch { /* */ }
    }
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const ws = new WebSocket(getWsUrl())
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'schedule_update' && msg.matches) setMatches(msg.matches)
      } catch { /* */ }
    }
    return () => ws.close()
  }, [])

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo('.hero-title', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' })
      gsap.fromTo('.hero-sub', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: 'power3.out' })
      gsap.fromTo('.hero-btns', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.6, ease: 'power3.out' })
      gsap.fromTo('.hero-3d', { scale: 0.8, opacity: 0, y: 40 }, { scale: 1, opacity: 1, y: 0, duration: 1.2, delay: 0.4, ease: 'power3.out' })

      // Stats counter animation
      gsap.fromTo('.stat-item', { y: 60, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: statsRef.current, start: 'top 80%' }
      })

      // Features animation
      gsap.fromTo('.feature-card', { y: 80, opacity: 0, scale: 0.9 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' }
      })

      // CTA animation
      gsap.fromTo('.cta-section', { y: 60, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: ctaRef.current, start: 'top 80%' }
      })
    })

    return () => ctx.revert()
  }, [])

  const liveMatches = matches.filter(m => m.status === 'live')
  const upcomingMatches = matches.filter(m => m.status === 'upcoming').slice(0, 4)
  const finishedMatches = matches.filter(m => m.status === 'finished').slice(-3).reverse()

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[calc(100vh-88px)] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/20 via-gray-950 to-gray-950"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px]"></div>

        <div className="relative max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center py-16">
          {/* Left content */}
          <div className="space-y-8">
            <div className="hero-title space-y-6">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-sm font-semibold tracking-wide">FIFA World Cup 2026</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight">
                Feel Every
                <br />
                <span className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 bg-clip-text text-transparent">
                  Moment Live
                </span>
              </h1>
            </div>
            <p className="hero-sub text-lg md:text-xl text-gray-400 max-w-md leading-relaxed">
              Stream every goal, every tackle, every celebration. The world's biggest tournament, live on your screen.
            </p>
            <div className="hero-btns flex flex-wrap items-center gap-4">
              <Link to="/watch" className="group font-bold px-8 py-4 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-white/10 transition-all duration-300 flex items-center gap-2.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Watch Live
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <Link to="/schedule" className="font-bold px-8 py-4 rounded-2xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-white/5 transition-all duration-300">
                Full Schedule
              </Link>
            </div>
          </div>

          {/* Right - Live Stream Preview */}
          <div className="hero-3d relative hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-green-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative">
                <VideoPlayer streamUrl={streams[0]?.url || null} compact />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-gray-500 text-xs tracking-wider uppercase">Scroll</span>
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Live Now
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map(match => (
              <Link to="/watch" key={match.id} className="group bg-gray-900 border border-red-800/50 rounded-2xl p-5 hover:border-red-600/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-red-400 font-bold">{match.league}</span>
                  <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlagImg code={match.homeFlag} />
                    <span className="text-white font-semibold">{match.homeTeam}</span>
                  </div>
                  <span className="text-orange-400 font-black text-lg">{match.homeScore != null ? `${match.homeScore} - ${match.awayScore}` : 'VS'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{match.awayTeam}</span>
                    <FlagImg code={match.awayFlag} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Stats Bar */}
      <section ref={statsRef} className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="stat-item text-center">
              <span className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">{stat.value}</span>
              <span className="text-gray-400 text-sm mt-2 block">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Upcoming Matches</h2>
            <Link to="/schedule" className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingMatches.map(match => (
              <div key={match.id} className="group bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500">{match.league}</span>
                  <span className="text-xs text-green-400 font-medium">{formatDateShort(match.date)}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FlagImg code={match.homeFlag} />
                    <span className="text-white font-semibold text-sm">{match.homeTeam}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FlagImg code={match.awayFlag} />
                    <span className="text-white font-semibold text-sm">{match.awayTeam}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-green-400 font-bold text-sm">{to12Hour(match.time)}</span>
                  <span className="text-gray-600 text-xs">{match.stadium}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section ref={featuresRef} className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white">Why Football Live?</h2>
          <p className="text-gray-400 mt-3 text-lg">Everything you need for the ultimate matchday experience</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl">
              <div className={`w-14 h-14 bg-${f.color}-900/30 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <svg className={`w-7 h-7 text-${f.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Results */}
      {finishedMatches.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-white mb-8">Recent Results</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {finishedMatches.map(match => (
              <div key={match.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <span className="text-xs text-gray-500">{match.league}</span>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FlagImg code={match.homeFlag} />
                      <span className="text-white font-semibold text-sm">{match.homeTeam}</span>
                    </div>
                    <span className="text-orange-400 font-black text-lg">{match.homeScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FlagImg code={match.awayFlag} />
                      <span className="text-white font-semibold text-sm">{match.awayTeam}</span>
                    </div>
                    <span className="text-orange-400 font-black text-lg">{match.awayScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Match Schedule */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <MatchSchedule compact />
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="max-w-7xl mx-auto px-6 py-20">
        <div className="cta-section relative bg-gradient-to-br from-green-900/30 via-gray-900 to-gray-900 border border-green-800/30 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green-500/10 rounded-full blur-[100px]"></div>
          <div className="relative">
            <h2 className="text-4xl font-bold text-white mb-4">Never Miss a Match</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">Join millions of fans watching the beautiful game live. The World Cup is here.</p>
            <Link to="/watch" className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg shadow-green-600/25">
              Start Watching
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
            </div>
            <span className="text-gray-400 text-sm">Football Live Streaming Platform</span>
          </div>
          <div className="flex items-center gap-6 text-gray-500 text-sm">
            <Link to="/schedule" className="hover:text-white transition-colors">Schedule</Link>
            <Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
            <Link to="/watch" className="hover:text-white transition-colors">Watch</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
