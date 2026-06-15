import { useState, useEffect } from 'react'
import { authFetch } from '../utils/api'
import { getApiUrl } from '../config'

const FLAG_URL = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`
const FlagImg = ({ code, size = 24 }) => {
  if (!code) return null
  return <img src={FLAG_URL(code)} alt="" width={size} height={Math.round(size * 0.75)} className="inline-block rounded-sm" style={{ objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} />
}

const COUNTRIES = [
  { code: 'gb-eng', name: 'England' }, { code: 'es', name: 'Spain' }, { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' }, { code: 'br', name: 'Brazil' }, { code: 'ar', name: 'Argentina' },
  { code: 'us', name: 'USA' }, { code: 'mx', name: 'Mexico' }, { code: 'ca', name: 'Canada' },
  { code: 'jp', name: 'Japan' }, { code: 'kr', name: 'South Korea' }, { code: 'au', name: 'Australia' },
  { code: 'pt', name: 'Portugal' }, { code: 'nl', name: 'Netherlands' }, { code: 'be', name: 'Belgium' },
  { code: 'it', name: 'Italy' }, { code: 'hr', name: 'Croatia' }, { code: 'ma', name: 'Morocco' },
  { code: 'sn', name: 'Senegal' }, { code: 'gh', name: 'Ghana' }, { code: 'ng', name: 'Nigeria' },
  { code: 'cm', name: 'Cameroon' }, { code: 'ec', name: 'Ecuador' }, { code: 'co', name: 'Colombia' },
  { code: 'uy', name: 'Uruguay' }, { code: 'cl', name: 'Chile' }, { code: 'sa', name: 'Saudi Arabia' },
  { code: 'ir', name: 'Iran' }, { code: 'au', name: 'Australia' }, { code: 'qa', name: 'Qatar' },
  { code: 'cz', name: 'Czechia' }, { code: 'se', name: 'Sweden' }, { code: 'pl', name: 'Poland' },
  { code: 'ch', name: 'Switzerland' }, { code: 'at', name: 'Austria' }, { code: 'rs', name: 'Serbia' },
  { code: 'dk', name: 'Denmark' }, { code: 'no', name: 'Norway' }, { code: 'tr', name: 'Turkey' },
  { code: 'ba', name: 'Bosnia and Herzegovina' }, { code: 'ht', name: 'Haiti' },
  { code: 'ci', name: "Cote d'Ivoire" }, { code: 'nz', name: 'New Zealand' },
  { code: 'iq', name: 'Iraq' }, { code: 'uz', name: 'Uzbekistan' }, { code: 'dz', name: 'Algeria' },
  { code: 'pa', name: 'Panama' }, { code: 'cd', name: 'Congo DR' }, { code: 'jo', name: 'Jordan' },
  { code: 'za', name: 'South Africa' }, { code: 'cv', name: 'Cabo Verde' }, { code: 'cw', name: 'Curacao' },
]

export default function PlayerManager() {
  const [players, setPlayers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [form, setForm] = useState({ name: '', country: '', goals: 0, assists: 0, team: '' })

  useEffect(() => { fetchPlayers() }, [])

  const fetchPlayers = async () => {
    try { const res = await fetch(getApiUrl('/api/players')); setPlayers(await res.json()) } catch { /* */ }
  }

  const resetForm = () => {
    setForm({ name: '', country: '', goals: 0, assists: 0, team: '' })
    setEditingId(null); setShowForm(false); setCountryOpen(false); setCountrySearch('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, goals: Number(form.goals), assists: Number(form.assists) }
    try {
      if (editingId) {
        await authFetch(`/api/players/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await authFetch('/api/players', { method: 'POST', body: JSON.stringify(payload) })
      }
      resetForm(); fetchPlayers()
    } catch (err) { alert('Error: ' + err.message) }
  }

  const handleEdit = (player) => {
    setForm({ name: player.name, country: player.country || '', goals: player.goals, assists: player.assists, team: player.team || '' })
    setEditingId(player.id); setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this player?')) return
    try { await authFetch(`/api/players/${id}`, { method: 'DELETE' }); fetchPlayers() } catch { /* */ }
  }

  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Player Scores
        </h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
          {showForm ? 'Cancel' : '+ Add Player'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Player Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="e.g. Lionel Messi" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Team</label>
              <input type="text" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="e.g. Argentina" />
            </div>
          </div>
          <div className="relative">
            <label className="text-gray-400 text-xs mb-1 block">Country</label>
            <button type="button" onClick={() => setCountryOpen(!countryOpen)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm text-left flex items-center gap-2 focus:outline-none focus:border-green-500 cursor-pointer">
              {form.country ? <><FlagImg code={form.country} size={20} /><span>{COUNTRIES.find(c => c.code === form.country)?.name || form.country}</span></> : <span className="text-gray-500">Select country...</span>}
              <svg className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${countryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {countryOpen && (
              <div className="absolute z-50 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                <div className="p-2 border-b border-gray-700">
                  <input type="text" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} placeholder="Search..."
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-green-500" autoFocus />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <button type="button" onClick={() => { setForm({ ...form, country: '' }); setCountryOpen(false); setCountrySearch('') }}
                    className="w-full text-left px-3 py-2 text-gray-400 text-sm hover:bg-gray-800 cursor-pointer">No flag</button>
                  {filtered.map((c) => (
                    <button key={c.code} type="button"
                      onClick={() => { setForm({ ...form, country: c.code }); setCountryOpen(false); setCountrySearch('') }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-800 cursor-pointer ${form.country === c.code ? 'bg-green-900/30 text-green-400' : 'text-white'}`}>
                      <FlagImg code={c.code} size={20} /><span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Goals</label>
              <input type="number" min="0" value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Assists</label>
              <input type="number" min="0" value={form.assists} onChange={(e) => setForm({ ...form, assists: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
          </div>
          <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            {editingId ? 'Update Player' : 'Add Player'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {players.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No players added yet. Click "+ Add Player" to create one.</p>
        )}
        {players.map((player, i) => (
          <div key={player.id} className="bg-gray-800 rounded-xl px-4 py-3 border border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-500/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700 text-gray-400'
              }`}>{i + 1}</span>
              <FlagImg code={player.country} size={28} />
              <div>
                <span className="text-white font-semibold text-sm">{player.name}</span>
                <span className="text-gray-500 text-xs block">{player.team}</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-orange-400 font-black text-lg">{player.goals}</span>
                <span className="text-gray-600 text-xs block">Goals</span>
              </div>
              <div className="text-center">
                <span className="text-blue-400 font-bold">{player.assists}</span>
                <span className="text-gray-600 text-xs block">Assists</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(player)} className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">Edit</button>
                <button onClick={() => handleDelete(player.id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900/30 cursor-pointer">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
