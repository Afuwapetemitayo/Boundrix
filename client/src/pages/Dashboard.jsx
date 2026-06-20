import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Plus, FolderOpen, Shield, LogOut, X, ChevronRight,
  FileText, LayoutDashboard, Settings, Bell, AlertTriangle,
  CheckCircle, TrendingUp, User, Lock, Palette, BellRing, Menu
} from 'lucide-react'

const API = 'http://localhost:5000/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [form, setForm] = useState({ name: '', clientName: '' })
  const [notifications] = useState([
    { id: 1, text: 'Welcome to Boundra!', sub: 'Start by creating your first project.', time: 'Just now', unread: true },
    { id: 2, text: 'Tip: Upload your SOW early', sub: 'The earlier you upload, the more protected you are.', time: '1 min ago', unread: true },
    { id: 3, text: 'Boundra is ready', sub: 'Your account is fully set up and ready to use.', time: '2 mins ago', unread: false },
  ])
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const headers = { Authorization: 'Bearer ' + token }

  useEffect(() => {
    if (!token) return navigate('/login')
    fetchProjects()
  }, [activeTab])

  const fetchProjects = async () => {
    try {
      const res = await axios.get(API + '/projects', { headers })
      setProjects(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const createProject = async () => {
    if (!form.name || !form.clientName) return
    await axios.post(API + '/projects', form, { headers })
    setShowForm(false)
    setForm({ name: '', clientName: '' })
    fetchProjects()
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U'

  const totalProjects = projects.length
  const protectedProjects = projects.filter(p => p.sowSummary).length
  const pendingProjects = projects.filter(p => !p.sowSummary).length
  const unreadCount = notifications.filter(n => n.unread).length

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const handleTabChange = (id) => {
    setActiveTab(id)
    setShowForm(false)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f8f7ff' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={'fixed h-full z-50 flex flex-col bg-white border-r border-gray-100 transition-transform duration-300 w-64 ' +
        (sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0')}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Boundra</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 px-2">Menu</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all ' +
                (activeTab === item.id
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900')}
            >
              <item.icon size={16} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {projects.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 px-2">Recent</p>
              {projects.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  onClick={() => { navigate('/project/' + p.id); setSidebarOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl mb-1 text-left hover:bg-gray-50 transition-all"
                >
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={11} className="text-purple-500" />
                  </div>
                  <span className="text-xs text-gray-600 truncate">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <button onClick={logout} className="text-gray-300 hover:text-red-400 transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 md:ml-64">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-900"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">
                {activeTab === 'overview' && 'Overview'}
                {activeTab === 'projects' && 'Your Projects'}
                {activeTab === 'notifications' && 'Notifications'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-gray-400 text-xs mt-0.5 hidden md:block">
                {activeTab === 'overview' && 'Your Boundra summary'}
                {activeTab === 'projects' && 'Manage your client agreements'}
                {activeTab === 'notifications' && 'Stay updated on your activity'}
                {activeTab === 'settings' && 'Manage your account and preferences'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => handleTabChange('notifications')}
              className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 relative"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { handleTabChange('projects'); setShowForm(true) }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1 md:gap-2"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 md:py-8">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-6"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
              >
                <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white opacity-5 rounded-full translate-x-1/3 -translate-y-1/3"></div>
                <div className="relative z-10">
                  <p className="text-purple-200 text-sm mb-1">Welcome back</p>
                  <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2">{user.name} 👋</h2>
                  <p className="text-purple-200 text-sm max-w-md">
                    {totalProjects === 0
                      ? "You have no projects yet. Create one to get started."
                      : 'You have ' + totalProjects + ' project' + (totalProjects !== 1 ? 's' : '') + ' — ' + protectedProjects + ' protected, ' + pendingProjects + ' pending SOW.'}
                  </p>
                  {totalProjects === 0 && (
                    <button
                      onClick={() => { handleTabChange('projects'); setShowForm(true) }}
                      className="mt-4 bg-white text-purple-700 hover:bg-purple-50 px-5 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2"
                    >
                      <Plus size={14} />
                      Create First Project
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
                  <div className="flex justify-between items-start mb-2 md:mb-3">
                    <p className="text-xs text-gray-400 font-medium hidden md:block">Total Projects</p>
                    <p className="text-xs text-gray-400 font-medium md:hidden">Total</p>
                    <div className="w-7 md:w-8 h-7 md:h-8 bg-purple-50 rounded-xl flex items-center justify-center">
                      <FolderOpen size={13} className="text-purple-500" />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-extrabold text-gray-900">{totalProjects}</p>
                  <p className="text-xs text-gray-400 mt-1 hidden md:block">Active clients</p>
                </div>
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
                  <div className="flex justify-between items-start mb-2 md:mb-3">
                    <p className="text-xs text-gray-400 font-medium">Protected</p>
                    <div className="w-7 md:w-8 h-7 md:h-8 bg-green-50 rounded-xl flex items-center justify-center">
                      <CheckCircle size={13} className="text-green-500" />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-extrabold text-gray-900">{protectedProjects}</p>
                  <p className="text-xs text-green-500 mt-1 font-medium hidden md:block">SOW uploaded</p>
                </div>
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
                  <div className="flex justify-between items-start mb-2 md:mb-3">
                    <p className="text-xs text-gray-400 font-medium hidden md:block">Needs Attention</p>
                    <p className="text-xs text-gray-400 font-medium md:hidden">Pending</p>
                    <div className="w-7 md:w-8 h-7 md:h-8 bg-yellow-50 rounded-xl flex items-center justify-center">
                      <AlertTriangle size={13} className="text-yellow-500" />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-extrabold text-gray-900">{pendingProjects}</p>
                  <p className="text-xs text-yellow-500 mt-1 font-medium hidden md:block">Pending SOW</p>
                </div>
              </div>

              {projects.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Recent Projects</h3>
                    <button onClick={() => handleTabChange('projects')} className="text-purple-500 text-xs font-semibold">View all →</button>
                  </div>
                  <div className="space-y-3">
                    {projects.slice(0, 3).map(p => (
                      <div
                        key={p.id}
                        onClick={() => navigate('/project/' + p.id)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all group"
                      >
                        <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                          <FileText size={15} className="text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                          <p className="text-gray-400 text-xs">Client: {p.clientName}</p>
                        </div>
                        {p.sowSummary ? (
                          <span className="text-xs bg-green-50 text-green-600 font-semibold px-2 py-1 rounded-full shrink-0">Protected</span>
                        ) : (
                          <span className="text-xs bg-yellow-50 text-yellow-600 font-semibold px-2 py-1 rounded-full shrink-0">Pending</span>
                        )}
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-purple-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-500" />
                  How to get the most from Boundra
                </h3>
                <div className="space-y-3">
                  {[
                    { num: '1', color: 'purple', bg: 'bg-purple-50', ibg: 'bg-purple-100', text: 'text-purple-600', title: 'Create a project for every client', desc: "Keep each client's SOW and messages separate." },
                    { num: '2', color: 'blue', bg: 'bg-blue-50', ibg: 'bg-blue-100', text: 'text-blue-600', title: 'Upload your SOW before work starts', desc: "The earlier you upload, the more you're protected." },
                    { num: '3', color: 'green', bg: 'bg-green-50', ibg: 'bg-green-100', text: 'text-green-600', title: 'Analyse every suspicious message', desc: "When in doubt, paste it in. Boundra will guide you." },
                  ].map(tip => (
                    <div key={tip.num} className={'flex items-start gap-3 p-3 rounded-xl ' + tip.bg}>
                      <div className={'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ' + tip.ibg}>
                        <span className={'text-xs font-bold ' + tip.text}>{tip.num}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{tip.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === 'projects' && (
            <div>
              {showForm && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mb-6">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-gray-900">Create New Project</h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-500">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Project Name</label>
                      <input
                        className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-300 text-gray-900 text-sm"
                        placeholder="e.g. Logo Design for Hilann"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Client Name</label>
                      <input
                        className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-300 text-gray-900 text-sm"
                        placeholder="e.g. Hilann Logistics"
                        value={form.clientName}
                        onChange={e => setForm({...form, clientName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={createProject} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold">
                      Create Project
                    </button>
                    <button onClick={() => setShowForm(false)} className="border border-gray-200 text-gray-500 px-5 py-2.5 rounded-full text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!showForm && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                  >
                    <Plus size={14} />
                    New Project
                  </button>
                </div>
              )}

              {projects.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-16 md:py-20 text-center">
                  <div className="w-14 md:w-16 h-14 md:h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FolderOpen size={24} className="text-purple-300" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">Create your first project and start protecting your work.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2"
                  >
                    <Plus size={14} />
                    Create First Project
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {projects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => navigate('/project/' + p.id)}
                      className="bg-white border border-gray-100 p-4 md:p-5 rounded-2xl cursor-pointer hover:border-purple-200 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-9 md:w-10 h-9 md:h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{p.name}</h3>
                          <p className="text-gray-400 text-xs mt-0.5">Client: {p.clientName}</p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                          {p.sowSummary ? (
                            <span className="text-xs bg-green-50 text-green-600 font-semibold px-2 md:px-3 py-1 rounded-full">SOW Active</span>
                          ) : (
                            <span className="text-xs bg-yellow-50 text-yellow-600 font-semibold px-2 md:px-3 py-1 rounded-full">Upload SOW</span>
                          )}
                          <ChevronRight size={15} className="text-gray-300 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {notifications.map((n, i) => (
                  <div
                    key={n.id}
                    className={'flex items-start gap-4 p-4 md:p-5 ' +
                      (i < notifications.length - 1 ? 'border-b border-gray-50 ' : '') +
                      (n.unread ? 'bg-purple-50/30' : '')}
                  >
                    <div className={'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ' +
                      (n.unread ? 'bg-purple-100' : 'bg-gray-100')}
                    >
                      <BellRing size={15} className={n.unread ? 'text-purple-500' : 'text-gray-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900">{n.text}</p>
                        {n.unread && <span className="w-2 h-2 bg-purple-500 rounded-full shrink-0"></span>}
                      </div>
                      <p className="text-xs text-gray-400">{n.sub}</p>
                      <p className="text-xs text-gray-300 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-4">

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <User size={15} className="text-purple-500" />
                  <h3 className="font-bold text-gray-900 text-sm">Profile Information</h3>
                </div>
                <div className="p-5 md:p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 md:w-16 h-14 md:h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                      <span className="text-white text-lg md:text-xl font-bold">{initials}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <span className="text-xs bg-purple-50 text-purple-600 font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">Freelancer</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Full Name</label>
                      <input className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-300 text-gray-900 text-sm" defaultValue={user.name} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Email Address</label>
                      <input className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-300 text-gray-900 text-sm" defaultValue={user.email} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Profession</label>
                      <select className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-300 text-gray-900 text-sm">
                        <option>Graphic Designer</option>
                        <option>Web Developer</option>
                        <option>UI/UX Designer</option>
                        <option>Brand Designer</option>
                        <option>Full-Stack Developer</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">WhatsApp Number</label>
                      <input className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-300 text-gray-900 text-sm" placeholder="+234 800 000 0000" />
                    </div>
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold">
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Lock size={15} className="text-purple-500" />
                  <h3 className="font-bold text-gray-900 text-sm">Security</h3>
                </div>
                <div className="p-5 md:p-6 space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Current Password</label>
                    <input type="password" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-300 text-sm" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">New Password</label>
                    <input type="password" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-300 text-sm" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Confirm New Password</label>
                    <input type="password" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-purple-300 text-sm" placeholder="••••••••" />
                  </div>
                  <button className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Palette size={15} className="text-purple-500" />
                  <h3 className="font-bold text-gray-900 text-sm">Preferences</h3>
                </div>
                <div className="p-5 md:p-6 space-y-4">
                  {[
                    { label: 'Email Notifications', desc: 'Get notified when a message is analysed', on: true },
                    { label: 'Auto-save Replies', desc: 'Automatically save suggested replies to history', on: true },
                    { label: 'Strict Scope Mode', desc: 'Flag borderline messages as outside scope', on: false },
                    { label: 'Weekly Summary', desc: 'Receive a weekly report of your scope activity', on: false },
                  ].map((pref, i) => (
                    <div key={i} className={'flex justify-between items-center py-3 ' + (i < 3 ? 'border-b border-gray-50' : '')}>
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-semibold text-gray-900">{pref.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{pref.desc}</p>
                      </div>
                      <div className={'w-10 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ' + (pref.on ? 'bg-purple-600' : 'bg-gray-200')}>
                        <div className={'w-4 h-4 bg-white rounded-full absolute top-1 transition-all ' + (pref.on ? 'right-1' : 'left-1')}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-red-50">
                  <h3 className="font-bold text-red-500 text-sm">Danger Zone</h3>
                </div>
                <div className="p-5 md:p-6">
                  <p className="text-gray-400 text-sm mb-4">Once you delete your account, all your projects and data will be permanently removed.</p>
                  <button className="border border-red-200 text-red-500 hover:bg-red-50 px-5 py-2.5 rounded-full text-sm font-semibold">
                    Delete Account
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
