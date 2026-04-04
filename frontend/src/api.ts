import {
  CollaborationRequest,
  DeveloperUser,
  Project,
  ProjectComment,
  ProgressUpdate,
  ProjectStage,
  SupportType,
} from './types'

const envBase = import.meta.env.VITE_API_BASE_URL?.trim()
const fallbackBase = 'http://localhost:8085'

export const API_BASE = envBase && envBase.length > 0 ? envBase.replace(/\/$/, '') : fallbackBase

type RequestOptions = RequestInit & {
  token?: string
}

function getDefaultErrorMessage(status: number) {
  switch (status) {
    case 400:
      return 'Invalid request. Please check the form and try again.'
    case 401:
      return 'Your session is not authorized. Please login again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'Requested resource was not found.'
    case 409:
      return 'This action conflicts with existing data.'
    case 500:
      return 'Server error. Please try again shortly.'
    default:
      return 'Request failed'
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const hasBody = options.body !== undefined && options.body !== null

  if (hasBody) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  let response: Response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error('Network error. Ensure backend is running and reachable.')
  }

  const raw = await response.text()
  const contentType = response.headers.get('content-type') ?? ''
  let payload: unknown = null

  if (raw.length > 0) {
    if (contentType.includes('application/json')) {
      try {
        payload = JSON.parse(raw)
      } catch {
        payload = null
      }
    } else {
      payload = raw
    }
  }

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null
      ? (payload as { message?: string; error?: string }).message
        || (payload as { message?: string; error?: string }).error
        || getDefaultErrorMessage(response.status)
      : typeof payload === 'string' && payload.length > 0
        ? payload
        : getDefaultErrorMessage(response.status)
    throw new Error(message)
  }

  return payload as T
}

export function toLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase())
}

export async function registerUser(body: {
  fullName: string
  email: string
  password: string
  bio?: string
  githubLink?: string
  linkedinLink?: string
}) {
  return request<{ status: number; user: DeveloperUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function loginUser(body: { email: string; password: string }) {
  return request<{ token: string; tokenType: string; user: DeveloperUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function getFeed(token: string) {
  return request<Project[]>('/api/feed', { token })
}

export async function getCelebrationWall(token: string) {
  return request<Project[]>('/api/celebration', { token })
}

export async function createProject(
  token: string,
  body: {
    title: string
    description: string
    stage: ProjectStage
    supportRequired: SupportType
  }
) {
  return request<Project>('/api/projects', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export async function getProject(token: string, projectId: number) {
  return request<Project>(`/api/projects/${projectId}`, { token })
}

export async function completeProject(token: string, projectId: number) {
  return request<Project>(`/api/projects/${projectId}/complete`, {
    method: 'PATCH',
    token,
  })
}

export async function deleteProject(token: string, projectId: number) {
  return request<void>(`/api/projects/${projectId}`, {
    method: 'DELETE',
    token,
  })
}

export async function addMilestone(
  token: string,
  projectId: number,
  body: { milestone: string; note: string }
) {
  return request<ProgressUpdate>(`/api/projects/${projectId}/updates`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export async function addComment(token: string, projectId: number, body: { message: string }) {
  return request<ProjectComment>(`/api/projects/${projectId}/comments`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export async function raiseHand(token: string, projectId: number, body: { message: string }) {
  return request<CollaborationRequest>(`/api/projects/${projectId}/raise-hand`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}
