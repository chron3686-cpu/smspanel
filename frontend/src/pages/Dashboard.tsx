import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  Users, 
  Inbox,
  TrendingUp,
  ArrowUpRight,
  MessageSquare
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { authFetch } from '../context/AuthContext'

interface Stats {
  totalSent: number
  todaySent: number
  delivered: number
  failed: number
  totalIncoming: number
  unreadIncoming: number
  contactsCount: number
  deliveryRate: number
  last7Days: Array<{
    date: string
    day: string
    total: number
    delivered: number
    failed: number
  }>
  recentActivity: Array<{
    id: string
    destination: string
    message: string
    status: string
    created_at: string
  }>
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await authFetch('/api/messages/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Messages Today',
      value: stats?.todaySent || 0,
      icon: Send,
      color: 'from-purple-600 to-indigo-600',
      change: '+12%'
    },
    {
      name: 'Delivered',
      value: stats?.delivered || 0,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600',
      change: `${stats?.deliveryRate || 0}%`
    },
    {
      name: 'Failed',
      value: stats?.failed || 0,
      icon: XCircle,
      color: 'from-red-500 to-rose-600',
      change: stats?.failed ? '-' : '0'
    },
    {
      name: 'Total Contacts',
      value: stats?.contactsCount || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      change: '+5'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-4 w-24 mb-4 rounded" />
              <div className="skeleton h-8 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-white">
            Welcome back! 👋
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            Here's what's happening with your messages
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <motion.div
            key={stat.name}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="card p-6 relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">{stat.name}</p>
                <p className="text-3xl font-bold text-dark-900 dark:text-white mt-2">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Messages Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.last7Days || []}>
                <defs>
                  <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-dark-200 dark:stroke-dark-700" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="delivered" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorDelivered)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Incoming Messages */}
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">
              Incoming
            </h3>
            <Inbox className="w-5 h-5 text-dark-400" />
          </div>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-dark-900 dark:text-white">
              {stats?.totalIncoming || 0}
            </p>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
              Total Received
            </p>
            {(stats?.unreadIncoming || 0) > 0 && (
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                {stats?.unreadIncoming} unread
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="card">
        <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">
            Recent Activity
          </h3>
          <a href="/history" className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
            View all <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
        <div className="divide-y divide-dark-100 dark:divide-dark-700">
          {stats?.recentActivity?.length ? (
            stats.recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.status === 'sent' || activity.status === 'delivered'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {activity.status === 'sent' || activity.status === 'delivered' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 dark:text-white">
                      {activity.destination}
                    </p>
                    <p className="text-sm text-dark-500 dark:text-dark-400 truncate">
                      {activity.message}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      activity.status === 'sent' || activity.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {activity.status}
                    </span>
                    <p className="text-xs text-dark-400 mt-1">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center text-dark-500 dark:text-dark-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

