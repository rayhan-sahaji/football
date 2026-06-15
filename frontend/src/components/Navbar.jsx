import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/schedule', label: 'Schedule', badge: 'WC' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <img src="/wc2026.png" alt="FIFA World Cup 2026" className="h-9 w-auto drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
            </div>
            <div className="w-px h-7 bg-white/15"></div>
            <img src="/br2026.png" alt="BR 2026" className="h-7 w-auto opacity-90" />
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  isActive(link.path)
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="text-[10px] bg-green-500/80 text-white px-1.5 py-0.5 rounded-md font-bold leading-none">
                    {link.badge}
                  </span>
                )}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-green-400 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/watch"
            className="group relative shrink-0 bg-green-500 hover:bg-green-400 text-gray-900 font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-400/40 hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Watch Live
          </Link>
        </div>
      </div>
    </nav>
  )
}
