import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

export default function VideoPlayer({ streamUrl, compact = false, filterStyle = '' }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const hlsRef = useRef(null)
  const hideControlsTimer = useRef(null)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(0.7)
  const [showVolume, setShowVolume] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)

  const proxyUrl = streamUrl ? `/api/hls-proxy?url=${encodeURIComponent(streamUrl)}` : null

  useEffect(() => {
    const video = videoRef.current
    if (!video || !proxyUrl) { setLoading(false); return }

    let hls = null
    setError(null)
    setLoading(true)
    setPlaying(false)

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 10,
        maxMaxBufferLength: 20,
        liveSyncDurationCount: 3,
        enableWorker: true,
      })
      hlsRef.current = hls
      hls.loadSource(proxyUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false)
        video.play().catch(() => {})
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad()
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError()
          else { setError('Stream not available'); setLoading(false) }
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = proxyUrl
      video.addEventListener('loadedmetadata', () => { setLoading(false); video.play().catch(() => {}) })
      video.addEventListener('error', () => { setError('Stream not available'); setLoading(false) })
    } else {
      setError('HLS is not supported in this browser')
      setLoading(false)
    }

    return () => { if (hls) { hls.destroy(); hlsRef.current = null } }
  }, [proxyUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    return () => { video.removeEventListener('play', onPlay); video.removeEventListener('pause', onPause) }
  }, [])

  const showControlsFn = () => {
    setControlsVisible(true)
    clearTimeout(hideControlsTimer.current)
    if (playing) hideControlsTimer.current = setTimeout(() => setControlsVisible(false), 3000)
  }

  useEffect(() => () => clearTimeout(hideControlsTimer.current), [playing])

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const handleVolume = (e) => {
    const v = videoRef.current
    if (!v) return
    const val = Number(e.target.value)
    v.volume = val
    setVolume(val)
    if (val === 0) { v.muted = true; setMuted(true) }
    else if (v.muted) { v.muted = false; setMuted(false) }
  }

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen()
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden group ${compact ? 'rounded-xl' : 'rounded-2xl'}`}
      onMouseMove={showControlsFn}
      onMouseLeave={() => { if (playing) setControlsVisible(false) }}
    >
      <video ref={videoRef} className="w-full aspect-video" style={{ filter: filterStyle || undefined }} playsInline muted onClick={togglePlay} onDoubleClick={toggleFullscreen} />

      <div className="absolute top-3 left-3 z-10">
        <div className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>
      </div>

      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="text-center">
            <div className="w-10 h-10 border-[3px] border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-300 text-sm">Connecting to stream...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="text-center">
            <svg className="w-14 h-14 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-sm mb-3">{error}</p>
            <button onClick={() => { setError(null); setLoading(true); window.location.reload() }} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors cursor-pointer">Retry</button>
          </div>
        </div>
      )}

      {!proxyUrl && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="text-center">
            <svg className="w-14 h-14 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-sm">No stream available</p>
          </div>
        </div>
      )}

      {!loading && !error && proxyUrl && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
          onMouseEnter={showControlsFn}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          <div className="relative px-4 pb-3 pt-8">
            <div className="w-full h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
              <div className="h-full bg-red-500 rounded-full w-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="text-white hover:text-green-400 transition-colors cursor-pointer">
                  {playing ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
                <div className="flex items-center gap-2" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
                  <button onClick={toggleMute} className="text-white hover:text-green-400 transition-colors cursor-pointer">
                    {muted || volume === 0 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
                    ) : volume < 0.5 ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07"/></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M18.07 5.93a9 9 0 010 12.14"/></svg>
                    )}
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${showVolume ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}>
                    <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={handleVolume} className="w-full h-1 accent-green-500 cursor-pointer" />
                  </div>
                </div>
              </div>
              <button onClick={toggleFullscreen} className="text-white hover:text-green-400 transition-colors cursor-pointer">
                {fullscreen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"/></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
