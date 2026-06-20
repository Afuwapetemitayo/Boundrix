import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Upload, MessageSquare, Copy, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react'
import useReveal from '../hooks/useReveal'

const API = 'http://localhost:5000/api'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  useReveal()
  const token = localStorage.getItem('token')
  const [project, setProject] = useState(null)
  const [sowText, setSowText] = useState('')
  const [clientMessage, setClientMessage] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const headers = { Authorization: 'Bearer ' + token }

  useEffect(() => {
    if (!token) return navigate('/login')
    fetchProject()
    fetchHistory()
  }, [])

  const fetchProject = async () => {
    const res = await axios.get(API + '/projects/' + id, { headers })
    setProject(res.data)
  }

  const fetchHistory = async () => {
    const res = await axios.get(API + '/analyse/history/' + id, { headers })
    setHistory(res.data)
  }

  const uploadSOW = async () => {
    setLoading(true)
    try {
      await axios.post(API + '/analyse/sow/' + id, { sowText }, { headers })
      fetchProject()
      alert('SOW uploaded successfully!')
    } catch (err) {
      alert('SOW upload failed')
    }
    setLoading(false)
  }

  const analyseMessage = async () => {
    setLoading(true)
    try {
      const res = await axios.post(API + '/analyse/message/' + id, { clientMessage }, { headers })
      setResult(res.data)
      fetchHistory()
    } catch (err) {
      alert('Analysis failed')
    }
    setLoading(false)
  }

  const copyReply = () => {
    navigator.clipboard.writeText(result.suggestedReply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const verdictConfig = (verdict) => {
    if (verdict === 'within_scope') return {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
      icon: <CheckCircle size={16} className="text-green-500" />,
      label: 'Within Scope'
    }
    if (verdict === 'borderline') return {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-100',
      icon: <AlertTriangle size={16} className="text-yellow-500" />,
      label: 'Borderline'
    }
    return {
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
      icon: <XCircle size={16} className="text-red-500" />,
      label: 'Outside Scope'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Dashboard</span>
          </button>
          <span className="text-gray-200">|</span>
          <span className="font-semibold text-gray-900 text-sm">{project?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="font-bold text-gray-900 text-sm">Boundra</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10"></div>
    
      {project && (
          <div className="mb-10 reveal">
            <h1 className="text-3xl font-extrabold text-gray-900">{project.name}</h1>
            <p className="text-gray-400 mt-1 text-sm">Client: {project.clientName}</p>
          </div>
        )}

        {!project?.sowSummary && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 reveal">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                <Upload size={16} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Upload Statement of Work</h3>
                <p className="text-gray-400 text-xs">Paste your SOW and Boundra will read every term</p>
              </div>
            </div>
            <textarea
              className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-purple-300 h-44 resize-none text-sm text-gray-700 mt-4"
              placeholder="Paste your full Statement of Work here..."
              value={sowText}
              onChange={e => setSowText(e.target.value)}
            />
            <button
              onClick={uploadSOW}
              disabled={loading || !sowText}
              className="mt-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-6 py-2.5 rounded-full text-sm font-semibold"
            >
              {loading ? 'Parsing SOW...' : 'Upload & Parse SOW'}
            </button>
          </div>
        )}

        {project?.sowSummary && (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl px-6 py-4 mb-6 flex items-center gap-3 reveal">
            <CheckCircle size={18} className="text-purple-500 shrink-0" />
            <div>
              <p className="text-purple-700 font-semibold text-sm">SOW uploaded and parsed</p>
              <p className="text-purple-400 text-xs">Boundra knows your agreement — paste a client message below</p>
            </div>
          </div>
        )}

        {project?.sowSummary && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 reveal">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageSquare size={16} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Analyse Client Message</h3>
                <p className="text-gray-400 text-xs">Paste any message from your client</p>
              </div>
            </div>

            <textarea
              className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-purple-300 h-32 resize-none text-sm text-gray-700"
              placeholder="Paste client message here..."
              value={clientMessage}
              onChange={e => setClientMessage(e.target.value)}
            />
            <button
              onClick={analyseMessage}
              disabled={loading || !clientMessage}
              className="mt-4 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 text-white px-6 py-2.5 rounded-full text-sm font-semibold"
            >
              {loading ? 'Analysing...' : 'Analyse Message →'}
            </button>

            {result && (
              <div className={'mt-6 rounded-2xl p-5 border ' + verdictConfig(result.verdict).bg + ' ' + verdictConfig(result.verdict).border}>
                <div className="flex items-center gap-2 mb-3">
                  {verdictConfig(result.verdict).icon}
                  <p className={'font-bold text-sm ' + verdictConfig(result.verdict).color}>
                    {verdictConfig(result.verdict).label}
                  </p>
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{result.explanation}</p>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium mb-2">Suggested Reply</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{result.suggestedReply}</p>
                  <button
                    onClick={copyReply}
                    className="mt-3 flex items-center gap-2 text-purple-600 text-xs font-semibold hover:text-purple-800"
                  >
                    <Copy size={12} />
                    {copied ? 'Copied!' : 'Copy Reply'}
                  </button>
                </div>
              </div>
            )}
            </div>
        )}

        {history.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 reveal">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                <Clock size={16} className="text-gray-500" />
              </div>
              <h3 className="font-bold text-gray-900">Message History</h3>
            </div>
            <div className="space-y-4">
              {history.map(m => {
                const config = verdictConfig(m.verdict)
                return (
                  <div key={m.id} className={'rounded-xl p-4 border ' + config.bg + ' ' + config.border}>
                    <div className="flex items-center gap-2 mb-2">
                      {config.icon}
                      <p className={'text-xs font-bold ' + config.color}>{config.label}</p>
                    </div>
                    <p className="text-gray-600 text-sm">{m.clientMessage}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
  
  )
}