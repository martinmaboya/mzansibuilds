export type ProjectStage = 'IDEA' | 'PLANNING' | 'IN_PROGRESS' | 'TESTING' | 'COMPLETED'

export type SupportType =
  | 'NONE'
  | 'FEEDBACK'
  | 'FRONTEND_HELP'
  | 'BACKEND_HELP'
  | 'UI_UX_HELP'
  | 'TESTING_HELP'

export type DeveloperUser = {
  id: string
  fullName: string
  email: string
  bio?: string
  githubLink?: string
  linkedinLink?: string
}

export type Project = {
  id: string
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
  id: string
  projectId: string
  authorId: string
  milestone: string
  note: string
  createdAt: string
}

export type ProjectComment = {
  id: string
  projectId: string
  authorId: string
  message: string
  createdAt: string
}

export type CollaborationRequest = {
  id: string
  projectId: string
  requesterId: string
  message: string
  status: 'OPEN' | 'ACCEPTED' | 'DECLINED' | string
  createdAt: string
}
