import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Send, 
  Users, 
  FileText, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { authFetch } from '../context/AuthContext'

interface Contact {
  id: string
  name: string
  phone: string
}

interface SendResult {
  phone: string
  success: boolean
  status?: string
  error?: string
}

export default function SendSMS() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [destination, setDestination] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  
  // Bulk mode
  const [bulkText, setBulkText] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [bulkResults, setBulkResults] = useState<SendResult[]>([])
  const [_progress, setProgress] = useState(0)

  useEffect(() => {
    const phone = searchParams.get('phone')
    if (phone) {
      setDestination(phone)
    }
    fetchContacts()
  }, [searchParams])

  const fetchContacts = async () => {
    try {
      const res = await authFetch('/api/contacts')
      const data = await res.json()
      if (data.success) {
        setContacts(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    }
  }

  const calculateSegments = (text: string) => {
    const length = text.length
    if (length === 0) return { chars: 0, segments: 0 }
    if (length <= 160) return { chars: length, segments: 1 }
    return { chars: length, segments: Math.ceil(length / 153) }
  }

  const smsInfo = calculateSegments(message)

  const handleSingleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination || !message) return

    setSending(true)
    setError('')
    setSent(false)

    try {
      const res = await authFetch('/api/sms/send', {
        method: 'POST',
        body: JSON.stringify({ destination, message })
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        setSent(true)
        setDestination('')
        setMessage('')
      } else {
        setError(data.error || 'Failed to send SMS')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setSending(false)
    }
  }

  const parseRecipients = () => {
    const lines = bulkText.split('\n').filter(line => line.trim())
    return lines.map(line => {
      const parts = line.split(/[;,]/).map(p => p.trim())
      return parts.length > 1 ? parts[1] : parts[0]
    }).filter(phone => phone.length >= 10)
  }

  const handleBulkSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message) return

    const recipients = bulkText ? parseRecipients() : selectedContacts.map(id => {
      const contact = contacts.find(c => c.id === id)
      return contact?.phone || ''
    }).filter(Boolean)

    if (recipients.length === 0) {
      setError('No recipients selected')
      return
    }

    setSending(true)
    setError('')
    setBulkResults([])
    setProgress(0)

    try {
      const res = await authFetch('/api/sms/bulk', {
        method: 'POST',
        body: JSON.stringify({ recipients, message })
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        setBulkResults(data.results)
        setProgress(100)
      } else {
        setError(data.error || 'Failed to send bulk SMS')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setSending(false)
    }
  }

  const successCount = bulkResults.filter(r => r.success).length
  const failCount = bulkResults.length - successCount

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-white">
          Send SMS
        </h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">
          Compose and send messages
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 p-1 bg-dark-100 dark:bg-dark-800 rounded-xl w-fit">
        <button
          onClick={() => setMode('single')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'single'
              ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-sm'
              : 'text-dark-500'
          }`}
        >
          <Send className="w-4 h-4" />
          Single SMS
        </button>
        <button
          onClick={() => setMode('bulk')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'bulk'
              ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-sm'
              : 'text-dark-500'
          }`}
        >
          <Users className="w-4 h-4" />
          Bulk SMS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <form onSubmit={mode === 'single' ? handleSingleSend : handleBulkSend} className="p-6 space-y-6">
            {mode === 'single' ? (
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Recipient Number
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="905551234567"
                  className="input font-mono"
                  required
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Paste Numbers (one per line)
                  </label>
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="905551234567&#10;905552345678&#10;Name;905553456789"
                    rows={6}
                    className="input resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-dark-400 mt-1">
                    {parseRecipients().length} numbers detected
                  </p>
                </div>

                {contacts.length > 0 && !bulkText && (
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                      Or Select from Contacts
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-dark-200 dark:border-dark-600 rounded-xl p-2 space-y-1">
                      {contacts.map(contact => (
                        <label
                          key={contact.id}
                          className="flex items-center gap-3 p-2 hover:bg-dark-50 dark:hover:bg-dark-700 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedContacts([...selectedContacts, contact.id])
                              } else {
                                setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                              }
                            }}
                            className="w-4 h-4 rounded border-dark-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-dark-700 dark:text-dark-300">{contact.name}</span>
                          <span className="text-xs text-dark-400 font-mono">{contact.phone}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-dark-400 mt-1">
                      {selectedContacts.length} contacts selected
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                className="input resize-none"
                required
              />
              <div className="flex justify-between items-center mt-2 text-sm text-dark-500">
                <span>{smsInfo.chars} characters</span>
                <span>{smsInfo.segments} segment{smsInfo.segments !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Success */}
            {sent && mode === 'single' && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Message sent successfully!
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={sending}
              className="btn-primary w-full py-3"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {mode === 'single' ? 'Send SMS' : `Send to ${bulkText ? parseRecipients().length : selectedContacts.length} Recipients`}
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Results / Preview */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            {bulkResults.length > 0 ? 'Send Results' : 'Preview'}
          </h3>

          {bulkResults.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{successCount}</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Successful</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
                  <XCircle className="w-8 h-8 mx-auto text-red-600 dark:text-red-400 mb-2" />
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{failCount}</p>
                  <p className="text-sm text-red-700 dark:text-red-300">Failed</p>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {bulkResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.success
                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <span className="font-mono text-sm">{result.phone}</span>
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-dark-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Your message preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

