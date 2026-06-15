import { useEffect, useRef, useState, useCallback } from 'react'

function extractYouTubeId(url) {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  const s = Math.floor(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
  return `${m}:${String(r).padStart(2, '0')}`
}

export default function HighlightsModal({ url, onClose }) {
  const videoId = extractYouTubeId(url)
  const wrapperRef = useRef(null)
  const playerRef = useRef(null)
  const pollRef = useRef(null)
  const readyRef = useRef(false)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(80)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [ready, setReady] = useState(false)
  const hideTimer = useRef(null)

  const showControls = useCallback(() => {
    setControlsVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (playing) setControlsVisible(false)
    }, 3000)
  }, [playing])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
      clearTimeout(hideTimer.current)
    }
  }, [onClose])

  useEffect(() => {
    if (!videoId) { window.open(url, '_blank'); return }
    if (!wrapperRef.current) return

    const createPlayer = () => {
      if (readyRef.current) return
      readyRef.current = true

      playerRef.current = new window.YT.Player(wrapperRef.current, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            setReady(true)
            const p = playerRef.current
            if (p && p.setVolume) p.setVolume(volume)
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true)
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setPlaying(false)
            } else if (e.data === window.YT.PlayerState.ENDED) {
              setPlaying(false)
              setControlsVisible(true)
              clearTimeout(hideTimer.current)
            }
          },
          onError: (e) => {
            console.error('YouTube player error:', e.data)
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      createPlayer()
    } else {
      const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]')
      if (!existingScript) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
      window.onYouTubeIframeAPIReady = createPlayer
    }

    return () => {
      readyRef.current = false
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch {}
        playerRef.current = null
      }
    }
  }, [videoId, url])

  useEffect(() => {
    if (!ready) return
    pollRef.current = setInterval(() => {
      const p = playerRef.current
      if (!p || !p.getCurrentTime) return
      try {
        setCurrent(p.getCurrentTime())
        setDuration(p.getDuration())
      } catch {}
    }, 250)
    return () => clearInterval(pollRef.current)
  }, [ready])

  useEffect(() => {
    if (playing) {
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3000)
    } else {
      setControlsVisible(true)
      clearTimeout(hideTimer.current)
    }
  }, [playing])

  const togglePlay = () => {
    const p = playerRef.current
    if (!p) return
    try {
      if (playing) p.pauseVideo(); else p.playVideo()
    } catch {}
  }

  const toggleMute = () => {
    const p = playerRef.current
    if (!p) return
    try {
      if (muted) { p.unMute(); setMuted(false) } else { p.mute(); setMuted(true) }
    } catch {}
  }

  const handleVolume = (e) => {
    const p = playerRef.current
    if (!p) return
    const v = Number(e.target.value)
    try {
      p.setVolume(v)
      setVolume(v)
      if (v === 0) { p.mute(); setMuted(true) }
      else if (muted) { p.unMute(); setMuted(false) }
    } catch {}
  }

  const handleSeek = (e) => {
    const p = playerRef.current
    if (!p || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const time = pct * duration
    try { p.seekTo(time, true) } catch {}
    setCurrent(time)
  }

  const toggleFullscreen = () => {
    const el = wrapperRef.current?.parentElement
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen()
  }

  const handleKey = (e) => {
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay() }
    if (e.key === 'm') toggleMute()
    if (e.key === 'f') toggleFullscreen()
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const p = playerRef.current
      if (p) { try { p.seekTo(Math.max(0, p.getCurrentTime() - 10), true) } catch {} }
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const p = playerRef.current
      if (p) { try { p.seekTo(p.getCurrentTime() + 10, true) } catch {} }
    }
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0

  if (!videoId) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose} onKeyDown={handleKey} tabIndex={0}>

      <button onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white cursor-pointer z-50 transition-colors">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative w-full max-w-5xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl" style={{ paddingBottom: '56.25%' }}>

          <div className="absolute inset-0">
            <div ref={wrapperRef} className="w-full h-full" />
          </div>

          <div className={`absolute inset-0 z-10 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
              {!playing && (
                <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/25 transition-colors">
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10 pointer-events-auto">
              <div className="max-w-3xl mx-auto">
                <div className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group mb-3 hover:h-2.5 transition-all"
                  onMouseDown={(e) => { e.stopPropagation(); handleSeek(e) }}
                  onMouseMove={(e) => { if (e.buttons === 1) handleSeek(e) }}>
                  <div className="absolute left-0 top-0 h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-green-400 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ left: `calc(${progress}% - 7px)` }} />
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={(e) => { e.stopPropagation(); togglePlay() }}
                    className="text-white hover:text-green-400 transition-colors cursor-pointer">
                    {playing ? (
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>

                  <button onClick={(e) => { e.stopPropagation(); toggleMute() }}
                    className="text-white/70 hover:text-white transition-colors cursor-pointer">
                    {muted || volume === 0 ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                    ) : volume < 50 ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    )}
                  </button>

                  <div className="w-20">
                    <input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={handleVolume}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-green-500
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:bg-green-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer" />
                  </div>

                  <span className="text-white/70 text-xs font-mono select-none">
                    {formatTime(current)} / {formatTime(duration)}
                  </span>

                  <div className="ml-auto">
                    <button onClick={(e) => { e.stopPropagation(); toggleFullscreen() }}
                      className="text-white/70 hover:text-white transition-colors cursor-pointer">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
