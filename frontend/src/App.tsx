import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  addComment,
  addMilestone,
  acceptCollaborationRequest,
  completeProject,
  createProject,
  deleteProject,
  declineCollaborationRequest,
  getCurrentUser,
  getCelebrationWall,
  getFeed,
  getProjectCollaborationRequests,
  getProjectComments,
  getProject,
  getProjectUpdates,
  loginUser,
  raiseHand,
  replyToComment,
  registerUser,
  toLabel,
  updateMyProfile,
} from './api'
import ConfirmModal from './components/ConfirmModal'
import FeedbackModal from './components/FeedbackModal'
import {
  CollaborationRequest,
  DeveloperUser,
  Project,
  ProjectComment,
  ProgressUpdate,
  ProjectStage,
  SupportType,
} from './types'

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
  const [loading, setLoading] = useState(false)
  const [feedbackModal, setFeedbackModal] = useState<{
    kind: 'success' | 'error'
    title: string
    message: string
  } | null>(null)
  const [pendingDeleteProjectId, setPendingDeleteProjectId] = useState<number | null>(null)

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
  const [projectUpdates, setProjectUpdates] = useState<ProgressUpdate[]>([])
  const [projectComments, setProjectComments] = useState<ProjectComment[]>([])
  const [projectCollaborationRequests, setProjectCollaborationRequests] = useState<CollaborationRequest[]>([])

  const [currentUser, setCurrentUser] = useState<DeveloperUser | null>(null)
  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileGithub, setProfileGithub] = useState('')
  const [profileLinkedin, setProfileLinkedin] = useState('')

  const [milestone, setMilestone] = useState('')
  const [milestoneNote, setMilestoneNote] = useState('')
  const [comment, setComment] = useState('')
  const [replyDraftByCommentId, setReplyDraftByCommentId] = useState<Record<number, string>>({})
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

  const pendingDeleteProject = useMemo(
    () => projects.find((project) => project.id === pendingDeleteProjectId) ?? null,
    [projects, pendingDeleteProjectId]
  )

  const rootComments = useMemo(
    () => projectComments.filter((entry) => entry.parentCommentId === null),
    [projectComments]
  )

  const repliesByParentId = useMemo(() => {
    const map: Record<number, ProjectComment[]> = {}
    projectComments
      .filter((entry) => entry.parentCommentId !== null)
      .forEach((entry) => {
        const parentId = entry.parentCommentId as number
        if (!map[parentId]) {
          map[parentId] = []
        }
        map[parentId].push(entry)
      })
    return map
  }, [projectComments])

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
    if (!token || activeProjectId === null) {
      setProjectUpdates([])
      setProjectComments([])
      setProjectCollaborationRequests([])
      return
    }

    loadProjectActivity(activeProjectId, token).catch((requestError) => {
      setFeedbackModal({
        kind: 'error',
        title: 'Project activity failed to load',
        message: resolveErrorMessage(requestError, 'Could not load project activity'),
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId, token])

  useEffect(() => {
    if (!token) {
      setProjects([])
      setCelebrations([])
      setProjectSnapshot(null)
      setProjectUpdates([])
      setProjectComments([])
      setProjectCollaborationRequests([])
      setCurrentUser(null)
      setProfileName('')
      setProfileBio('')
      setProfileGithub('')
      setProfileLinkedin('')
      return
    }

    Promise.all([refresh(token), loadCurrentUser(token)]).catch((requestError) => {
      setFeedbackModal({
        kind: 'error',
        title: 'Dashboard failed to load',
        message: requestError instanceof Error ? requestError.message : 'Could not load dashboard data',
      })
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

  const loadCurrentUser = async (jwt = token) => {
    if (!jwt) {
      return
    }

    const user = await getCurrentUser(jwt)
    setCurrentUser(user)
    setProfileName(user.fullName ?? '')
    setProfileBio(user.bio ?? '')
    setProfileGithub(user.githubLink ?? '')
    setProfileLinkedin(user.linkedinLink ?? '')
  }

  const loadProjectActivity = async (projectId: number, jwt = token) => {
    if (!jwt) {
      return
    }

    const [updates, comments, requests] = await Promise.all([
      getProjectUpdates(jwt, projectId),
      getProjectComments(jwt, projectId),
      getProjectCollaborationRequests(jwt, projectId),
    ])

    setProjectUpdates(updates)
    setProjectComments(comments)
    setProjectCollaborationRequests(requests)
  }

  const showFeedback = (kind: 'success' | 'error', title: string, message: string) => {
    setFeedbackModal({ kind, title, message })
  }

  const showActionError = (action: string, requestError: unknown, fallback: string) => {
    const details = resolveErrorMessage(requestError, fallback)
    showFeedback('error', `${action} failed`, details)
  }

  const afterAuthSuccess = async (jwt: string, email: string, message: string) => {
    setToken(jwt)
    setAuthEmail(email)
    showFeedback('success', 'Authentication successful', message)
    await refresh(jwt)
  }

  const onLogin = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)

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

    try {
      const payload = await registerUser({
        fullName: registerName,
        email: registerEmail,
        password: registerPassword,
        bio: registerBio,
        githubLink: registerGithub,
        linkedinLink: registerLinkedin,
      })
      showFeedback('success', 'Registration successful', `Registered ${payload.user.email}. You can login now.`)
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
      showFeedback('error', 'Create project blocked', 'You must login before creating a project.')
      return
    }

    setLoading(true)

    try {
      const project = await createProject(token, { title, description, stage, supportRequired })
      await refresh()
      setActiveProjectId(project.id)
      setTitle('')
      setDescription('')
      showFeedback('success', 'Project created', `Project "${project.title}" created successfully.`)
    } catch (requestError) {
      showActionError('Create project', requestError, 'Could not create project.')
    } finally {
      setLoading(false)
    }
  }

  const onCompleteProject = async (projectId: number) => {
    if (!authReady) {
      showFeedback('error', 'Complete project blocked', 'You must login before completing projects.')
      return
    }

    setLoading(true)

    try {
      const project = projects.find((item) => item.id === projectId)
      await completeProject(token, projectId)
      await refresh()
      showFeedback('success', 'Project completed', `Project "${project?.title ?? projectId}" moved to the celebration wall.`)
    } catch (requestError) {
      showActionError('Complete project', requestError, 'Could not complete project.')
    } finally {
      setLoading(false)
    }
  }

  const onReloadProject = async () => {
    if (!authReady || activeProjectId === null) {
      showFeedback('error', 'Reload blocked', 'Select a project and login first.')
      return
    }

    setLoading(true)

    try {
      const project = await getProject(token, activeProjectId)
      setProjectSnapshot(project)
      await loadProjectActivity(project.id)
      await refresh()
      showFeedback('success', 'Project reloaded', `Project "${project.title}" reloaded from backend.`)
    } catch (requestError) {
      showActionError('Reload project', requestError, 'Could not reload project.')
    } finally {
      setLoading(false)
    }
  }

  const onDeleteProject = async (projectId: number) => {
    if (!authReady) {
      showFeedback('error', 'Delete project blocked', 'You must login before deleting projects.')
      return
    }

    setLoading(true)

    try {
      const project = projects.find((item) => item.id === projectId)
      await deleteProject(token, projectId)
      if (activeProjectId === projectId) {
        setActiveProjectId(null)
        setProjectSnapshot(null)
      }
      await refresh()
      showFeedback('success', 'Project deleted', `Project "${project?.title ?? projectId}" deleted successfully.`)
    } catch (requestError) {
      showActionError('Delete project', requestError, 'Could not delete project.')
    } finally {
      setLoading(false)
    }
  }

  const openDeleteConfirmation = (projectId: number) => {
    if (!authReady) {
      showFeedback('error', 'Delete project blocked', 'You must login before deleting projects.')
      return
    }

    setPendingDeleteProjectId(projectId)
  }

  const confirmDeleteProject = async () => {
    if (pendingDeleteProjectId === null) {
      return
    }

    const projectId = pendingDeleteProjectId
    setPendingDeleteProjectId(null)
    await onDeleteProject(projectId)
  }

  const onLogout = () => {
    setToken('')
    setAuthEmail('')
    setProjects([])
    setCelebrations([])
    setActiveProjectId(null)
    setProjectSnapshot(null)
    setProjectUpdates([])
    setProjectComments([])
    setProjectCollaborationRequests([])
    setCurrentUser(null)
    setProfileName('')
    setProfileBio('')
    setProfileGithub('')
    setProfileLinkedin('')
    showFeedback('success', 'Logged out', 'You have been logged out. Register or login again to continue.')
  }

  const onMilestone = async (event: FormEvent) => {
    event.preventDefault()

    if (!authReady || activeProjectId === null) {
      showFeedback('error', 'Submit milestone blocked', 'Select a project and login first.')
      return
    }

    setLoading(true)

    try {
      await addMilestone(token, activeProjectId, { milestone, note: milestoneNote })
      await loadProjectActivity(activeProjectId)
      setMilestone('')
      setMilestoneNote('')
      showFeedback('success', 'Milestone submitted', 'Milestone submitted successfully.')
    } catch (requestError) {
      showActionError('Submit milestone', requestError, 'Could not submit milestone.')
    } finally {
      setLoading(false)
    }
  }

  const onComment = async (event: FormEvent) => {
    event.preventDefault()

    if (!authReady || activeProjectId === null) {
      showFeedback('error', 'Comment blocked', 'Select a project and login first.')
      return
    }

    setLoading(true)

    try {
      await addComment(token, activeProjectId, { message: comment })
      await loadProjectActivity(activeProjectId)
      setComment('')
      showFeedback('success', 'Comment posted', 'Comment posted successfully.')
    } catch (requestError) {
      showActionError('Post comment', requestError, 'Could not post comment.')
    } finally {
      setLoading(false)
    }
  }

  const onRaiseHand = async (event: FormEvent) => {
    event.preventDefault()

    if (!authReady || activeProjectId === null) {
      showFeedback('error', 'Raise hand blocked', 'Select a project and login first.')
      return
    }

    if (selectedProject?.ownerId === authEmail) {
      showFeedback('error', 'Raise hand blocked', 'You cannot raise a collaboration request on your own project.')
      return
    }

    setLoading(true)

    try {
      await raiseHand(token, activeProjectId, { message: collaborationMessage })
      await loadProjectActivity(activeProjectId)
      setCollaborationMessage('')
      showFeedback('success', 'Collaboration request sent', 'Collaboration request sent successfully.')
    } catch (requestError) {
      showActionError('Send collaboration request', requestError, 'Could not send collaboration request.')
    } finally {
      setLoading(false)
    }
  }

  const onReplyToComment = async (event: FormEvent, parentCommentId: number) => {
    event.preventDefault()

    if (!authReady || activeProjectId === null || !selectedProject) {
      showFeedback('error', 'Reply blocked', 'Select a project and login first.')
      return
    }

    const parentComment = rootComments.find((entry) => entry.id === parentCommentId)
    if (!parentComment) {
      showFeedback('error', 'Reply blocked', 'Comment thread was not found.')
      return
    }

    const canReply = authEmail === selectedProject.ownerId || authEmail === parentComment.authorId
    if (!canReply) {
      showFeedback('error', 'Reply blocked', 'Only the project owner or original commenter can reply in this thread.')
      return
    }

    const message = (replyDraftByCommentId[parentCommentId] ?? '').trim()
    if (!message) {
      showFeedback('error', 'Reply blocked', 'Reply message cannot be empty.')
      return
    }

    setLoading(true)
    try {
      await replyToComment(token, activeProjectId, parentCommentId, { message })
      await loadProjectActivity(activeProjectId)
      setReplyDraftByCommentId((current) => ({ ...current, [parentCommentId]: '' }))
      showFeedback('success', 'Reply posted', 'Reply posted successfully.')
    } catch (requestError) {
      showActionError('Reply to comment', requestError, 'Could not post reply.')
    } finally {
      setLoading(false)
    }
  }

  const onDecideCollaborationRequest = async (requestId: number, decision: 'accept' | 'decline') => {
    if (!authReady || activeProjectId === null || !selectedProject) {
      showFeedback('error', 'Decision blocked', 'Select a project and login first.')
      return
    }

    if (authEmail !== selectedProject.ownerId) {
      showFeedback('error', 'Decision blocked', 'Only the project owner can decide collaboration requests.')
      return
    }

    setLoading(true)
    try {
      if (decision === 'accept') {
        await acceptCollaborationRequest(token, activeProjectId, requestId)
      } else {
        await declineCollaborationRequest(token, activeProjectId, requestId)
      }
      await loadProjectActivity(activeProjectId)
      showFeedback('success', 'Request updated', `Collaboration request ${decision === 'accept' ? 'accepted' : 'declined'} successfully.`)
    } catch (requestError) {
      showActionError('Update collaboration request', requestError, 'Could not update collaboration request.')
    } finally {
      setLoading(false)
    }
  }

  const onUpdateProfile = async (event: FormEvent) => {
    event.preventDefault()

    if (!authReady) {
      showFeedback('error', 'Update profile blocked', 'You must login before updating your profile.')
      return
    }

    setLoading(true)

    try {
      const user = await updateMyProfile(token, {
        fullName: profileName,
        bio: profileBio,
        githubLink: profileGithub,
        linkedinLink: profileLinkedin,
      })
      setCurrentUser(user)
      showFeedback('success', 'Profile updated', 'Profile updated successfully.')
    } catch (requestError) {
      showActionError('Update profile', requestError, 'Could not update profile.')
    } finally {
      setLoading(false)
    }
  }

  const onRefreshFeed = async () => {
    if (!authReady) {
      showFeedback('error', 'Refresh blocked', 'You must login first to refresh the feed.')
      return
    }
    setLoading(true)
    try {
      await refresh()
      showFeedback('success', 'Feed refreshed', 'Feed refreshed successfully.')
    } catch (requestError) {
      showActionError('Refresh feed', requestError, 'Could not refresh feed.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="app-shell">
      <FeedbackModal
        open={feedbackModal !== null}
        kind={feedbackModal?.kind ?? 'success'}
        title={feedbackModal?.title ?? ''}
        message={feedbackModal?.message ?? ''}
        onClose={() => setFeedbackModal(null)}
      />
      <ConfirmModal
        open={pendingDeleteProjectId !== null}
        title={`Delete project ${pendingDeleteProject?.title ? `“${pendingDeleteProject.title}”` : ''}?`}
        message="This action cannot be undone. The project will be removed from the feed, activity lists, and the inspector."
        confirmLabel="Delete project"
        cancelLabel="Cancel"
        onConfirm={() => {
          void confirmDeleteProject()
        }}
        onCancel={() => setPendingDeleteProjectId(null)}
      />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar glass">
        <div>
          <span className="eyebrow">MzansiBuilds</span>
          <h1>Build in public with a clean green workspace</h1>
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
          <h2>Green, white, and black UI connected to the live Spring Boot API.</h2>
          <p>
            Use one flow from start to finish: register, login, publish projects, post progress, collaborate, and
            celebrate completions.
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


      {!authReady ? (
        <section className="split-grid">
          <form onSubmit={onLogin} className="glass panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">01 · Login</span>
                <h3>Sign in to continue building</h3>
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
                <h3>Create your developer account</h3>
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
      ) : (
        <section className="glass panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">01 · Auth</span>
              <h3>You are signed in</h3>
            </div>
            <span className="tiny-chip success">Session active</span>
          </div>
          <p className="hint">Login and registration forms are hidden while your session is active.</p>
        </section>
      )}

      <section className="glass panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">03 · Account</span>
            <h3>Manage your profile</h3>
          </div>
        </div>

        {currentUser ? (
          <form onSubmit={onUpdateProfile} className="form-grid">
            <label>
              <span>Full name</span>
              <input value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
            </label>
            <label>
              <span>Email (from session)</span>
              <input value={currentUser.email} readOnly disabled />
            </label>
            <label>
              <span>Bio</span>
              <input value={profileBio} onChange={(e) => setProfileBio(e.target.value)} placeholder="Tell other devs what you build" />
            </label>
            <label>
              <span>GitHub</span>
              <input value={profileGithub} onChange={(e) => setProfileGithub(e.target.value)} placeholder="https://github.com/..." />
            </label>
            <label>
              <span>LinkedIn</span>
              <input value={profileLinkedin} onChange={(e) => setProfileLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
            </label>
            <div>
              <button disabled={!authReady || loading}>Save profile</button>
            </div>
          </form>
        ) : (
          <p className="empty-state">Login to load and manage your profile information.</p>
        )}
      </section>

      <section className="workspace-grid">
        <div className="glass panel feed-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">04 · Projects</span>
              <h3>Developer feed</h3>
            </div>
            <div className="row-gap">
              <button type="button" className="secondary-btn" onClick={() => void onRefreshFeed()} disabled={!authReady || loading}>
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
              <span className="eyebrow">05 · Inspector</span>
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
                  onClick={() => openDeleteConfirmation(selectedProject.id)}
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

              <div className="subpanel">
                <h4>Milestone history</h4>
                {projectUpdates.length === 0 ? (
                  <p className="empty-state">No milestones yet.</p>
                ) : (
                  projectUpdates.map((update) => (
                    <p key={update.id} className="mini-note">
                      <strong>{update.milestone}</strong> - {update.note}
                    </p>
                  ))
                )}
              </div>

              <div className="subpanel">
                <h4>Comment history</h4>
                {projectComments.length === 0 ? (
                  <p className="empty-state">No comments yet.</p>
                ) : (
                  rootComments.map((entry) => {
                    const replies = repliesByParentId[entry.id] ?? []
                    const canReply = authReady && selectedProject
                      ? authEmail === selectedProject.ownerId || authEmail === entry.authorId
                      : false

                    return (
                      <div key={entry.id} className="comment-thread">
                        <p className="mini-note">
                          <strong>{entry.authorId}</strong>: {entry.message}
                        </p>
                        {replies.map((reply) => (
                          <p key={reply.id} className="mini-note reply-note">
                            <strong>{reply.authorId}</strong>: {reply.message}
                          </p>
                        ))}
                        {canReply ? (
                          <form className="inline-reply-form" onSubmit={(event) => void onReplyToComment(event, entry.id)}>
                            <textarea
                              value={replyDraftByCommentId[entry.id] ?? ''}
                              onChange={(event) => {
                                const value = event.target.value
                                setReplyDraftByCommentId((current) => ({ ...current, [entry.id]: value }))
                              }}
                              rows={2}
                              placeholder="Reply in this thread"
                              required
                            />
                            <button disabled={loading}>Reply</button>
                          </form>
                        ) : null}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="subpanel">
                <h4>Collaboration requests</h4>
                {projectCollaborationRequests.length === 0 ? (
                  <p className="empty-state">No collaboration requests yet.</p>
                ) : (
                  projectCollaborationRequests.map((entry) => (
                    <div key={entry.id} className="request-thread">
                      <p className="mini-note">
                        <strong>{entry.requesterId}</strong>: {entry.message} ({entry.status})
                      </p>
                      {selectedProject?.ownerId === authEmail && entry.status === 'OPEN' ? (
                        <div className="row-gap">
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => void onDecideCollaborationRequest(entry.id, 'accept')}
                            disabled={loading}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="danger-btn"
                            onClick={() => void onDecideCollaborationRequest(entry.id, 'decline')}
                            disabled={loading}
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p className="empty-state">Select a project from the feed to inspect details and run actions.</p>
          )}
        </div>
      </section>

      <section className="glass panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">06 · Create</span>
              <h3>Publish a new project</h3>
          </div>
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
            <span className="eyebrow">07 · Celebration</span>
            <h3>Celebration wall</h3>
          </div>
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
    </div>
  )
}

export default App
