'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  HandHelping,
  MessageCircle,
  Rocket,
  Sparkles,
  Trophy,
  UserCheck,
  Waves,
} from 'lucide-react'

type Project = {
  id: string
  ownerId: string
  ownerName: string
  title: string
  description: string
  stage: string
  supportRequired: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

type ProgressUpdate = {
  id: string
  projectId: string
  authorId: string
  milestone: string
  note: string
  createdAt: string
}

type ProjectComment = {
  id: string
  projectId: string
  authorId: string
  message: string
  createdAt: string
}

type CollaborationRequest = {
  id: string
  projectId: string
  requesterId: string
  message: string
  status: string
  createdAt: string
}

const apiBase = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '')

const stageOptions = [
  { label: 'Idea', value: 'IDEA' },
  { label: 'Planning', value: 'PLANNING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Testing', value: 'TESTING' },
  { label: 'Completed', value: 'COMPLETED' },
]

const supportOptions = [
  { label: 'None', value: 'NONE' },
  { label: 'Feedback', value: 'FEEDBACK' },
  { label: 'Frontend Help', value: 'FRONTEND_HELP' },
  { label: 'Backend Help', value: 'BACKEND_HELP' },
  { label: 'UI/UX Help', value: 'UI_UX_HELP' },
  { label: 'Testing Help', value: 'TESTING_HELP' },
]

const competences = [
  'Project Profiling',
  'Code Version Control',
  'Test-Driven Development',
  'Secure By Design',
  'Documentation',
  'Ethical Use of AI',
]

function prettifyEnum(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
}

function unwrapList<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (payload && typeof payload === 'object') {
    const map = payload as Record<string, unknown>
    for (const key of keys) {
      if (Array.isArray(map[key])) {
        return map[key] as T[]
      }
    }
  }

  return []
}

function unwrapItem<T>(payload: unknown, keys: string[]): T | null {
  if (payload && typeof payload === 'object') {
    const map = payload as Record<string, unknown>

    for (const key of keys) {
      if (map[key] && typeof map[key] === 'object') {
        return map[key] as T
      }
    }

    return payload as T
  }

  return null
}

async function apiRequest(path: string, options: RequestInit = {}, token?: string) {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${apiBase}${path}`, { ...options, headers })
  const contentType = response.headers.get('content-type')
  const payload = contentType?.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload
        ? ((payload as { message?: string; error?: string }).message ??
          (payload as { error?: string }).error ??
          'Request failed')
        : 'Request failed'
    throw new Error(message)
  }

  return payload
}

export default function HomePage() {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState('Sign in to activate your contributor dashboard.')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginEmail, setLoginEmail] = useState('developer@example.com')
  const [loginPassword, setLoginPassword] = useState('devpass123!')

  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  const [projects, setProjects] = useState<Project[]>([])
  const [celebration, setCelebration] = useState<Project[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stage, setStage] = useState('IN_PROGRESS')
  const [supportRequired, setSupportRequired] = useState('BACKEND_HELP')

  const [milestone, setMilestone] = useState('')
  const [milestoneNote, setMilestoneNote] = useState('')
  const [comment, setComment] = useState('')
  const [collaborationMessage, setCollaborationMessage] = useState('')
  const [activeProjectId, setActiveProjectId] = useState('')

  const [updates, setUpdates] = useState<ProgressUpdate[]>([])
  const [comments, setComments] = useState<ProjectComment[]>([])
  const [requests, setRequests] = useState<CollaborationRequest[]>([])

  const authReady = token.length > 0
  const selectedProject = projects.find((item) => item.id === activeProjectId)

  const stats = useMemo(
    () => [
      { label: 'Live Projects', value: projects.length.toString(), icon: Waves },
      { label: 'Celebrations', value: celebration.length.toString(), icon: Trophy },
      { label: 'Security', value: authReady ? 'JWT Active' : 'Locked', icon: UserCheck },
    ],
    [projects.length, celebration.length, authReady]
  )

  useEffect(() => {
    refreshData('').catch(() => {
      setStatus('Set NEXT_PUBLIC_BACKEND_URL or run the local API routes to load data.')
    })
  }, [])

  const refreshData = async (jwt: string) => {
    const [feed, wall] = await Promise.all([
      apiRequest('/api/feed', {}, jwt || undefined),
      apiRequest('/api/celebration', {}, jwt || undefined),
    ])

    setProjects(unwrapList<Project>(feed, ['feed', 'projects']))
    setCelebration(unwrapList<Project>(wall, ['completedProjects', 'wall', 'celebration']))
  }

  const loadProjectActivity = async (projectId: string, jwt?: string) => {
    try {
      const [updatesResponse, commentsResponse] = await Promise.all([
        apiRequest(`/api/projects/${projectId}/updates`, {}, jwt),
        apiRequest(`/api/projects/${projectId}/comments`, {}, jwt),
      ])

      setUpdates(unwrapList<ProgressUpdate>(updatesResponse, ['updates']))
      setComments(unwrapList<ProjectComment>(commentsResponse, ['comments']))
    } catch {
      setUpdates([])
      setComments([])
    }
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = (await apiRequest(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        }
      )) as { token?: string; user?: { email: string } }

      if (!payload.token) {
        throw new Error('Login response did not include a token')
      }

      setToken(payload.token)
      setStatus(`Signed in as ${payload.user?.email ?? loginEmail}`)
      await refreshData(payload.token)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to log in')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = (await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: registerName,
          email: registerEmail,
          password: registerPassword,
          bio: 'MzansiBuilds developer profile',
          githubLink: '',
          linkedinLink: '',
        }),
      })) as { user?: { email: string } }

      setStatus(`Registered ${payload.user?.email ?? registerEmail}. Use login to receive a JWT token.`)
      setRegisterName('')
      setRegisterEmail('')
      setRegisterPassword('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to register')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (event: FormEvent) => {
    event.preventDefault()
    if (!authReady) {
      setError('Sign in first to create a project.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await apiRequest(
        '/api/projects',
        {
          method: 'POST',
          body: JSON.stringify({ title, description, stage, supportRequired }),
        },
        token
      )
      setTitle('')
      setDescription('')
      await refreshData(token)
      setStatus('Project created and added to the live feed.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create project')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteProject = async (projectId: string) => {
    if (!authReady) {
      setError('Sign in first to complete projects.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await apiRequest(`/api/projects/${projectId}/complete`, { method: 'PATCH' }, token)
      await refreshData(token)
      if (activeProjectId === projectId) {
        setActiveProjectId('')
        setComments([])
        setUpdates([])
        setRequests([])
      }
      setStatus('Project marked as completed and moved to celebration flow.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to complete project')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProject = async (projectId: string) => {
    setError('')
    setActiveProjectId(projectId)
    setRequests([])
    await loadProjectActivity(projectId, token || undefined)
  }

  const handleMilestone = async (event: FormEvent) => {
    event.preventDefault()
    if (!authReady || !activeProjectId) {
      setError('Select a project and sign in to add milestones.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const response = await apiRequest(
        `/api/projects/${activeProjectId}/updates`,
        {
          method: 'POST',
          body: JSON.stringify({ milestone, note: milestoneNote }),
        },
        token
      )

      const created = unwrapItem<ProgressUpdate>(response, ['update'])
      if (created) {
        setUpdates((current) => [created, ...current])
      }
      setMilestone('')
      setMilestoneNote('')
      setStatus('Milestone update submitted.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to add milestone')
    } finally {
      setLoading(false)
    }
  }

  const handleComment = async (event: FormEvent) => {
    event.preventDefault()
    if (!authReady || !activeProjectId) {
      setError('Select a project and sign in to comment.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const response = await apiRequest(
        `/api/projects/${activeProjectId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({ message: comment }),
        },
        token
      )

      const created = unwrapItem<ProjectComment>(response, ['comment'])
      if (created) {
        setComments((current) => [created, ...current])
      }
      setComment('')
      setStatus('Comment added to project thread.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to add comment')
    } finally {
      setLoading(false)
    }
  }

  const handleRaiseHand = async (event: FormEvent) => {
    event.preventDefault()
    if (!authReady || !activeProjectId) {
      setError('Select a project and sign in to request collaboration.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const requestPayload = {
        method: 'POST',
        body: JSON.stringify({ message: collaborationMessage }),
      }

      let response: unknown

      try {
        response = await apiRequest(`/api/projects/${activeProjectId}/raise-hand`, requestPayload, token)
      } catch {
        response = await apiRequest(`/api/projects/${activeProjectId}/collaboration`, requestPayload, token)
      }

      const created = unwrapItem<CollaborationRequest>(response, ['collaborationRequest'])
      if (created) {
        setRequests((current) => [created, ...current])
      }

      setCollaborationMessage('')
      setStatus('Collaboration request sent.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send collaboration request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container-width pb-20 pt-10 text-neutral-100">
      <section className="hero-shell panel-green relative overflow-hidden p-8 sm:p-12">
        <div className="absolute -right-16 -top-20 h-56 w-56 animate-float rounded-full bg-forest-500/20 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-44 w-44 animate-float rounded-full bg-white/10 blur-3xl" />
        <p className="tag">Derivco Code Skills Quest</p>
        <h1 className="font-display mt-4 text-4xl font-bold sm:text-6xl">Build Publicly. Ship Loudly.</h1>
        <p className="mt-4 max-w-3xl text-neutral-300">
          MzansiBuilds helps developers publish progress in real time, attract collaborators, and celebrate shipped
          projects on a public wall.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <article key={item.label} className="rounded-2xl border border-white/15 bg-black/25 p-4">
              <item.icon className="h-5 w-5 text-forest-300" />
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-forest-200">{item.label}</p>
              <p className="mt-2 text-2xl font-bold">{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {competences.map((item) => (
          <article key={item} className="panel flex items-center gap-3 p-4">
            <BadgeCheck className="h-5 w-5 text-forest-300" />
            <span className="text-sm text-neutral-200">{item}</span>
          </article>
        ))}
      </section>

      <section id="auth" className="mt-8 grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleLogin} className="panel p-6">
          <h2 className="font-display text-2xl font-semibold">Login (JWT)</h2>
          <p className="mt-2 text-sm text-neutral-300">Use the seeded account to unlock protected routes.</p>
          <div className="mt-4 space-y-3">
            <input
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="input-field"
              placeholder="Email"
              type="email"
              required
            />
            <input
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="input-field"
              placeholder="Password"
              type="password"
              required
            />
            <button className="btn-primary w-full" type="submit" disabled={loading}>Sign in</button>
          </div>
        </form>

        <form onSubmit={handleRegister} className="panel p-6">
          <h2 className="font-display text-2xl font-semibold">Create Account</h2>
          <p className="mt-2 text-sm text-neutral-300">Register a developer profile for the platform.</p>
          <div className="mt-4 space-y-3">
            <input
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              className="input-field"
              placeholder="Full name"
              required
            />
            <input
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              className="input-field"
              placeholder="Email"
              type="email"
              required
            />
            <input
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              className="input-field"
              placeholder="Password"
              type="password"
              required
            />
            <button className="btn-outline w-full" type="submit" disabled={loading}>Register</button>
          </div>
        </form>
      </section>

      <section id="create" className="mt-8 panel p-6">
        <h2 className="font-display text-2xl font-semibold">Create Project Entry</h2>
        <p className="mt-2 text-sm text-neutral-300">Add project stage and support required as defined in the brief.</p>
        <form onSubmit={handleCreateProject} className="mt-4 grid gap-3 lg:grid-cols-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Project title" required />
          <select value={stage} onChange={(e) => setStage(e.target.value)} className="input-field" required>
            {stageOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select value={supportRequired} onChange={(e) => setSupportRequired(e.target.value)} className="input-field" required>
            {supportOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button className="btn-primary" type="submit" disabled={loading}>Create project</button>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field lg:col-span-2"
            placeholder="Describe what you are building"
            rows={4}
            required
          />
        </form>
      </section>

      <section id="feed" className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">Live Feed</h2>
            {authReady && (
              <button className="btn-outline" onClick={() => refreshData(token)} disabled={loading}>
                Refresh
              </button>
            )}
          </div>
          <div className="mt-4 space-y-4">
            {projects.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/25 p-4 text-neutral-300">
                No projects yet. Log in and create the first one.
              </p>
            )}
            {projects.map((project) => (
              <article
                key={project.id}
                className={`rounded-2xl border p-4 transition ${activeProjectId === project.id ? 'border-forest-400/60 bg-forest-400/10' : 'border-white/15 bg-black/20'}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <button className="tag" onClick={() => handleSelectProject(project.id)}>
                    Select
                  </button>
                  <span className="rounded-full border border-white/20 px-2 py-1 text-xs text-neutral-300">{prettifyEnum(project.stage)}</span>
                  <span className="rounded-full border border-forest-300/40 px-2 py-1 text-xs text-forest-200">{prettifyEnum(project.supportRequired)}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{project.title}</h3>
                <p className="mt-1 text-sm text-neutral-300">{project.description}</p>
                <p className="mt-2 text-xs text-neutral-500">Owner: {project.ownerName}</p>
                {!project.completed && (
                  <button className="btn-primary mt-3" onClick={() => handleCompleteProject(project.id)} disabled={loading}>
                    Mark Completed
                  </button>
                )}
              </article>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="font-display text-2xl font-semibold">Project Actions</h2>
          <p className="mt-2 text-sm text-neutral-300">Selected project: {selectedProject?.title ?? 'none'}</p>

          <form onSubmit={handleMilestone} className="mt-4 space-y-2">
            <h3 className="flex items-center gap-2 font-semibold text-forest-200"><Rocket className="h-4 w-4" /> Add Milestone</h3>
            <input value={milestone} onChange={(e) => setMilestone(e.target.value)} className="input-field" placeholder="Milestone title" required />
            <textarea value={milestoneNote} onChange={(e) => setMilestoneNote(e.target.value)} className="input-field" rows={3} placeholder="Progress note" required />
            <button className="btn-outline w-full" type="submit" disabled={loading}>Submit milestone</button>
          </form>

          <form onSubmit={handleComment} className="mt-4 space-y-2">
            <h3 className="flex items-center gap-2 font-semibold text-forest-200"><MessageCircle className="h-4 w-4" /> Comment</h3>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="input-field" rows={2} placeholder="Comment on project" required />
            <button className="btn-outline w-full" type="submit" disabled={loading}>Post comment</button>
          </form>

          <form onSubmit={handleRaiseHand} className="mt-4 space-y-2">
            <h3 className="flex items-center gap-2 font-semibold text-forest-200"><HandHelping className="h-4 w-4" /> Raise Hand</h3>
            <textarea
              value={collaborationMessage}
              onChange={(e) => setCollaborationMessage(e.target.value)}
              className="input-field"
              rows={2}
              placeholder="Offer collaboration"
              required
            />
            <button className="btn-outline w-full" type="submit" disabled={loading}>Send request</button>
          </form>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="panel p-6">
          <h3 className="font-display text-xl font-semibold">Milestone Timeline</h3>
          <div className="mt-4 space-y-3">
            {updates.length === 0 && <p className="text-sm text-neutral-400">No milestones yet for selected project.</p>}
            {updates.map((update) => (
              <article key={update.id} className="rounded-xl border border-white/15 bg-black/25 p-3">
                <p className="text-sm font-semibold text-forest-200">{update.milestone}</p>
                <p className="mt-1 text-sm text-neutral-300">{update.note}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <h3 className="font-display text-xl font-semibold">Comments</h3>
          <div className="mt-4 space-y-3">
            {comments.length === 0 && <p className="text-sm text-neutral-400">No comments yet for selected project.</p>}
            {comments.map((item) => (
              <article key={item.id} className="rounded-xl border border-white/15 bg-black/25 p-3">
                <p className="text-sm text-neutral-200">{item.message}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <h3 className="font-display text-xl font-semibold">Collaboration Requests</h3>
          <div className="mt-4 space-y-3">
            {requests.length === 0 && <p className="text-sm text-neutral-400">No collaboration requests submitted in this session.</p>}
            {requests.map((request) => (
              <article key={request.id} className="rounded-xl border border-white/15 bg-black/25 p-3">
                <p className="text-sm text-neutral-200">{request.message}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-forest-200">{prettifyEnum(request.status)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="celebration" className="mt-8 panel p-6">
        <h2 className="font-display text-2xl font-semibold">Celebration Wall</h2>
        <p className="mt-2 text-sm text-neutral-300">Completed projects appear here after completion.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {celebration.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/20 p-4 text-neutral-300">No projects completed yet.</p>
          )}
          {celebration.map((project) => (
            <article key={project.id} className="rounded-2xl border border-forest-400/40 bg-forest-500/10 p-4">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-forest-200"><Sparkles className="h-3.5 w-3.5" /> Completed</p>
              <h3 className="mt-1 text-lg font-semibold">{project.title}</h3>
              <p className="text-sm text-neutral-300">by {project.ownerName}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-neutral-300">
        <p>Status: {status}</p>
        {error && <p className="mt-2 text-red-300">Error: {error}</p>}
      </section>
    </main>
  )
}
