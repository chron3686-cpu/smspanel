import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, 
  Moon, 
  Sun, 
  Smartphone,
  Zap,
  Shield,
  CheckCircle
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { authFetch } from '../context/AuthContext'

interface SettingsData {
  default_source: string
  theme: string
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const [settings, setSettings] = useState<SettingsData>({
    default_source: '',
    theme: 'light'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await authFetch('/api/settings')
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await authFetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      })
      
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-white">
          Settings
        </h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">
          Configure your SMS platform
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* SMS Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
                SMS Configuration
              </h2>
              <p className="text-sm text-dark-500">
                Default sender settings
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="skeleton h-10 rounded-xl" />
              <div className="skeleton h-10 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Default Sender ID / Number
                </label>
                <input
                  type="text"
                  value={settings.default_source}
                  onChange={(e) => setSettings({ ...settings, default_source: e.target.value })}
                  placeholder="+1234567890 or COMPANYNAME"
                  className="input"
                />
                <p className="text-xs text-dark-400 mt-2">
                  This will be used as the default sender for all messages
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
                Appearance
              </h2>
              <p className="text-sm text-dark-500">
                Customize the look and feel
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Theme</p>
              <p className="text-sm text-dark-500">
                {theme === 'light' ? 'Light mode is active' : 'Dark mode is active'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="relative w-14 h-8 rounded-full bg-dark-200 dark:bg-dark-700 transition-colors"
            >
              <motion.div
                className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
                animate={{ left: theme === 'light' ? 4 : 32 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
              </motion.div>
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
                System Information
              </h2>
              <p className="text-sm text-dark-500">
                Platform details
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <span className="text-dark-600 dark:text-dark-300">Platform</span>
              <span className="font-medium text-dark-900 dark:text-white">NovaText Cloud</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <span className="text-dark-600 dark:text-dark-300">Version</span>
              <span className="font-medium text-dark-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <span className="text-dark-600 dark:text-dark-300">API Status</span>
              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
                Security
              </h2>
              <p className="text-sm text-dark-500">
                API key and authentication
              </p>
            </div>
          </div>

          <div className="p-4 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-dark-600 dark:text-dark-300">API Key</span>
              <span className="font-mono text-sm text-dark-400">••••••••••••••••</span>
            </div>
            <p className="text-xs text-dark-400 mt-2">
              API key is securely stored on the server and never exposed to the browser
            </p>
          </div>
        </div>

        {/* Save Button */}
        <motion.button
          onClick={handleSave}
          disabled={saving || loading}
          className="btn-primary w-full py-3"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {saving ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Saved Successfully!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

