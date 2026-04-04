export type ProjectStage = 'Idea' | 'Planning' | 'In Progress' | 'Testing' | 'Completed'

export type SupportType = 'None' | 'Feedback' | 'Frontend help' | 'Backend help' | 'UI/UX help' | 'Testing help'

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
  status: 'Open' | 'Accepted' | 'Declined'
  createdAt: string
}
