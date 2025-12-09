import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  Inbox, 
  History, 
  Settings,
  MessageSquare,
  Zap
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Send SMS', href: '/send', icon: Send },
  { name: 'Incoming', href: '/incoming', icon: Inbox },
  { name: 'History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-r border-dark-200 dark:border-dark-700 px-6 py-6">
        {/* Logo */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">NovaText</h1>
            <p className="text-xs text-dark-500 dark:text-dark-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Cloud Platform
            </p>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-2 mt-6">
          {navigation.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Bottom Info */}
        <div className="mt-auto">
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-600/10 to-indigo-600/10 dark:from-purple-600/20 dark:to-indigo-600/20 border border-purple-200 dark:border-purple-800/50">
            <p className="text-xs font-medium text-purple-700 dark:text-purple-300">NovaText Cloud</p>
            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Enterprise SMS Platform</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

