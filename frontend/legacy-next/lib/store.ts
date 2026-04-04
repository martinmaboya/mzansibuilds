import { CollaborationRequest, Project, ProjectComment, ProgressUpdate } from './types'

const now = () => new Date().toISOString()

const projects: Project[] = [
  {
    id: 'project_1',
    ownerId: 'user_1',
    ownerName: 'Martin Maboya',
    title: 'MzansiBuilds',
    description: 'Public build tracker for the Derivco Code Skills Quest.',
    stage: 'In Progress',
    supportRequired: 'Backend help',
    completed: false,
    createdAt: now(),
    updatedAt: now(),
  },
]

const progressUpdates: ProgressUpdate[] = []
const comments: ProjectComment[] = []
const collaborationRequests: CollaborationRequest[] = []

export const store = {
  projects,
  progressUpdates,
  comments,
  collaborationRequests,
}
