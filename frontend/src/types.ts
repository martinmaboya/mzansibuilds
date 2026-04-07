export type ProjectStage = 'IDEA' | 'PLANNING' | 'IN_PROGRESS' | 'TESTING' | 'COMPLETED'

export type SupportType =
  | 'NONE'
  | 'FEEDBACK'
  | 'FRONTEND_HELP'
  | 'BACKEND_HELP'
  | 'UI_UX_HELP'
  | 'TESTING_HELP'

export type DeveloperUser = {
  id: number
  fullName: string
  email: string
  bio?: string
  githubLink?: string
  linkedinLink?: string
}

export type Project = {
  id: number
  ownerId: string
  ownerName: string
  title: string
  description: string
  stage: ProjectStage
  supportRequired: SupportType
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type ProgressUpdate = {
  id: number
  projectId: number
  authorId: string
  milestone: string
  note: string
  createdAt: string
}

export type ProjectComment = {
  id: number
  projectId: number
  authorId: string
  parentCommentId: number | null
  message: string
  createdAt: string
}

export type CollaborationRequest = {
  id: number
  projectId: number
  requesterId: string
  message: string
  status: 'OPEN' | 'ACCEPTED' | 'DECLINED' | string
  createdAt: string
}
