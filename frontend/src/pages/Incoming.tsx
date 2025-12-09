import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Inbox, 
  RefreshCw, 
  Mail, 
  MailOpen,
  Send,
  X,
  CheckCheck
} from 'lucide-react'
import { authFetch } from '../context/AuthContext'

interface IncomingMessage {
  id: string
  source: string
  destination: string
  message: string
  is_read: number
  received_at: string
}

export default function Incoming() {
  const [messages, setMessages] = useState<IncomingMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedMessage, setSelectedMessage] = useState<IncomingMessage | null>(null)

  useEffect(() => {
    fetchMessages()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMessages, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await authFetch('/api/messages/incoming')
      const data = await res.json()
      if (data.success) {
        setMessages(data.data)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/messages/incoming/${id}/read`, { method: 'POST' })
      fetchMessages()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/messages/incoming/read-all', { method: 'POST' })
      fetchMessages()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const openMessage = (msg: IncomingMessage) => {
    setSelectedMessage(msg)
    if (!msg.is_read) {
      markAsRead(msg.id)
    }
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
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-white flex items-center gap-3">
            Incoming Messages
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 bg-purple-600 text-white text-sm rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            Messages received via webhook
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn-secondary">
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}
          <button onClick={fetchMessages} disabled={loading} className="btn-primary">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-32 mb-2 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
            <p className="text-dark-500 dark:text-dark-400">No incoming messages yet</p>
            <p className="text-sm text-dark-400 mt-2">
              Messages will appear here when received
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-dark-700">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => openMessage(msg)}
                className={`p-4 cursor-pointer transition-colors ${
                  msg.is_read
                    ? 'hover:bg-dark-50 dark:hover:bg-dark-700/30'
                    : 'bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.is_read
                      ? 'bg-dark-200 dark:bg-dark-700'
                      : 'bg-purple-600'
                  }`}>
                    {msg.is_read ? (
                      <MailOpen className="w-5 h-5 text-dark-500 dark:text-dark-400" />
                    ) : (
                      <Mail className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium ${
                        msg.is_read ? 'text-dark-700 dark:text-dark-300' : 'text-dark-900 dark:text-white'
                      }`}>
                        {msg.source}
                      </p>
                      <span className="text-xs text-dark-400">
                        {new Date(msg.received_at).toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${
                      msg.is_read ? 'text-dark-500' : 'text-dark-700 dark:text-dark-300'
                    }`}>
                      {msg.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Message Modal */}
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
                </div>
                <div>
                  <label className="text-xs text-dark-400 uppercase">Received</label>
                  <p className="text-dark-900 dark:text-white">
                    {new Date(selectedMessage.received_at).toLocaleString()}
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
                <div className="flex gap-3 pt-4">
                  <a
                    href={`/send?phone=${selectedMessage.source}`}
                    className="btn-primary flex-1"
                  >
                    <Send className="w-4 h-4" />
                    Reply
                  </a>
                  <button onClick={() => setSelectedMessage(null)} className="btn-secondary">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

