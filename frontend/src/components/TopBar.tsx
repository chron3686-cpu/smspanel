import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Moon, Sun, Bell, Search, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  Inbox, 
  History, 
  Settings,
  MessageSquare
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Send SMS', href: '/send', icon: Send },
  { name: 'Incoming', href: '/incoming', icon: Inbox },
  { name: 'History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function TopBar() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-dark-200 dark:border-dark-700 px-4 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-lg text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search messages, contacts..."
              className="w-full pl-10 pr-4 py-2 bg-dark-100 dark:bg-dark-800 border-0 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full" />
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.username}</span>
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-dark-200 dark:border-dark-700 z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-dark-100 dark:border-dark-700">
                      <p className="text-sm font-medium text-dark-900 dark:text-white">{user?.username}</p>
                      <p className="text-xs text-dark-500">{user?.role}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-dark-900 z-50 lg:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-200 dark:border-dark-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold gradient-text">NovaText</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-dark-600 dark:text-dark-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-200 dark:border-dark-700">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
