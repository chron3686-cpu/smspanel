import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History as HistoryIcon, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Calendar
} from 'lucide-react'
import { authFetch } from '../context/AuthContext'

interface Message {
  id: string
  remote_id: string | null
  source: string
  destination: string
  message: string
  status: string
  segments: number
  cost: number | null
  created_at: string
}

export default function History() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  
  const [filters, setFilters] = useState({
    status: '',
    destination: '',
    fromDate: '',
    toDate: ''
  })

  useEffect(() => {
    fetchMessages()
  }, [filters])

  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.destination) params.append('destination', filters.destination)
      if (filters.fromDate) params.append('fromDate', filters.fromDate)
      if (filters.toDate) params.append('toDate', filters.toDate)

      const res = await authFetch(`/api/messages/outgoing?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setMessages(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            {status}
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
            <XCircle className="w-3 h-3" />
            {status}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            {status}
          </span>
        )
    }
  }

  const clearFilters = () => {
    setFilters({ status: '', destination: '', fromDate: '', toDate: '' })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-white">
            Message History
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            View all sent messages and their status
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary ${showFilters ? 'bg-dark-200 dark:bg-dark-600' : ''}`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card overflow-hidden"
          >
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="input"
                >
                  <option value="">All</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Recipient
                </label>
                <input
                  type="text"
                  value={filters.destination}
                  onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                  placeholder="Phone number"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex items-end">
                <button onClick={clearFilters} className="btn-ghost w-full">
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-24 h-4 rounded" />
                <div className="skeleton w-32 h-4 rounded" />
                <div className="flex-1 skeleton h-4 rounded" />
                <div className="skeleton w-16 h-6 rounded-full" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center">
            <HistoryIcon className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
            <p className="text-dark-500 dark:text-dark-400">No messages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 dark:bg-dark-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">
                    Recipient
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase hidden md:table-cell">
                    Message
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                {messages.map((msg, index) => (
                  <motion.tr
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-dark-50 dark:hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-300">
                        <Calendar className="w-4 h-4 text-dark-400" />
                        {new Date(msg.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-dark-900 dark:text-white">
                      {msg.destination}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-dark-600 dark:text-dark-300 truncate max-w-xs">
                        {msg.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(msg.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedMessage(msg)}
                        className="btn-ghost p-2"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedMessage(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white dark:bg-dark-800 rounded-2xl shadow-2xl z-50"
            >
              <div className="flex items-center justify-between p-6 border-b border-dark-100 dark:border-dark-700">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white">
                  Message Details
                </h3>
                <button onClick={() => setSelectedMessage(null)} className="btn-ghost p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-dark-400 uppercase">From</label>
                    <p className="font-mono text-dark-900 dark:text-white">{selectedMessage.source}</p>
                  </div>
                  <div>
                    <label className="text-xs text-dark-400 uppercase">To</label>
                    <p className="font-mono text-dark-900 dark:text-white">{selectedMessage.destination}</p>
                  </div>
                  <div>
                    <label className="text-xs text-dark-400 uppercase">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
                  </div>
                  <div>
                    <label className="text-xs text-dark-400 uppercase">Segments</label>
                    <p className="text-dark-900 dark:text-white">{selectedMessage.segments}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-dark-400 uppercase">Sent At</label>
                  <p className="text-dark-900 dark:text-white">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-dark-400 uppercase mb-2 block">Message</label>
                  <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                    <p className="text-dark-900 dark:text-white whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
                {selectedMessage.remote_id && (
                  <div>
                    <label className="text-xs text-dark-400 uppercase">Remote ID</label>
                    <p className="font-mono text-xs text-dark-500">{selectedMessage.remote_id}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

