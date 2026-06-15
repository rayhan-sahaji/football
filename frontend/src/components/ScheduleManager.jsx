import { useState, useEffect } from 'react'
import { authFetch } from '../utils/api'
import HighlightsModal from './HighlightsModal'
import { getApiUrl } from '../config'

const COUNTRIES = [
  { code: 'gb-eng', name: 'England' },
  { code: 'gb-wls', name: 'Wales' },
  { code: 'gb-sct', name: 'Scotland' },
  { code: 'es', name: 'Spain' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'it', name: 'Italy' },
  { code: 'pt', name: 'Portugal' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'be', name: 'Belgium' },
  { code: 'br', name: 'Brazil' },
  { code: 'ar', name: 'Argentina' },
  { code: 'uy', name: 'Uruguay' },
  { code: 'co', name: 'Colombia' },
  { code: 'cl', name: 'Chile' },
  { code: 'mx', name: 'Mexico' },
  { code: 'us', name: 'USA' },
  { code: 'ca', name: 'Canada' },
  { code: 'jp', name: 'Japan' },
  { code: 'kr', name: 'South Korea' },
  { code: 'cn', name: 'China' },
  { code: 'au', name: 'Australia' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'ma', name: 'Morocco' },
  { code: 'sn', name: 'Senegal' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'gh', name: 'Ghana' },
  { code: 'cm', name: 'Cameroon' },
  { code: 'eg', name: 'Egypt' },
  { code: 'tr', name: 'Turkey' },
  { code: 'pl', name: 'Poland' },
  { code: 'cz', name: 'Czech Republic' },
  { code: 'se', name: 'Sweden' },
  { code: 'dk', name: 'Denmark' },
  { code: 'no', name: 'Norway' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'at', name: 'Austria' },
  { code: 'hr', name: 'Croatia' },
  { code: 'rs', name: 'Serbia' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'gr', name: 'Greece' },
  { code: 'ie', name: 'Ireland' },
  { code: 'ec', name: 'Ecuador' },
  { code: 'pe', name: 'Peru' },
  { code: 'bo', name: 'Bolivia' },
  { code: 've', name: 'Venezuela' },
  { code: 'py', name: 'Paraguay' },
  { code: 'ir', name: 'Iran' },
  { code: 'iq', name: 'Iraq' },
  { code: 'il', name: 'Israel' },
  { code: 'uz', name: 'Uzbekistan' },
  { code: 'za', name: 'South Africa' },
  { code: 'ba', name: 'Bosnia and Herzegovina' },
  { code: 'ci', name: "Cote d'Ivoire" },
  { code: 'cw', name: 'Curacao' },
  { code: 'ht', name: 'Haiti' },
  { code: 'qa', name: 'Qatar' },
  { code: 'cv', name: 'Cabo Verde' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'pa', name: 'Panama' },
  { code: 'cd', name: 'Congo DR' },
  { code: 'jo', name: 'Jordan' },
  { code: 'dz', name: 'Algeria' },
]

const FLAG_URL = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`

function to12Hour(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export default function ScheduleManager() {
  const [matches, setMatches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [homeFlagOpen, setHomeFlagOpen] = useState(false)
  const [awayFlagOpen, setAwayFlagOpen] = useState(false)
  const [homeSearch, setHomeSearch] = useState('')
  const [awaySearch, setAwaySearch] = useState('')
  const [highlightsUrl, setHighlightsUrl] = useState(null)
  const [form, setForm] = useState({
    homeTeam: '', awayTeam: '', homeFlag: '', awayFlag: '', date: '', time: '', league: '', status: 'upcoming',
    stadium: '', matchday: 'Matchday 1', homeScore: '', awayScore: '', highlightsUrl: '',
  })

  useEffect(() => { fetchMatches() }, [])

  const fetchMatches = async () => {
    try { const res = await fetch(getApiUrl('/api/schedule')); const data = await res.json(); setMatches(data) } catch { /* */ }
  }

  const resetForm = () => {
    setForm({
      homeTeam: '', awayTeam: '', homeFlag: '', awayFlag: '', date: '', time: '', league: '', status: 'upcoming',
      stadium: '', matchday: 'Matchday 1', homeScore: '', awayScore: '', highlightsUrl: '',
    })
    setEditingId(null); setShowForm(false); setHomeFlagOpen(false); setAwayFlagOpen(false)
    setHomeSearch(''); setAwaySearch('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      homeScore: form.status === 'finished' && form.homeScore !== '' ? Number(form.homeScore) : null,
      awayScore: form.status === 'finished' && form.awayScore !== '' ? Number(form.awayScore) : null,
    }
    try {
      if (editingId) { await authFetch(`/api/schedule/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) }) }
      else { await authFetch('/api/schedule', { method: 'POST', body: JSON.stringify(payload) }) }
      resetForm(); fetchMatches()
    } catch (err) { alert('Error: ' + err.message) }
  }

  const handleEdit = (match) => {
    setForm({
      homeTeam: match.homeTeam, awayTeam: match.awayTeam,
      homeFlag: match.homeFlag || '', awayFlag: match.awayFlag || '',
      date: match.date, time: match.time, league: match.league || '', status: match.status || 'upcoming',
      stadium: match.stadium || '', matchday: match.matchday || 'Matchday 1',
      homeScore: match.homeScore != null ? match.homeScore : '',
      awayScore: match.awayScore != null ? match.awayScore : '',
      highlightsUrl: match.highlightsUrl || '',
    })
    setEditingId(match.id); setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this match?')) return
    try { await authFetch(`/api/schedule/${id}`, { method: 'DELETE' }); fetchMatches() } catch { /* */ }
  }

  const updateStatus = async (id, status) => {
    try { await authFetch(`/api/schedule/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }); fetchMatches() } catch { /* */ }
  }

  const formatDate = (d) => {
    const [y, mo, day] = d.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[Number(mo) - 1]} ${Number(day)}, ${y}`
  }

  const FlagImg = ({ code, size = 24 }) => {
    if (!code) return null
    return <img src={FLAG_URL(code)} alt="" width={size} height={Math.round(size * 0.75)} className="inline-block rounded-sm" style={{ objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} />
  }

  const FlagPicker = ({ label, value, onChange, open, setOpen, search, setSearch }) => {
    const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    return (
      <div className="relative">
        <label className="text-gray-400 text-xs mb-1 block">{label}</label>
        <button type="button" onClick={() => setOpen(!open)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm text-left flex items-center gap-2 focus:outline-none focus:border-green-500 cursor-pointer">
          {value ? <><FlagImg code={value} size={20} /><span>{COUNTRIES.find(c => c.code === value)?.name || value}</span></> : <span className="text-gray-500">Select country...</span>}
          <svg className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
            <div className="p-2 border-b border-gray-700">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search country..."
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-green-500" autoFocus />
            </div>
            <div className="max-h-48 overflow-y-auto">
              <button type="button" onClick={() => { onChange(''); setOpen(false); setSearch('') }}
                className="w-full text-left px-3 py-2 text-gray-400 text-sm hover:bg-gray-800 cursor-pointer">
                No flag
              </button>
              {filtered.map((c) => (
                <button key={c.code} type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setSearch('') }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-800 cursor-pointer ${value === c.code ? 'bg-green-900/30 text-green-400' : 'text-white'}`}>
                  <FlagImg code={c.code} size={20} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Match Schedule
        </h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
          {showForm ? 'Cancel' : '+ Add Match'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Home Team *</label>
              <input type="text" required value={form.homeTeam} onChange={(e) => setForm({ ...form, homeTeam: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="e.g. Mexico" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Away Team *</label>
              <input type="text" required value={form.awayTeam} onChange={(e) => setForm({ ...form, awayTeam: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="e.g. South Africa" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FlagPicker label="Home Flag" value={form.homeFlag} onChange={(v) => setForm({ ...form, homeFlag: v })} open={homeFlagOpen} setOpen={setHomeFlagOpen} search={homeSearch} setSearch={setHomeSearch} />
            <FlagPicker label="Away Flag" value={form.awayFlag} onChange={(v) => setForm({ ...form, awayFlag: v })} open={awayFlagOpen} setOpen={setAwayFlagOpen} search={awaySearch} setSearch={setAwaySearch} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Date *</label>
              <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Time (Bangladesh) *</label>
              <input type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">League</label>
              <input type="text" value={form.league} onChange={(e) => setForm({ ...form, league: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="e.g. World Cup 2026 - Group A" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Stadium</label>
              <input type="text" value={form.stadium} onChange={(e) => setForm({ ...form, stadium: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="e.g. Estadio Azteca" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Matchday</label>
              <input type="text" value={form.matchday} onChange={(e) => setForm({ ...form, matchday: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="e.g. Matchday 1" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500">
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="finished">Finished</option>
              </select>
            </div>
          </div>
          {form.status === 'finished' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Home Score</label>
                  <input type="number" min="0" value={form.homeScore} onChange={(e) => setForm({ ...form, homeScore: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                    placeholder="0" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Away Score</label>
                  <input type="number" min="0" value={form.awayScore} onChange={(e) => setForm({ ...form, awayScore: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                    placeholder="0" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Highlights URL (optional)</label>
                <input type="url" value={form.highlightsUrl} onChange={(e) => setForm({ ...form, highlightsUrl: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                  placeholder="https://youtube.com/watch?v=..." />
                <p className="text-gray-600 text-xs mt-1">Paste a YouTube or video URL for match highlights</p>
              </div>
            </>
          )}
          <button type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            {editingId ? 'Update Match' : 'Add Match'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {matches.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No matches scheduled. Click "+ Add Match" to create one.</p>
        )}
        {matches.map((match) => {
          const hasScore = match.homeScore != null && match.awayScore != null
          return (
            <div key={match.id} className={`bg-gray-800 rounded-xl px-4 py-3 border ${match.status === 'live' ? 'border-red-800' : 'border-gray-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-400 text-xs truncate max-w-[160px]">{match.league || 'Football'}</span>
                  {match.status === 'live' && <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">LIVE</span>}
                  {match.status === 'finished' && <span className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded">FT</span>}
                  {match.status === 'upcoming' && <span className="bg-blue-600/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/30">Upcoming</span>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {match.highlightsUrl && (
                    <button onClick={() => setHighlightsUrl(match.highlightsUrl)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-[10px] px-2 py-1 rounded cursor-pointer flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      Highlights
                    </button>
                  )}
                  {match.status === 'upcoming' && (
                    <button onClick={() => updateStatus(match.id, 'live')} className="bg-red-600 hover:bg-red-700 text-white text-[10px] px-2 py-1 rounded cursor-pointer">Start</button>
                  )}
                  {match.status === 'live' && (
                    <button onClick={() => updateStatus(match.id, 'finished')} className="bg-gray-600 hover:bg-gray-700 text-white text-[10px] px-2 py-1 rounded cursor-pointer">End</button>
                  )}
                  <button onClick={() => handleEdit(match)} className="text-gray-400 hover:text-white text-[10px] px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">Edit</button>
                  <button onClick={() => handleDelete(match.id)} className="text-red-400 hover:text-red-300 text-[10px] px-2 py-1 rounded hover:bg-red-900/30 cursor-pointer">Delete</button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span>{formatDate(match.date)} at {to12Hour(match.time)}</span>
                {match.stadium && <><span className="text-gray-600">|</span><span>{match.stadium}</span></>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <FlagImg code={match.homeFlag} size={22} />{match.homeTeam}
                </span>
                {hasScore ? (
                  <span className="text-orange-400 font-black px-2">{match.homeScore} - {match.awayScore}</span>
                ) : (
                  <span className="text-gray-500 text-sm font-bold">VS</span>
                )}
                <span className="text-white font-semibold flex items-center gap-1.5">
                  {match.awayTeam}<FlagImg code={match.awayFlag} size={22} />
                </span>
              </div>
            </div>
          )
        })}
      </div>
      {highlightsUrl && <HighlightsModal url={highlightsUrl} onClose={() => setHighlightsUrl(null)} />}
    </div>
  )
}
