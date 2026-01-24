import { useLocation, useNavigate } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Find Jobs', path: '/jobs', icon: '💼' },
    { label: 'Applied Jobs', path: '/tracker', icon: '📋' },
    { label: 'Social', path: '/social', icon: '👥' }
  ]

  return (
    <header className="bg-gradient-to-r from-brand to-teal border-b-4 border-accent sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer hover:scale-105 transition"
          >
            <div className="text-2xl font-bold text-white">✨ JobFit</div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold text-sm ${
                  isActive(item.path)
                    ? 'bg-white text-brand shadow-lg scale-105'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
