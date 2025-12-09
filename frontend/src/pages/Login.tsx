import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Lock, User, Loader2, AlertCircle, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(username, password)
    
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Login failed')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-dark-900 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 mb-4"
          >
            <MessageSquare className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">NovaText Cloud</h1>
          <p className="text-dark-400 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            Enterprise SMS Platform
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800/50 backdrop-blur-xl rounded-2xl p-8 border border-dark-700 shadow-2xl"
        >
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder:text-dark-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder:text-dark-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-700">
            <p className="text-xs text-dark-500 text-center">
              Default credentials: admin / NovaText2024!
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-dark-500 text-sm mt-8">
          © 2024 NovaText Cloud. All rights reserved.
        </p>
      </motion.div>
    </div>
  )
}
