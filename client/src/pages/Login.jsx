import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Shield } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">

      {/* Left panel - hidden on mobile */}
      <div className="hidden md:flex flex-1 relative overflow-hidden items-center justify-center p-12"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Welcome back</h2>
          <p className="text-purple-200 text-lg max-w-sm">Your scope boundaries are waiting. Log in to keep your work protected.</p>
          <div className="mt-10 bg-white/10 rounded-2xl p-5 text-left">
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider mb-3">What you get</p>
            <div className="space-y-2">
              {['AI-powered scope analysis', 'Professional reply suggestions', 'Full message history', 'Multiple client projects'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-white text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16">

        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 md:hidden">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Boundra</span>
        </div>

        {/* Desktop logo */}
        <div className="hidden md:flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Boundra</span>
        </div>

        <div className="max-w-sm w-full mx-auto md:mx-0">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Log in</h1>
          <p className="text-gray-400 text-sm mb-8">Enter your details to access your account</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Email Address</label>
              <input
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-400 text-gray-900 text-sm"
                placeholder="you@email.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Password</label>
              <input
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-400 text-gray-900 text-sm"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-xl font-semibold text-sm mb-4"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <p className="text-gray-400 text-center text-sm">
            No account?{' '}
            <span onClick={() => navigate('/signup')} className="text-purple-600 cursor-pointer font-semibold hover:text-purple-800">
              Sign up free
            </span>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <span onClick={() => navigate('/')} className="text-gray-400 text-xs cursor-pointer hover:text-gray-600">
              ← Back to home
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

