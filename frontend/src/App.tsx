import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  API_BASE,
  addComment,
  addMilestone,
  completeProject,
  createProject,
  deleteProject,
  getCelebrationWall,
  getFeed,
  getProject,
  loginUser,
  raiseHand,
  registerUser,
  toLabel,
} from './api'
import { Project, ProjectStage, SupportType } from './types'

const stageOptions: { label: string; value: ProjectStage }[] = [
  { label: 'Idea', value: 'IDEA' },
  { label: 'Planning', value: 'PLANNING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Testing', value: 'TESTING' },
  { label: 'Completed', value: 'COMPLETED' },
]

const supportOptions: { label: string; value: SupportType }[] = [
  { label: 'None', value: 'NONE' },
  { label: 'Feedback', value: 'FEEDBACK' },
  { label: 'Frontend Help', value: 'FRONTEND_HELP' },
  { label: 'Backend Help', value: 'BACKEND_HELP' },
  { label: 'UI/UX Help', value: 'UI_UX_HELP' },
  { label: 'Testing Help', value: 'TESTING_HELP' },
]

const AUTH_TOKEN_KEY = 'mzansibuilds.auth.token'
const AUTH_EMAIL_KEY = 'mzansibuilds.auth.email'
const showApiDebugLabels = import.meta.env.DEV || import.meta.env.VITE_SHOW_API_LABELS === 'true'

function readStoredValue(key: string) {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(key) ?? ''
}

function shortToken(token: string) {
  if (!token) {
    return 'Not signed in'
  }

  return `${token.slice(0, 14)}…${token.slice(-8)}`
}

function resolveErrorMessage(requestError: unknown, fallback: string) {
  if (requestError instanceof Error && requestError.message.trim().length > 0) {
    return requestError.message
  }

  return fallback
}

function App() {
  const [token, setToken] = useState(() => readStoredValue(AUTH_TOKEN_KEY))
  const [authEmail, setAuthEmail] = useState(() => readStoredValue(AUTH_EMAIL_KEY))
  const [status, setStatus] = useState('Register or login to unlock the project workspace.')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerBio, setRegisterBio] = useState('')
  const [registerGithub, setRegisterGithub] = useState('')
  const [registerLinkedin, setRegisterLinkedin] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stage, setStage] = useState<ProjectStage>('IN_PROGRESS')
  const [supportRequired, setSupportRequired] = useState<SupportType>('BACKEND_HELP')

  const [projects, setProjects] = useState<Project[]>([])
  const [celebrations, setCelebrations] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null)
  const [projectSnapshot, setProjectSnapshot] = useState<Project | null>(null)

  const [milestone, setMilestone] = useState('')
  const [milestoneNote, setMilestoneNote] = useState('')
  const [comment, setComment] = useState('')
  const [collaborationMessage, setCollaborationMessage] = useState('')

  const authReady = token.length > 0

  useEffect(() => {
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, token)
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_KEY)
    }
  }, [token])

  useEffect(() => {
    if (authEmail) {
      window.localStorage.setItem(AUTH_EMAIL_KEY, authEmail)
    } else {
      window.localStorage.removeItem(AUTH_EMAIL_KEY)
    }
  }, [authEmail])

  const stats = useMemo(
    () => [
      { label: 'Projects in feed', value: `${projects.length}` },
      { label: 'Celebration wall', value: `${celebrations.length}` },
      { label: 'Session', value: authReady ? 'JWT active' : 'Locked' },
    ],
    [projects.length, celebrations.length, authReady]
  )

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projectSnapshot,
    [projects, activeProjectId, projectSnapshot]
  )

  useEffect(() => {
    if (!projects.length) {
      if (activeProjectId !== null) {
        setActiveProjectId(null)
      }
      return
    }

    if (activeProjectId === null || !projects.some((project) => project.id === activeProjectId)) {
      setActiveProjectId(projects[0].id)
    }
  }, [projects, activeProjectId])

  useEffect(() => {
    if (!token) {
      setProjects([])
      setCelebrations([])
      setProjectSnapshot(null)
      return
    }

    refresh(token).catch((requestError) => {
      setError(requestError instanceof Error ? requestError.message : 'Could not load dashboard data')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const refresh = async (jwt = token) => {
    if (!jwt) {
      return
    }

    const [feed, wall] = await Promise.all([getFeed(jwt), getCelebrationWall(jwt)])
    setProjects(feed)
    setCelebrations(wall)
  }

  const showActionError = (action: string, requestError: unknown, fallback: string) => {
    const details = resolveErrorMessage(requestError, fallback)
    setStatus('')
    setError(`${action} failed: ${details}`)
  }

  const afterAuthSuccess = async (jwt: string, email: string, message: string) => {
    setToken(jwt)
    setAuthEmail(email)
    setStatus(message)
    setError('')
    await refresh(jwt)
  }

  const onLogin = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = await loginUser({ email: loginEmail, password: loginPassword })
      await afterAuthSuccess(payload.token, payload.user.email, `Logged in as ${payload.user.fullName}`)
      setLoginPassword('')
    } catch (requestError) {
      showActionError('Login', requestError, 'Check your email and password and try again.')
    } finally {
      setLoading(false)
    }
  }

  const onRegister = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = await registerUser({
        fullName: registerName,
        email: registerEmail,
        password: registerPassword,
        bio: registerBio,
        githubLink: registerGithub,
        linkedinLink: registerLinkedin,
      })
      setStatus(`Registered ${payload.user.email}. You can login now.`)
      setLoginEmail(registerEmail)
      setLoginPassword(registerPassword)
      setRegisterName('')
      setRegisterEmail('')
      setRegisterPassword('')
      setRegisterBio('')
      setRegisterGithub('')
      setRegisterLinkedin('')
    } catch (requestError) {
      showActionError('Registration', requestError, 'Could not create account.')
    } finally {
      setLoading(false)
    }
  }

  const onCreateProject = async (event: FormEvent) => {
    event.preventDefault()

    if (!authReady) {
      setStatus('')
      setError('You must login before creating a project.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const project = await createProject(token, { title, description, stage, supportRequired })
      await refresh()
      setActiveProjectId(project.id)
      setTitle('')
      setDescription('')
      setStatus(`Project "${project.title}" created successfully.`)
    } catch (requestError) {
      showActionError('Create project', requestError, 'Could not create project.')
    } finally {
      setLoading(false)
    }
  }

  const onCompleteProject = async (projectId: number) => {
    if (!authReady) {
      setStatus('')
      setError('You must login before completing projects.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const project = projects.find((item) => item.id === projectId)
      await completeProject(token, projectId)
      await refresh()
      setStatus(`Project "${project?.title ?? projectId}" moved to the celebration wall.`)
    } catch (requestError) {
      showActionError('Complete project', requestError, 'Could not complete project.')
    } finally {
      setLoading(false)
    }
  }

  const onReloadProject = async () => {
    if (!authReady || activeProjectId === null) {
      setStatus('')
      setError('Select a project and login first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const project = await getProject(token, activeProjectId)
      setProjectSnapshot(project)
      await refresh()
      setStatus(`Project "${project.title}" reloaded from backend.`)
    } catch (requestError) {
      showActionError('Reload project', requestError, 'Could not reload project.')
    } finally {
      setLoading(false)
    }
  }

  const onDeleteProject = async (projectId: number) => {
    if (!authReady) {
      setStatus('')
      setError('You must login before deleting projects.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const project = projects.find((item) => item.id === projectId)
      await deleteProject(token, projectId)
      if (activeProjectId === projectId) {
        setActiveProjectId(null)
        setProjectSnapshot(null)
      }
      await refresh()
      setStatus(`Project "${project?.title ?? projectId}" deleted successfully.`)
    } catch (requestError) {
      showActionError('Delete project', requestError, 'Could not delete project.')
    } finally {
      setLoading(false)
    }
  }

  const onLogout = () => {
    setToken('')
    setAuthEmail('')
    setProjects([])
    setCelebrations([])
    setActiveProjectId(null)
    setProjectSnapshot(null)
    setStatus('Logged out. Register or login again to continue.')
    setError('')
  }

  const onMilestone = async (event: FormEvent) => {
    event.preventDefault()

    if (!authReady || activeProjectId === null) {
      setStatus('')
      setError('Select a project and login first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await addMilestone(token, activeProjectId, { milestone, note: milestoneNote })
      setMilestone('')
      setMilestoneNote('')
      setStatus('Milestone submitted successfully.')
    } catch (requestError) {
      showActionError('Submit milestone', requestError, 'Could not submit milestone.')
    } finally {
      setLoading(false)
    }
  }

  const onComment = async (event: FormEvent) => {
    event.preventDefault()

    if (!authReady || activeProjectId === null) {
      setStatus('')
      setError('Select a project and login first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await addComment(token, activeProjectId, { message: comment })
      setComment('')
      setStatus('Comment posted successfully.')
    } catch (requestError) {
      showActionError('Post comment', requestError, 'Could not post comment.')
    } finally {
      setLoading(false)
    }
  }

  const onRaiseHand = async (event: FormEvent) => {
    event.preventDefault()

    if (!authReady || activeProjectId === null) {
      setStatus('')
      setError('Select a project and login first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await raiseHand(token, activeProjectId, { message: collaborationMessage })
      setCollaborationMessage('')
      setStatus('Collaboration request sent successfully.')
    } catch (requestError) {
      showActionError('Send collaboration request', requestError, 'Could not send collaboration request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar glass">
        <div>
          <span className="eyebrow">MzansiBuilds</span>
          <h1>Modern build tracker for the backend-first challenge</h1>
          <p>
            Register, login, create projects, post updates, comment, raise hands, and move completed work to the
            celebration wall.
          </p>
        </div>

        <div className="topbar-actions">
          <div className="pill-group">
            <span className={`pill ${authReady ? 'pill-success' : 'pill-warn'}`}>
              {authReady ? 'Authenticated' : 'Guest mode'}
            </span>
            {showApiDebugLabels ? <span className="pill">API: {API_BASE}</span> : null}
          </div>

          <div className="session-card">
            <div>
              <small>Session</small>
              <strong>{authEmail || 'No active user'}</strong>
            </div>
            <code>{shortToken(token)}</code>
            {authReady ? (
              <button type="button" className="secondary-btn" onClick={onLogout}>
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <section className="hero glass">
        <div className="hero-copy">
          <span className="eyebrow">Full-stack workspace</span>
          <h2>Fast, polished, and tied exactly to the Spring Boot API.</h2>
          <p>
            The UI now uses the live backend contract for auth, project feed, celebration wall, progress updates,
            comments, collaboration requests, reload, and delete.
          </p>
        </div>

        <div className="stats-grid">
          {stats.map((item) => (
            <article key={item.label} className="metric-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="split-grid">
        <form onSubmit={onLogin} className="glass panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">01 · Login</span>
              <h3>Return to your workspace</h3>
            </div>
            <span className="tiny-chip">JWT</span>
          </div>

          <div className="form-grid">
            <label>
              <span>Email</span>
              <input
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              <span>Password</span>
              <input
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />
            </label>
          </div>

          <button disabled={loading}>Sign in</button>
          <p className="hint">Register first if the account does not exist yet.</p>
        </form>

        <form onSubmit={onRegister} className="glass panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">02 · Register</span>
              <h3>Create a developer profile</h3>
            </div>
            <span className="tiny-chip alt">DB</span>
          </div>

          <div className="form-grid">
            <label>
              <span>Full name</span>
              <input value={registerName} onChange={(e) => setRegisterName(e.target.value)} required />
            </label>
            <label>
              <span>Email</span>
              <input value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} type="email" required />
            </label>
            <label>
              <span>Password</span>
              <input value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} type="password" required />
            </label>
            <label>
              <span>Bio</span>
              <input value={registerBio} onChange={(e) => setRegisterBio(e.target.value)} placeholder="Short intro" />
            </label>
            <label>
              <span>GitHub</span>
              <input value={registerGithub} onChange={(e) => setRegisterGithub(e.target.value)} placeholder="https://github.com/..." />
            </label>
            <label>
              <span>LinkedIn</span>
              <input value={registerLinkedin} onChange={(e) => setRegisterLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
            </label>
          </div>

          <button disabled={loading}>Create account</button>
        </form>
      </section>

      <section className="workspace-grid">
        <div className="glass panel feed-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">03 · Projects</span>
              <h3>Live feed</h3>
            </div>
            <div className="row-gap">
              <button type="button" className="secondary-btn" onClick={() => refresh()} disabled={!authReady || loading}>
                Refresh feed
              </button>
            </div>
          </div>

          <div className="feed-list">
            {projects.length === 0 && <p className="empty-state">No projects in the feed yet. Create the first one.</p>}

            {projects.map((project) => {
              const isActive = activeProjectId === project.id

              return (
                <article
                  key={project.id}
                  className={`feed-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveProjectId(project.id)}
                >
                  <div className="feed-item-top">
                    <div>
                      <h4>{project.title}</h4>
                      <p>{project.description}</p>
                    </div>
                    <span className={`status-badge ${project.completed ? 'done' : 'doing'}`}>
                      {project.completed ? 'Completed' : 'Active'}
                    </span>
                  </div>

                  <div className="chips">
                    <span>{toLabel(project.stage)}</span>
                    <span>{toLabel(project.supportRequired)}</span>
                    <span>Owner: {project.ownerName}</span>
                  </div>

                  <div className="feed-actions">
                    {!project.completed ? (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          void onCompleteProject(project.id)
                        }}
                        disabled={loading}
                      >
                        Mark completed
                      </button>
                    ) : (
                      <span className="mini-note">Already on the celebration wall</span>
                    )}

                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveProjectId(project.id)
                        setProjectSnapshot(project)
                      }}
                    >
                      Inspect
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="glass panel side-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">04 · Inspector</span>
              <h3>Selected project</h3>
            </div>
            <span className="tiny-chip">{selectedProject ? 'Live' : 'Empty'}</span>
          </div>

          {selectedProject ? (
            <div className="project-inspector">
              <div className="project-summary">
                <h4>{selectedProject.title}</h4>
                <p>{selectedProject.description}</p>

                <div className="details-grid">
                  <div>
                    <span>Project ID</span>
                    <strong>{selectedProject.id}</strong>
                  </div>
                  <div>
                    <span>Stage</span>
                    <strong>{toLabel(selectedProject.stage)}</strong>
                  </div>
                  <div>
                    <span>Support</span>
                    <strong>{toLabel(selectedProject.supportRequired)}</strong>
                  </div>
                  <div>
                    <span>Owner</span>
                    <strong>{selectedProject.ownerName}</strong>
                  </div>
                </div>

                <div className="details-grid two-col">
                  <div>
                    <span>Created</span>
                    <strong>{new Date(selectedProject.createdAt).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Updated</span>
                    <strong>{new Date(selectedProject.updatedAt).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="inspector-actions">
                <button type="button" className="secondary-btn" onClick={onReloadProject} disabled={!authReady || loading}>
                  Reload from backend
                </button>
                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => void onDeleteProject(selectedProject.id)}
                  disabled={!authReady || loading}
                >
                  Delete project
                </button>
              </div>

              <form onSubmit={onMilestone} className="subpanel">
                <h4>Add milestone</h4>
                <div className="form-grid single">
                  <label>
                    <span>Milestone</span>
                    <input value={milestone} onChange={(e) => setMilestone(e.target.value)} placeholder="Auth flow" required />
                  </label>
                  <label>
                    <span>Note</span>
                    <textarea
                      value={milestoneNote}
                      onChange={(e) => setMilestoneNote(e.target.value)}
                      rows={3}
                      placeholder="Explain the progress update"
                      required
                    />
                  </label>
                </div>
                <button disabled={loading}>Submit milestone</button>
              </form>

              <form onSubmit={onComment} className="subpanel">
                <h4>Add comment</h4>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Leave a comment" required />
                <button disabled={loading}>Submit comment</button>
              </form>

              <form onSubmit={onRaiseHand} className="subpanel">
                <h4>Raise hand</h4>
                <textarea
                  value={collaborationMessage}
                  onChange={(e) => setCollaborationMessage(e.target.value)}
                  rows={3}
                  placeholder="Offer collaboration help"
                  required
                />
                <button disabled={loading}>Send collaboration request</button>
              </form>
            </div>
          ) : (
            <p className="empty-state">Select a project from the feed to inspect details and run actions.</p>
          )}
        </div>
      </section>

      <section className="glass panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">05 · Create</span>
            <h3>New project</h3>
          </div>
          {showApiDebugLabels ? <span className="tiny-chip alt">POST /api/projects</span> : null}
        </div>

        <form onSubmit={onCreateProject} className="create-grid">
          <label>
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" required />
          </label>

          <label>
            <span>Stage</span>
            <select value={stage} onChange={(e) => setStage(e.target.value as ProjectStage)}>
              {stageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Support required</span>
            <select value={supportRequired} onChange={(e) => setSupportRequired(e.target.value as SupportType)}>
              {supportOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="full-width">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you are building"
              rows={5}
              required
            />
          </label>

          <button disabled={loading} className="create-button">
            Publish project
          </button>
        </form>
      </section>

      <section className="glass panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">06 · Celebration</span>
            <h3>Wall of wins</h3>
          </div>
          {showApiDebugLabels ? <span className="tiny-chip">GET /api/celebration</span> : null}
        </div>

        <div className="celebration-grid">
          {celebrations.length === 0 && <p className="empty-state">No completed projects yet. Finish one to celebrate it here.</p>}
          {celebrations.map((project) => (
            <article key={project.id} className="celebration-card">
              <div className="celebration-top">
                <strong>{project.title}</strong>
                <span>{toLabel(project.stage)}</span>
              </div>
              <p>{project.ownerName}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass status-panel">
        <div>
          <span className="eyebrow">System status</span>
          {status ? <p className="success">{status}</p> : <p className="hint">No recent actions.</p>}
          {error && <p className="error">{error}</p>}
        </div>
        <div className="row-gap wrap">
          <span className="tiny-chip">{loading ? 'Working…' : 'Idle'}</span>
          <span className={`tiny-chip ${authReady ? 'success' : 'warn'}`}>{authReady ? 'Session ready' : 'Login required'}</span>
        </div>
      </section>
    </div>
  )
}

export default App
