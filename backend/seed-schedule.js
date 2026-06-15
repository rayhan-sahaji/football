const http = require('http')

const ADMIN_PASSWORD = 'RayhAn22448np2'

// ET times converted to Bangladesh time (ET + 10h)
const matches = [
  // ─── Group A ───
  { homeTeam: 'Mexico', homeFlag: 'mx', awayTeam: 'South Africa', awayFlag: 'za', date: '2026-06-11', time: '17:00', league: 'World Cup 2026 - Group A', stadium: 'Mexico City Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'South Korea', homeFlag: 'kr', awayTeam: 'Czechia', awayFlag: 'cz', date: '2026-06-12', time: '02:00', league: 'World Cup 2026 - Group A', stadium: 'Guadalajara Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Czechia', homeFlag: 'cz', awayTeam: 'South Africa', awayFlag: 'za', date: '2026-06-19', time: '02:00', league: 'World Cup 2026 - Group A', stadium: 'Atlanta Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Mexico', homeFlag: 'mx', awayTeam: 'South Korea', awayFlag: 'kr', date: '2026-06-19', time: '23:00', league: 'World Cup 2026 - Group A', stadium: 'Guadalajara Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Czechia', homeFlag: 'cz', awayTeam: 'Mexico', awayFlag: 'mx', date: '2026-06-25', time: '09:00', league: 'World Cup 2026 - Group A', stadium: 'Mexico City Stadium', matchday: 'Matchday 3', status: 'upcoming' },
  { homeTeam: 'South Africa', homeFlag: 'za', awayTeam: 'South Korea', awayFlag: 'kr', date: '2026-06-25', time: '09:00', league: 'World Cup 2026 - Group A', stadium: 'Guadalajara Stadium', matchday: 'Matchday 3', status: 'upcoming' },

  // ─── Group B ───
  { homeTeam: 'Canada', homeFlag: 'ca', awayTeam: 'Bosnia and Herzegovina', awayFlag: 'ba', date: '2026-06-12', time: '17:00', league: 'World Cup 2026 - Group B', stadium: 'Toronto Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Qatar', homeFlag: 'qa', awayTeam: 'Switzerland', awayFlag: 'ch', date: '2026-06-14', time: '05:00', league: 'World Cup 2026 - Group B', stadium: 'San Francisco Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Switzerland', homeFlag: 'ch', awayTeam: 'Bosnia and Herzegovina', awayFlag: 'ba', date: '2026-06-19', time: '05:00', league: 'World Cup 2026 - Group B', stadium: 'San Francisco Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Canada', homeFlag: 'ca', awayTeam: 'Qatar', awayFlag: 'qa', date: '2026-06-20', time: '05:00', league: 'World Cup 2026 - Group B', stadium: 'Vancouver Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Switzerland', homeFlag: 'ch', awayTeam: 'Canada', awayFlag: 'ca', date: '2026-06-25', time: '05:00', league: 'World Cup 2026 - Group B', stadium: 'Vancouver Stadium', matchday: 'Matchday 3', status: 'upcoming' },
  { homeTeam: 'Bosnia and Herzegovina', homeFlag: 'ba', awayTeam: 'Qatar', awayFlag: 'qa', date: '2026-06-25', time: '05:00', league: 'World Cup 2026 - Group B', stadium: 'Seattle Stadium', matchday: 'Matchday 3', status: 'upcoming' },

  // ─── Group C ───
  { homeTeam: 'Brazil', homeFlag: 'br', awayTeam: 'Morocco', awayFlag: 'ma', date: '2026-06-14', time: '02:00', league: 'World Cup 2026 - Group C', stadium: 'New York Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Haiti', homeFlag: 'ht', awayTeam: 'Scotland', awayFlag: 'gb-sct', date: '2026-06-14', time: '06:00', league: 'World Cup 2026 - Group C', stadium: 'Boston Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Brazil', homeFlag: 'br', awayTeam: 'Haiti', awayFlag: 'ht', date: '2026-06-20', time: '05:00', league: 'World Cup 2026 - Group C', stadium: 'Philadelphia Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Scotland', homeFlag: 'gb-sct', awayTeam: 'Morocco', awayFlag: 'ma', date: '2026-06-20', time: '02:00', league: 'World Cup 2026 - Group C', stadium: 'Boston Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Scotland', homeFlag: 'gb-sct', awayTeam: 'Brazil', awayFlag: 'br', date: '2026-06-25', time: '02:00', league: 'World Cup 2026 - Group C', stadium: 'Philadelphia Stadium', matchday: 'Matchday 3', status: 'upcoming' },
  { homeTeam: 'Morocco', homeFlag: 'ma', awayTeam: 'Haiti', awayFlag: 'ht', date: '2026-06-25', time: '02:00', league: 'World Cup 2026 - Group C', stadium: 'Atlanta Stadium', matchday: 'Matchday 3', status: 'upcoming' },

  // ─── Group D ───
  { homeTeam: 'USA', homeFlag: 'us', awayTeam: 'Paraguay', awayFlag: 'py', date: '2026-06-13', time: '06:00', league: 'World Cup 2026 - Group D', stadium: 'Los Angeles Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Australia', homeFlag: 'au', awayTeam: 'Turkiye', awayFlag: 'tr', date: '2026-06-14', time: '01:00', league: 'World Cup 2026 - Group D', stadium: 'Vancouver Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Turkiye', homeFlag: 'tr', awayTeam: 'Paraguay', awayFlag: 'py', date: '2026-06-20', time: '02:00', league: 'World Cup 2026 - Group D', stadium: 'San Francisco Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'USA', homeFlag: 'us', awayTeam: 'Australia', awayFlag: 'au', date: '2026-06-21', time: '02:00', league: 'World Cup 2026 - Group D', stadium: 'Seattle Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'USA', homeFlag: 'us', awayTeam: 'Turkiye', awayFlag: 'tr', date: '2026-06-25', time: '10:00', league: 'World Cup 2026 - Group D', stadium: 'Dallas Stadium', matchday: 'Matchday 3', status: 'upcoming' },
  { homeTeam: 'Paraguay', homeFlag: 'py', awayTeam: 'Australia', awayFlag: 'au', date: '2026-06-25', time: '10:00', league: 'World Cup 2026 - Group D', stadium: 'Houston Stadium', matchday: 'Matchday 3', status: 'upcoming' },

  // ─── Group E ───
  { homeTeam: 'Germany', homeFlag: 'de', awayTeam: 'Curacao', awayFlag: 'cw', date: '2026-06-15', time: '05:00', league: 'World Cup 2026 - Group E', stadium: 'Houston Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Ecuador', homeFlag: 'ec', awayTeam: "Cote d'Ivoire", awayFlag: 'ci', date: '2026-06-15', time: '02:00', league: 'World Cup 2026 - Group E', stadium: 'Philadelphia Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Germany', homeFlag: 'de', awayTeam: 'Ecuador', awayFlag: 'ec', date: '2026-06-21', time: '05:00', league: 'World Cup 2026 - Group E', stadium: 'Houston Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: "Cote d'Ivoire", homeFlag: 'ci', awayTeam: 'Curacao', awayFlag: 'cw', date: '2026-06-21', time: '02:00', league: 'World Cup 2026 - Group E', stadium: 'Houston Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Ecuador', homeFlag: 'ec', awayTeam: 'Curacao', awayFlag: 'cw', date: '2026-06-26', time: '02:00', league: 'World Cup 2026 - Group E', stadium: 'Houston Stadium', matchday: 'Matchday 3', status: 'upcoming' },
  { homeTeam: "Cote d'Ivoire", homeFlag: 'ci', awayTeam: 'Germany', awayFlag: 'de', date: '2026-06-26', time: '02:00', league: 'World Cup 2026 - Group E', stadium: 'Dallas Stadium', matchday: 'Matchday 3', status: 'upcoming' },

  // ─── Group F ───
  { homeTeam: 'Netherlands', homeFlag: 'nl', awayTeam: 'Japan', awayFlag: 'jp', date: '2026-06-15', time: '08:00', league: 'World Cup 2026 - Group F', stadium: 'Dallas Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Sweden', homeFlag: 'se', awayTeam: 'Tunisia', awayFlag: 'tn', date: '2026-06-16', time: '06:00', league: 'World Cup 2026 - Group F', stadium: 'Monterrey Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Netherlands', homeFlag: 'nl', awayTeam: 'Sweden', awayFlag: 'se', date: '2026-06-21', time: '08:00', league: 'World Cup 2026 - Group F', stadium: 'Dallas Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Japan', homeFlag: 'jp', awayTeam: 'Tunisia', awayFlag: 'tn', date: '2026-06-22', time: '02:00', league: 'World Cup 2026 - Group F', stadium: 'Monterrey Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Netherlands', homeFlag: 'nl', awayTeam: 'Tunisia', awayFlag: 'tn', date: '2026-06-26', time: '08:00', league: 'World Cup 2026 - Group F', stadium: 'Dallas Stadium', matchday: 'Matchday 3', status: 'upcoming' },
  { homeTeam: 'Japan', homeFlag: 'jp', awayTeam: 'Sweden', awayFlag: 'se', date: '2026-06-26', time: '08:00', league: 'World Cup 2026 - Group F', stadium: 'Monterrey Stadium', matchday: 'Matchday 3', status: 'upcoming' },

  // ─── Group G ───
  { homeTeam: 'IR Iran', homeFlag: 'ir', awayTeam: 'New Zealand', awayFlag: 'nz', date: '2026-06-16', time: '03:00', league: 'World Cup 2026 - Group G', stadium: 'Los Angeles Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Belgium', homeFlag: 'be', awayTeam: 'Egypt', awayFlag: 'eg', date: '2026-06-16', time: '06:00', league: 'World Cup 2026 - Group G', stadium: 'Seattle Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Belgium', homeFlag: 'be', awayTeam: 'IR Iran', awayFlag: 'ir', date: '2026-06-22', time: '05:00', league: 'World Cup 2026 - Group G', stadium: 'Seattle Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Egypt', homeFlag: 'eg', awayTeam: 'New Zealand', awayFlag: 'nz', date: '2026-06-22', time: '02:00', league: 'World Cup 2026 - Group G', stadium: 'Los Angeles Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Belgium', homeFlag: 'be', awayTeam: 'New Zealand', awayFlag: 'nz', date: '2026-06-26', time: '05:00', league: 'World Cup 2026 - Group G', stadium: 'Vancouver Stadium', matchday: 'Matchday 3', status: 'upcoming' },
  { homeTeam: 'Egypt', homeFlag: 'eg', awayTeam: 'IR Iran', awayFlag: 'ir', date: '2026-06-26', time: '05:00', league: 'World Cup 2026 - Group G', stadium: 'Los Angeles Stadium', matchday: 'Matchday 3', status: 'upcoming' },

  // ─── Group H ───
  { homeTeam: 'Saudi Arabia', homeFlag: 'sa', awayTeam: 'Uruguay', awayFlag: 'uy', date: '2026-06-16', time: '09:00', league: 'World Cup 2026 - Group H', stadium: 'Miami Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Spain', homeFlag: 'es', awayTeam: 'Cabo Verde', awayFlag: 'cv', date: '2026-06-17', time: '02:00', league: 'World Cup 2026 - Group H', stadium: 'Atlanta Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Spain', homeFlag: 'es', awayTeam: 'Saudi Arabia', awayFlag: 'sa', date: '2026-06-22', time: '08:00', league: 'World Cup 2026 - Group H', stadium: 'Miami Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Uruguay', homeFlag: 'uy', awayTeam: 'Cabo Verde', awayFlag: 'cv', date: '2026-06-23', time: '02:00', league: 'World Cup 2026 - Group H', stadium: 'Atlanta Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Spain', homeFlag: 'es', awayTeam: 'Uruguay', awayFlag: 'uy', date: '2026-06-27', time: '02:00', league: 'World Cup 2026 - Group H', stadium: 'Atlanta Stadium', matchday: 'Matchday 3', status: 'upcoming' },
  { homeTeam: 'Cabo Verde', homeFlag: 'cv', awayTeam: 'Saudi Arabia', awayFlag: 'sa', date: '2026-06-27', time: '02:00', league: 'World Cup 2026 - Group H', stadium: 'Miami Stadium', matchday: 'Matchday 3', status: 'upcoming' },

  // ─── Group I ───
  { homeTeam: 'France', homeFlag: 'fr', awayTeam: 'Senegal', awayFlag: 'sn', date: '2026-06-17', time: '05:00', league: 'World Cup 2026 - Group I', stadium: 'New York Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Iraq', homeFlag: 'iq', awayTeam: 'Norway', awayFlag: 'no', date: '2026-06-17', time: '08:00', league: 'World Cup 2026 - Group I', stadium: 'Boston Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'France', homeFlag: 'fr', awayTeam: 'Iraq', awayFlag: 'iq', date: '2026-06-23', time: '05:00', league: 'World Cup 2026 - Group I', stadium: 'Boston Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Senegal', homeFlag: 'sn', awayTeam: 'Norway', awayFlag: 'no', date: '2026-06-23', time: '04:00', league: 'World Cup 2026 - Group I', stadium: 'New York Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'France', homeFlag: 'fr', awayTeam: 'Norway', awayFlag: 'no', date: '2026-06-27', time: '08:00', league: 'World Cup 2026 - Group I', stadium: 'New York Stadium', matchday: 'Matchday 3', status: 'upcoming' },
  { homeTeam: 'Senegal', homeFlag: 'sn', awayTeam: 'Iraq', awayFlag: 'iq', date: '2026-06-27', time: '08:00', league: 'World Cup 2026 - Group I', stadium: 'Boston Stadium', matchday: 'Matchday 3', status: 'upcoming' },

  // ─── Group J ───
  { homeTeam: 'Argentina', homeFlag: 'ar', awayTeam: 'Algeria', awayFlag: 'dz', date: '2026-06-17', time: '05:00', league: 'World Cup 2026 - Group J', stadium: 'Kansas City Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Austria', homeFlag: 'at', awayTeam: 'Jordan', awayFlag: 'jo', date: '2026-06-18', time: '02:00', league: 'World Cup 2026 - Group J', stadium: 'San Francisco Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Argentina', homeFlag: 'ar', awayTeam: 'Austria', awayFlag: 'at', date: '2026-06-23', time: '08:00', league: 'World Cup 2026 - Group J', stadium: 'Kansas City Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Algeria', homeFlag: 'dz', awayTeam: 'Jordan', awayFlag: 'jo', date: '2026-06-24', time: '02:00', league: 'World Cup 2026 - Group J', stadium: 'San Francisco Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Argentina', homeFlag: 'ar', awayTeam: 'Jordan', awayFlag: 'jo', date: '2026-06-27', time: '05:00', league: 'World Cup 2026 - Group J', stadium: 'San Francisco Stadium', matchday: 'Matchday 3', status: 'upcoming' },
  { homeTeam: 'Austria', homeFlag: 'at', awayTeam: 'Algeria', awayFlag: 'dz', date: '2026-06-27', time: '05:00', league: 'World Cup 2026 - Group J', stadium: 'Kansas City Stadium', matchday: 'Matchday 3', status: 'upcoming' },

  // ─── Group K ───
  { homeTeam: 'Uzbekistan', homeFlag: 'uz', awayTeam: 'Colombia', awayFlag: 'co', date: '2026-06-18', time: '06:00', league: 'World Cup 2026 - Group K', stadium: 'Mexico City Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'England', homeFlag: 'gb-eng', awayTeam: 'Cameroon', awayFlag: 'cm', date: '2026-06-18', time: '09:00', league: 'World Cup 2026 - Group K', stadium: 'Toronto Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'England', homeFlag: 'gb-eng', awayTeam: 'Uzbekistan', awayFlag: 'uz', date: '2026-06-24', time: '05:00', league: 'World Cup 2026 - Group K', stadium: 'Mexico City Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Colombia', homeFlag: 'co', awayTeam: 'Cameroon', awayFlag: 'cm', date: '2026-06-24', time: '02:00', league: 'World Cup 2026 - Group K', stadium: 'Toronto Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'England', homeFlag: 'gb-eng', awayTeam: 'Colombia', awayFlag: 'co', date: '2026-06-28', time: '02:00', league: 'World Cup 2026 - Group K', stadium: 'Mexico City Stadium', matchday: 'Matchday 3', status: 'upcoming' },
  { homeTeam: 'Cameroon', homeFlag: 'cm', awayTeam: 'Uzbekistan', awayFlag: 'uz', date: '2026-06-28', time: '02:00', league: 'World Cup 2026 - Group K', stadium: 'Toronto Stadium', matchday: 'Matchday 3', status: 'upcoming' },

  // ─── Group L ───
  { homeTeam: 'Portugal', homeFlag: 'pt', awayTeam: 'Peru', awayFlag: 'pe', date: '2026-06-18', time: '09:00', league: 'World Cup 2026 - Group L', stadium: 'Miami Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Italy', homeFlag: 'it', awayTeam: 'Poland', awayFlag: 'pl', date: '2026-06-19', time: '02:00', league: 'World Cup 2026 - Group L', stadium: 'New York Stadium', matchday: 'Matchday 1', status: 'upcoming' },
  { homeTeam: 'Italy', homeFlag: 'it', awayTeam: 'Peru', awayFlag: 'pe', date: '2026-06-24', time: '08:00', league: 'World Cup 2026 - Group L', stadium: 'Miami Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Poland', homeFlag: 'pl', awayTeam: 'Panama', awayFlag: 'pa', date: '2026-06-25', time: '06:00', league: 'World Cup 2026 - Group L', stadium: 'Toronto Stadium', matchday: 'Matchday 2', status: 'upcoming' },
  { homeTeam: 'Portugal', homeFlag: 'pt', awayTeam: 'Italy', awayFlag: 'it', date: '2026-06-28', time: '09:00', league: 'World Cup 2026 - Group L', stadium: 'New York Stadium', matchday: 'Matchday 3', status: 'upcoming' },
  { homeTeam: 'Panama', homeFlag: 'pa', awayTeam: 'Peru', awayFlag: 'pe', date: '2026-06-28', time: '09:00', league: 'World Cup 2026 - Group L', stadium: 'Miami Stadium', matchday: 'Matchday 3', status: 'upcoming' },
]

async function getToken() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ password: ADMIN_PASSWORD })
    const req = http.request({ hostname: 'localhost', port: 3001, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } }, (res) => {
      let body = ''
      res.on('data', d => body += d)
      res.on('end', () => resolve(JSON.parse(body).token))
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function createMatch(token, match) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(match)
    const req = http.request({ hostname: 'localhost', port: 3001, path: '/api/schedule', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length, 'Authorization': `Bearer ${token}` } }, (res) => {
      let body = ''
      res.on('data', d => body += d)
      res.on('end', () => resolve(JSON.parse(body)))
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function main() {
  console.log('Fetching auth token...')
  const token = await getToken()
  console.log('Token OK')

  let created = 0
  for (const match of matches) {
    try {
      await createMatch(token, match)
      created++
      process.stdout.write(`\rCreating matches... ${created}/${matches.length}`)
    } catch (err) {
      console.error(`\nFailed: ${match.homeTeam} vs ${match.awayTeam}: ${err.message}`)
    }
  }
  console.log(`\nDone! Created ${created} matches`)
}

main()
