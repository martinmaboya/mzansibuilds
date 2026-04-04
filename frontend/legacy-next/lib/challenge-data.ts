export const competencies = [
  'Project Profiling',
  'Code Version Control',
  'Test-Driven Development',
  'Secure By Design',
  'Documentation',
  'Ethical Use of AI',
]

export const projectStages = ['Idea', 'Planning', 'In Progress', 'Testing', 'Completed']

export const supportTypes = ['None', 'Feedback', 'Frontend help', 'Backend help', 'UI/UX help', 'Testing help']

export const feedItems = [
  {
    developer: 'Nandi',
    project: 'BuildTrack',
    stage: 'In Progress',
    supportRequired: 'Frontend help',
    update: 'Finished the account onboarding flow and added validation to the project form.',
    time: '12 min ago',
  },
  {
    developer: 'Lebo',
    project: 'TutorLink',
    stage: 'Testing',
    supportRequired: 'Feedback',
    update: 'Polishing the live feed cards before pushing the release candidate.',
    time: '28 min ago',
  },
  {
    developer: 'Aisha',
    project: 'GreenSprint',
    stage: 'Completed',
    supportRequired: 'None',
    update: 'Moved the project to the Celebration Wall after final QA passed.',
    time: '52 min ago',
  },
]

export const celebrationWall = [
  {
    developer: 'Aisha',
    project: 'GreenSprint',
    date: '02 Apr 2026',
    note: 'A clean product launch with secure sign-in and milestone tracking.',
  },
  {
    developer: 'Nandi',
    project: 'BuildTrack',
    date: '01 Apr 2026',
    note: 'Delivered an organized MVP with progress updates and collaboration requests.',
  },
]

export const sampleProjects = [
  {
    title: 'MzansiBuilds',
    stage: 'In Progress',
    supportRequired: 'Backend help',
    milestones: ['Auth flow', 'Project feed', 'Celebration wall'],
  },
  {
    title: 'Open Ledger',
    stage: 'Testing',
    supportRequired: 'Feedback',
    milestones: ['Dashboard', 'Audit logs', 'Invite flow'],
  },
]

export const aiDisclosure = [
  'AI was used for brainstorming, planning, and code review suggestions.',
  'Final implementation choices, debugging, and testing were done by the developer.',
  'No assessment requirement was bypassed with AI-generated work.',
]
