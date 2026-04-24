export interface SkillTag {
  name: string
  category: 'technical' | 'business' | 'experience'
}

export interface ParsedJD {
  skills: SkillTag[]
  summary: string
  level: string
}

export type QuestionType = 'single-choice' | 'multiple-choice' | 'true-false' | 'short-answer' | 'coding'

export interface ChoiceOption {
  label: string
  text: string
}

export interface Question {
  id: string
  type: QuestionType
  question: string
  options?: ChoiceOption[]
  codeSnippet?: string
  difficulty: 'easy' | 'medium' | 'hard'
  skillTag: string
  points: number
}

export interface UserAnswer {
  questionId: string
  answer: string
  selectedOptions?: string[]
}

export interface EvaluationResult {
  questionId: string
  score: number
  maxScore: number
  feedback: string
  keyPoints: string[]
  blindSpots: string[]
}

export interface RadarDataPoint {
  skill: string
  score: number
  fullMark: number
}

export interface InterviewSession {
  jd: string
  parsedJD: ParsedJD | null
  questions: Question[]
  answers: UserAnswer[]
  evaluations: EvaluationResult[]
  radarData: RadarDataPoint[]
  totalScore: number
  currentStep: 'idle' | 'parsing' | 'generating' | 'practicing' | 'evaluating' | 'result'
  currentQuestionIndex: number
}

export interface WorkExperience {
  id: string
  company: string
  role: string
  duration: string
  description: string
}

export interface ProjectExperience {
  id: string
  name: string
  techStack: string
  description: string
  highlights: string
}

export interface UserProfile {
  name: string
  title: string
  email: string
  phone: string
  location: string
  summary: string
  skills: string[]
  education: string
  workExperience: WorkExperience[]
  projects: ProjectExperience[]
  avatarUrl?: string
}

export interface SkillGap {
  skill: string
  status: 'matched' | 'partial' | 'missing'
  suggestion: string
}

export interface ResumeData {
  content: string
  skillGaps: SkillGap[]
  matchScore: number
  suggestions: string[]
}

export interface ResumeVersion {
  id: string
  content: string
  createdAt: number
  label: string
}

export type AppModule = 'interview' | 'resume' | 'mock-interview' | 'dashboard' | 'jd-analysis'

export interface JDAnalysisOverview {
  title: string
  level: string
  summary: string
  keyRequirements: string[]
}

export interface JDAnalysisSkills {
  required: { name: string; description: string }[]
  bonus: { name: string; description: string }[]
  hidden: { keyword: string; meaning: string }[]
}

export interface JDAnalysisHiddenMessage {
  phrase: string
  interpretation: string
  advice: string
}

export interface JDAnalysisCompetitiveness {
  difficulty: number
  scarcity: number
  analysis: string
}

export interface JDAnalysisInterviewStrategy {
  focusAreas: { area: string; reason: string }[]
  highFreqTopics: string[]
  preparationTips: string[]
}

export interface JDAnalysisLearningPath {
  stage: string
  skills: string[]
  estimatedTime: string
  resources: string
}

export interface JDAnalysis {
  overview: JDAnalysisOverview
  skills: JDAnalysisSkills
  hiddenMessages: JDAnalysisHiddenMessage[]
  competitiveness: JDAnalysisCompetitiveness
  interviewStrategy: JDAnalysisInterviewStrategy
  learningPath: JDAnalysisLearningPath[]
}

export interface MockQuestion {
  id: string
  question: string
  type: 'behavioral' | 'technical' | 'scenario'
}

export interface MockAnswer {
  questionId: string
  answer: string
  timestamp: number
}

export interface MockInterviewSession {
  jdRecordId: string
  questions: MockQuestion[]
  answers: MockAnswer[]
  currentQuestionIndex: number
  status: 'idle' | 'in-progress' | 'finished'
  feedback: string
}

export interface JDRecord {
  id: string
  title: string
  jd: string
  parsedJD: ParsedJD | null
  createdAt: number
  updatedAt: number
  interview: {
    questions: Question[]
    answers: UserAnswer[]
    evaluations: EvaluationResult[]
    radarData: RadarDataPoint[]
    totalScore: number
    currentQuestionIndex: number
    currentStep: 'idle' | 'parsing' | 'generating' | 'practicing' | 'evaluating' | 'result'
  }
  resume: {
    data: ResumeData | null
    versions: ResumeVersion[]
  }
  mockInterview: MockInterviewSession | null
  jdAnalysis: JDAnalysis | null
}

export interface LLMConfig {
  apiKey: string
  baseURL: string
  model: string
}
