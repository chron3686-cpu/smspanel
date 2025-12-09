import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Send,
  X,
  Save,
  Phone,
  User
} from 'lucide-react'
import { authFetch } from '../context/AuthContext'

interface Contact {
  id: string
  name: string
  phone: string
  tags: string | null
  created_at: string
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({ name: '', phone: '', tags: '' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchContacts()
  }, [search])

  const fetchContacts = async () => {
    try {
      const res = await authFetch(`/api/contacts?search=${encodeURIComponent(search)}`)
      const data = await res.json()
      if (data.success) {
        setContacts(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact)
      setFormData({ name: contact.name, phone: contact.phone, tags: contact.tags || '' })
    } else {
      setEditingContact(null)
      setFormData({ name: '', phone: '', tags: '' })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) return

    setSaving(true)
    try {
      const url = editingContact ? `/api/contacts/${editingContact.id}` : '/api/contacts/add'
      const res = await authFetch(url, {
        method: editingContact ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setModalOpen(false)
        fetchContacts()
      }
    } catch (error) {
      console.error('Failed to save contact:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await authFetch('/api/contacts/delete', {
        method: 'POST',
        body: JSON.stringify({ id })
      })
      
      if (res.ok) {
        setDeleteId(null)
        fetchContacts()
      }
    } catch (error) {
      console.error('Failed to delete contact:', error)
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
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-white">
            Contacts
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            Manage your contact list
          </p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="input pl-12"
          />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-32 mb-2 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
            <p className="text-dark-500 dark:text-dark-400">
              {search ? 'No contacts found' : 'No contacts yet'}
            </p>
            {!search && (
              <button onClick={() => openModal()} className="btn-primary mt-4">
                <Plus className="w-4 h-4" />
                Add Your First Contact
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 dark:bg-dark-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider hidden sm:table-cell">
                    Tags
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                {contacts.map((contact, index) => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-dark-50 dark:hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-dark-900 dark:text-white">
                          {contact.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-dark-600 dark:text-dark-300">
                      {contact.phone}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {contact.tags ? (
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.split(',').map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 rounded-full"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-dark-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/send?phone=${contact.phone}`}
                          className="btn-ghost p-2 text-purple-600 dark:text-purple-400"
                          title="Send SMS"
                        >
                          <Send className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openModal(contact)}
                          className="btn-ghost p-2"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteId === contact.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(contact.id)}
                              className="btn-ghost p-2 text-red-600"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="btn-ghost p-2"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteId(contact.id)}
                            className="btn-ghost p-2 text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white dark:bg-dark-800 rounded-2xl shadow-2xl z-50"
            >
              <div className="flex items-center justify-between p-6 border-b border-dark-100 dark:border-dark-700">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white">
                  {editingContact ? 'Edit Contact' : 'Add Contact'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="btn-ghost p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="905551234567"
                    className="input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Tags (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="vip, customer"
                    className="input"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {editingContact ? 'Update' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

