const express = require('express')
const cors = require('cors')
const http = require('http')
const https = require('https')
const crypto = require('crypto')
const { WebSocketServer } = require('ws')
const { v4: uuidv4 } = require('uuid')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: CORS_ORIGIN.split(','), credentials: true }))
app.use(express.json())

// ─── Data files ─────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const SCHEDULE_FILE = path.join(DATA_DIR, 'schedule.json')
const CHAT_FILE = path.join(DATA_DIR, 'chat.json')
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json')
const STREAMS_FILE = path.join(DATA_DIR, 'streams.json')
const AUTH_FILE = path.join(DATA_DIR, 'auth.json')

function loadJSON(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) { /* ignore */ }
  return fallback
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

let matches = loadJSON(SCHEDULE_FILE, [])
let chatMessages = loadJSON(CHAT_FILE, [])
let players = loadJSON(PLAYERS_FILE, [])

// ─── State ──────────────────────────────────────────────
let viewerCount = 0

// ─── Auth System ────────────────────────────────────────
const ADMIN_PASSWORD = 'RayhAn22448np2'
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

let authData = loadJSON(AUTH_FILE, { sessions: {} })

function saveAuth() {
  saveJSON(AUTH_FILE, authData)
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

function createSession() {
  const token = generateToken()
  authData.sessions[token] = { created: Date.now(), expires: Date.now() + TOKEN_EXPIRY }
  saveAuth()
  return token
}

function isValidSession(token) {
  if (!token || !authData.sessions[token]) return false
  const session = authData.sessions[token]
  if (Date.now() > session.expires) {
    delete authData.sessions[token]
    saveAuth()
    return false
  }
  return true
}

function removeSession(token) {
  delete authData.sessions[token]
  saveAuth()
}

// Clean expired sessions periodically
setInterval(() => {
  const now = Date.now()
  for (const [token, session] of Object.entries(authData.sessions)) {
    if (now > session.expires) delete authData.sessions[token]
  }
  saveAuth()
}, 60 * 60 * 1000)

// Auth middleware - protect admin write endpoints
function requireAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '')
  if (!isValidSession(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// Public read endpoints - no auth needed for viewing
app.get('/api/schedule', (req, res) => {
  res.json(matches)
})
app.get('/api/players', (req, res) => {
  res.json(players)
})
app.get('/api/streams', (req, res) => {
  res.json(liveStreams)
})

// ─── WebSocket ──────────────────────────────────────────
wss.on('connection', (ws) => {
  viewerCount++
  broadcastAll({ type: 'status', viewers: viewerCount })

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw)
      handleWsMessage(ws, msg)
    } catch (e) { /* ignore bad json */ }
  })

  ws.on('close', () => {
    viewerCount = Math.max(0, viewerCount - 1)
    broadcastAll({ type: 'status', viewers: viewerCount })
  })

  ws.on('error', () => {
    viewerCount = Math.max(0, viewerCount - 1)
    broadcastAll({ type: 'status', viewers: viewerCount })
  })
})

function handleWsMessage(ws, msg) {
  if (msg.type === 'chat') {
    const chatMsg = {
      id: uuidv4(),
      username: (msg.username || 'Anonymous').slice(0, 20),
      message: (msg.message || '').slice(0, 500),
      timestamp: Date.now(),
    }
    chatMessages.push(chatMsg)
    if (chatMessages.length > 200) chatMessages = chatMessages.slice(-200)
    saveJSON(CHAT_FILE, chatMessages)
    broadcastAll({ type: 'chat', ...chatMsg })
  }
}

function broadcastAll(data) {
  const str = JSON.stringify(data)
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(str)
  })
}

// ─── API: Auth ──────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body
  if (!password) return res.status(400).json({ error: 'Password required' })
  if (hashPassword(password) !== hashPassword(ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Invalid password' })
  }
  const token = createSession()
  res.json({ token })
})

app.get('/api/auth/verify', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '')
  if (isValidSession(token)) {
    res.json({ valid: true })
  } else {
    res.status(401).json({ valid: false })
  }
})

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '')
  removeSession(token)
  res.json({ success: true })
})

// ─── API: Viewers ───────────────────────────────────────
app.get('/api/viewers', (req, res) => {
  res.json({ viewers: viewerCount })
})

// ─── API: Chat ──────────────────────────────────────────
app.get('/api/chat', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200)
  res.json(chatMessages.slice(-limit))
})

app.delete('/api/chat', requireAuth, (req, res) => {
  chatMessages = []
  saveJSON(CHAT_FILE, chatMessages)
  broadcastAll({ type: 'chat_clear' })
  res.json({ success: true })
})

// ─── API: Match Schedule ────────────────────────────────
// GET /api/schedule is public (defined above)

app.post('/api/schedule', requireAuth, (req, res) => {
  const { homeTeam, awayTeam, homeFlag, awayFlag, date, time, league, status, stadium, matchday, homeScore, awayScore, highlightsUrl } = req.body
  if (!homeTeam || !awayTeam || !date || !time) {
    return res.status(400).json({ error: 'homeTeam, awayTeam, date, time are required' })
  }
  const match = {
    id: uuidv4(),
    homeTeam,
    awayTeam,
    homeFlag: (homeFlag || '').toLowerCase(),
    awayFlag: (awayFlag || '').toLowerCase(),
    date,
    time,
    league: league || '',
    status: status || 'upcoming',
    stadium: stadium || '',
    matchday: matchday || 'Matchday 1',
    homeScore: homeScore != null ? homeScore : null,
    awayScore: awayScore != null ? awayScore : null,
    highlightsUrl: highlightsUrl || '',
    createdAt: Date.now(),
  }
  matches.push(match)
  matches.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
  saveJSON(SCHEDULE_FILE, matches)
  broadcastAll({ type: 'schedule_update', matches })
  res.json(match)
})

app.put('/api/schedule/:id', requireAuth, (req, res) => {
  const idx = matches.findIndex(m => m.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Match not found' })
  matches[idx] = { ...matches[idx], ...req.body }
  saveJSON(SCHEDULE_FILE, matches)
  broadcastAll({ type: 'schedule_update', matches })
  res.json(matches[idx])
})

app.delete('/api/schedule/:id', requireAuth, (req, res) => {
  matches = matches.filter(m => m.id !== req.params.id)
  saveJSON(SCHEDULE_FILE, matches)
  broadcastAll({ type: 'schedule_update', matches })
  res.json({ success: true })
})

// ─── API: Player Scores (Leaderboard) ──────────────────────
// GET /api/players is public (defined above)

app.post('/api/players', requireAuth, (req, res) => {
  const { name, country, goals, assists, team } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const player = {
    id: uuidv4(),
    name,
    country: (country || '').toLowerCase(),
    goals: goals || 0,
    assists: assists || 0,
    team: team || '',
    createdAt: Date.now(),
  }
  players.push(player)
  players.sort((a, b) => (b.goals * 3 + b.assists) - (a.goals * 3 + a.assists))
  saveJSON(PLAYERS_FILE, players)
  broadcastAll({ type: 'players_update', players })
  res.json(player)
})

app.put('/api/players/:id', requireAuth, (req, res) => {
  const idx = players.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Player not found' })
  players[idx] = { ...players[idx], ...req.body }
  players.sort((a, b) => (b.goals * 3 + b.assists) - (a.goals * 3 + a.assists))
  saveJSON(PLAYERS_FILE, players)
  broadcastAll({ type: 'players_update', players })
  res.json(players[idx])
})

app.delete('/api/players/:id', requireAuth, (req, res) => {
  players = players.filter(p => p.id !== req.params.id)
  saveJSON(PLAYERS_FILE, players)
  broadcastAll({ type: 'players_update', players })
  res.json({ success: true })
})

// ─── API: External Live Streams ──────────────────────────
let liveStreams = loadJSON(STREAMS_FILE, [
  {
    id: 'tsports-hd',
    name: 'T Sports HD - Live',
    url: 'http://172.19.17.202:8090/hls/tsportshd3rd.m3u8',
    logo: '',
    active: true,
  }
])

// GET /api/streams is public (defined above)

app.post('/api/streams', requireAuth, (req, res) => {
  const stream = { id: uuidv4(), ...req.body, active: true }
  liveStreams.push(stream)
  saveJSON(STREAMS_FILE, liveStreams)
  res.json(stream)
})

app.put('/api/streams/:id', requireAuth, (req, res) => {
  const idx = liveStreams.findIndex(s => s.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Stream not found' })
  liveStreams[idx] = { ...liveStreams[idx], ...req.body }
  saveJSON(STREAMS_FILE, liveStreams)
  res.json(liveStreams[idx])
})

app.delete('/api/streams/:id', requireAuth, (req, res) => {
  liveStreams = liveStreams.filter(s => s.id !== req.params.id)
  saveJSON(STREAMS_FILE, liveStreams)
  res.json({ success: true })
})

// ─── HLS Proxy (bypass CORS) ─────────────────────────────
app.get('/api/hls-proxy', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl) return res.status(400).json({ error: 'url required' })

  try {
    const proxyRes = await new Promise((resolve, reject) => {
      http.get(targetUrl, { timeout: 10000 }, resolve).on('error', reject)
    })
    const ct = proxyRes.headers['content-type'] || 'application/octet-stream'
    res.set('Content-Type', ct)
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate')

    if (targetUrl.endsWith('.m3u8')) {
      let body = ''
      proxyRes.on('data', chunk => body += chunk)
      proxyRes.on('end', () => {
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1)
        const rewritten = body.replace(/^(?!#)(.+\.ts.*)$/gm, (match) => {
          const absolute = match.startsWith('http') ? match : baseUrl + match
          return `/api/hls-proxy?url=${encodeURIComponent(absolute)}`
        })
        res.send(rewritten)
      })
    } else {
      proxyRes.pipe(res)
    }
  } catch (err) {
    res.status(502).json({ error: 'Proxy error: ' + err.message })
  }
})

// ─── FFmpeg Multi-Quality Transcoder ─────────────────────
const FFMPEG_PATH = 'C:\\Users\\Jamal  Sahaji\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe'
const TRANSCODE_DIR = path.join(__dirname, '..', 'media', 'transcoded')
const QUALITIES = [
  { name: '1080p', width: 1920, height: 1080, bitrate: '5000k', maxrate: '5000k', bufsize: '10000k', audiobitrate: '192k' },
  { name: '720p', width: 1280, height: 720, bitrate: '2500k', maxrate: '2500k', bufsize: '5000k', audiobitrate: '128k' },
  { name: '480p', width: 854, height: 480, bitrate: '1500k', maxrate: '1500k', bufsize: '3000k', audiobitrate: '128k' },
  { name: '360p', width: 640, height: 360, bitrate: '800k', maxrate: '800k', bufsize: '1600k', audiobitrate: '96k' },
]

let transcodeProcess = null
let transcodeRunning = false

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function killTranscode() {
  if (transcodeProcess) {
    transcodeProcess.kill('SIGTERM')
    transcodeProcess = null
    transcodeRunning = false
    console.log('[TRANSCODE] Stopped')
  }
}

function startTranscode(sourceUrl) {
  killTranscode()

  // Create output dirs
  QUALITIES.forEach(q => ensureDir(path.join(TRANSCODE_DIR, q.name)))
  ensureDir(TRANSCODE_DIR)

  console.log('[TRANSCODE] Starting for:', sourceUrl)

  // Start 3 separate FFmpeg processes, one per quality
  transcodeRunning = true
  const processes = []

  QUALITIES.forEach((q) => {
    const args = [
      '-y',
      '-reconnect', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-i', sourceUrl,
      '-c:v', 'libx264', '-preset', 'ultrafast', '-tune', 'zerolatency',
      '-b:v', q.bitrate, '-maxrate', q.maxrate, '-bufsize', q.bufsize,
      '-s', `${q.width}x${q.height}`,
      '-c:a', 'aac', '-b:a', q.audiobitrate, '-ac', '2',
      '-f', 'hls',
      '-hls_time', '4',
      '-hls_list_size', '10',
      '-hls_flags', 'delete_segments+append_list+independent_segments',
      '-hls_segment_filename', path.join(TRANSCODE_DIR, q.name, 'seg_%04d.ts'),
      path.join(TRANSCODE_DIR, q.name, 'playlist.m3u8'),
    ]

    console.log(`[TRANSCODE] Starting ${q.name} (${q.width}x${q.height})`)
    const proc = spawn(FFMPEG_PATH, args, { stdio: ['ignore', 'pipe', 'pipe'] })

    proc.stderr.on('data', (d) => {
      const msg = d.toString().trim()
      if (msg && msg.includes('frame=')) {
        process.stdout.write(`\r[TRANSCODE ${q.name}] ${msg.substring(0, 100)}`)
      }
    })

    proc.on('close', (code) => {
      console.log(`\n[TRANSCODE ${q.name}] Exited code ${code}`)
      processes.splice(processes.indexOf(proc), 1)
      if (processes.length === 0) {
        transcodeRunning = false
        transcodeProcess = null
        // Auto-restart on crash
        if (code !== 0) {
          console.log('[TRANSCODE] Restarting in 5s...')
          setTimeout(() => {
            if (!transcodeRunning) {
              const active = liveStreams.find(s => s.active)
              if (active) startTranscode(active.url)
            }
          }, 5000)
        }
      }
    })

    proc.on('error', (err) => {
      console.log(`[TRANSCODE ${q.name}] Error:`, err.message)
    })

    processes.push(proc)
  })

  transcodeProcess = { kill: () => processes.forEach(p => p.kill('SIGTERM')) }

  // Generate master playlist
  setTimeout(generateMasterPlaylist, 3000)
}

function generateMasterPlaylist() {
  let master = '#EXTM3U\n#EXT-X-VERSION:3\n\n'
  QUALITIES.forEach(q => {
    master += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(q.bitrate) * 1000},RESOLUTION=${q.width}x${q.height},NAME="${q.name}"\n`
    master += `${q.name}/playlist.m3u8\n`
  })

  fs.writeFileSync(path.join(TRANSCODE_DIR, 'master.m3u8'), master)
  console.log('[TRANSCODE] Master playlist generated')
}

// Serve transcoded streams
app.use('/api/transcoded', express.static(TRANSCODE_DIR, {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }
}))

// API to start/stop transcoding
app.post('/api/transcode/start', requireAuth, (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'url required' })
  startTranscode(url)
  res.json({ success: true, message: 'Transcoding started' })
})

app.post('/api/transcode/stop', requireAuth, (req, res) => {
  killTranscode()
  res.json({ success: true })
})

app.get('/api/transcode/status', (req, res) => {
  res.json({ running: transcodeRunning })
})

// Transcoder auto-start disabled (no quality settings)

// ─── Start ──────────────────────────────────────────────
const PORT = 3001

server.listen(PORT, () => {
  console.log('')
  console.log('==========================================')
  console.log('  Football Live Streaming Server')
  console.log('==========================================')
  console.log('  API:      http://localhost:' + PORT)
  console.log('  Website:  http://localhost:5173')
  console.log('==========================================')
})
