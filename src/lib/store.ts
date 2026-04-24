import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ParsedJD,
  Question,
  UserAnswer,
  EvaluationResult,
  RadarDataPoint,
  UserProfile,
  ResumeData,
  ResumeVersion,
  WorkExperience,
  ProjectExperience,
  AppModule,
  LLMConfig,
  JDRecord,
  JDAnalysis,
  MockQuestion,
  MockAnswer,
  MockInterviewSession,
} from './types'

interface Store {
  hasEntered: boolean
  jdRecords: JDRecord[]
  activeJDId: string | null
  activeModule: AppModule
  llmConfig: LLMConfig
  theme: 'light' | 'dark' | 'system'
  userProfile: UserProfile
  resumeStep: 'profile' | 'generating' | 'preview'
  resumeVersions: ResumeVersion[]

  setHasEntered: (entered: boolean) => void
  createJDRecord: (jd: string, title?: string) => void
  selectJDRecord: (id: string | null) => void
  deleteJDRecord: (id: string) => void
  updateJDTitle: (id: string, title: string) => void

  setActiveModule: (module: AppModule) => void

  setJD: (jd: string) => void
  setParsedJD: (parsed: ParsedJD) => void
  setQuestions: (questions: Question[]) => void
  setStep: (step: JDRecord['interview']['currentStep']) => void
  setAnswer: (answer: UserAnswer) => void
  setEvaluations: (evaluations: EvaluationResult[]) => void
  setRadarData: (data: RadarDataPoint[]) => void
  setTotalScore: (score: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  setCurrentQuestionIndex: (index: number) => void
  resetInterview: () => void

  setResumeData: (data: ResumeData) => void
  setResumeStep: (step: 'profile' | 'generating' | 'preview') => void
  addResumeVersion: (content: string, label?: string) => void
  restoreResumeVersion: (versionId: string) => void
  removeResumeVersion: (versionId: string) => void

  setUserProfile: (profile: Partial<UserProfile>) => void
  addWorkExperience: (exp: WorkExperience) => void
  removeWorkExperience: (id: string) => void
  updateWorkExperience: (id: string, exp: Partial<WorkExperience>) => void
  addProject: (project: ProjectExperience) => void
  removeProject: (id: string) => void
  updateProject: (id: string, project: Partial<ProjectExperience>) => void
  resetResume: () => void

  setMockQuestions: (questions: MockQuestion[]) => void
  setMockAnswer: (answer: MockAnswer) => void
  setMockCurrentIndex: (index: number) => void
  setMockStatus: (status: MockInterviewSession['status']) => void
  setMockFeedback: (feedback: string) => void
  resetMockInterview: () => void

  setJDAnalysis: (analysis: JDAnalysis) => void
  resetJDAnalysis: () => void

  setLLMConfig: (config: Partial<LLMConfig>) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  resetLLMConfig: () => void
}

const initialUserProfile: UserProfile = {
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  skills: [],
  education: '',
  workExperience: [],
  projects: [],
}

const initialLLMConfig: LLMConfig = {
  apiKey: '',
  baseURL: '',
  model: 'doubao-seed-2-0-lite-260215',
}

const emptyInterview = {
  questions: [],
  answers: [],
  evaluations: [],
  radarData: [],
  totalScore: 0,
  currentQuestionIndex: 0,
  currentStep: 'idle' as const,
}

function createEmptyJD(jd: string, title: string): JDRecord {
  const now = Date.now()
  return {
    id: `jd_${now}_${Math.random().toString(36).substring(2, 9)}`,
    title,
    jd,
    parsedJD: null,
    createdAt: now,
    updatedAt: now,
    interview: { ...emptyInterview },
    resume: { data: null, versions: [] },
    mockInterview: null,
    jdAnalysis: null,
  }
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      hasEntered: false,
      jdRecords: [],
      activeJDId: null,
      activeModule: 'interview',
      llmConfig: initialLLMConfig,
      theme: 'dark',
      userProfile: initialUserProfile,
      resumeStep: 'profile',
      resumeVersions: [],

      setHasEntered: (hasEntered) => set({ hasEntered }),

      createJDRecord: (jd, title) => {
        const defaultTitle = title || jd.substring(0, 50).replace(/\n/g, ' ')
        const record = createEmptyJD(jd, defaultTitle)
        set((state) => ({
          jdRecords: [record, ...state.jdRecords],
          activeJDId: record.id,
          activeModule: 'jd-analysis',
        }))
      },

      selectJDRecord: (id) => set({ activeJDId: id, activeModule: 'jd-analysis' }),

      deleteJDRecord: (id) =>
        set((state) => ({
          jdRecords: state.jdRecords.filter((r) => r.id !== id),
          activeJDId: state.activeJDId === id ? null : state.activeJDId,
        })),

      updateJDTitle: (id, title) =>
        set((state) => ({
          jdRecords: state.jdRecords.map((r) =>
            r.id === id ? { ...r, title, updatedAt: Date.now() } : r
          ),
        })),

      setActiveModule: (module) => set({ activeModule: module }),

      getActiveRecord: () => {
        const state = get()
        return state.jdRecords.find((r) => r.id === state.activeJDId) || null
      },

      setJD: (jd) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId ? { ...r, jd, updatedAt: Date.now() } : r
            ),
          }
        }),

      setParsedJD: (parsedJD) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId
                ? { ...r, parsedJD, updatedAt: Date.now() }
                : r
            ),
          }
        }),

      setQuestions: (questions) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId
                ? { ...r, interview: { ...r.interview, questions }, updatedAt: Date.now() }
                : r
            ),
          }
        }),

      setStep: (currentStep) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId
                ? { ...r, interview: { ...r.interview, currentStep }, updatedAt: Date.now() }
                : r
            ),
          }
        }),

      setAnswer: (answer) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) => {
              if (r.id !== state.activeJDId) return r
              const existing = r.interview.answers.findIndex((a) => a.questionId === answer.questionId)
              const newAnswers = [...r.interview.answers]
              if (existing >= 0) {
                newAnswers[existing] = answer
              } else {
                newAnswers.push(answer)
              }
              return { ...r, interview: { ...r.interview, answers: newAnswers } }
            }),
          }
        }),

      setEvaluations: (evaluations) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId
                ? { ...r, interview: { ...r.interview, evaluations }, updatedAt: Date.now() }
                : r
            ),
          }
        }),

      setRadarData: (radarData) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId
                ? { ...r, interview: { ...r.interview, radarData }, updatedAt: Date.now() }
                : r
            ),
          }
        }),

      setTotalScore: (totalScore) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId
                ? { ...r, interview: { ...r.interview, totalScore }, updatedAt: Date.now() }
                : r
            ),
          }
        }),

      nextQuestion: () =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) => {
              if (r.id !== state.activeJDId) return r
              const record = r
              return {
                ...record,
                interview: {
                  ...record.interview,
                  currentQuestionIndex: Math.min(record.interview.currentQuestionIndex + 1, record.interview.questions.length - 1),
                },
              }
            }),
          }
        }),

      prevQuestion: () =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) => {
              if (r.id !== state.activeJDId) return r
              return {
                ...r,
                interview: {
                  ...r.interview,
                  currentQuestionIndex: Math.max(r.interview.currentQuestionIndex - 1, 0),
                },
              }
            }),
          }
        }),

      setCurrentQuestionIndex: (currentQuestionIndex) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId
                ? { ...r, interview: { ...r.interview, currentQuestionIndex } }
                : r
            ),
          }
        }),

      resetInterview: () =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId
                ? { ...r, interview: { ...emptyInterview }, updatedAt: Date.now() }
                : r
            ),
          }
        }),

      setResumeData: (data) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) => {
              if (r.id !== state.activeJDId) return r
              const currentContent = r.resume.data?.content || ''
              if (currentContent && currentContent !== data.content) {
                const now = Date.now()
                const versionLabel = `版本 ${r.resume.versions.length + 1} — ${new Date(now).toLocaleString('zh-CN')}`
                return {
                  ...r,
                  resume: {
                    ...r.resume,
                    data,
                    versions: [...r.resume.versions, { id: `v${now}`, content: currentContent, createdAt: now, label: versionLabel }].slice(-20),
                  },
                  updatedAt: now,
                }
              }
              return { ...r, resume: { ...r.resume, data }, updatedAt: Date.now() }
            }),
          }
        }),

      setResumeStep: (resumeStep) => set({ resumeStep }),

      addResumeVersion: (content, label) =>
        set((state) => {
          const now = Date.now()
          const versionLabel = label || `版本 ${state.resumeVersions.length + 1} — ${new Date(now).toLocaleString('zh-CN')}`
          return {
            resumeVersions: [...state.resumeVersions, { id: `v${now}`, content, createdAt: now, label: versionLabel }].slice(-20),
          }
        }),

      restoreResumeVersion: (versionId) =>
        set((state) => {
          const active = state.jdRecords.find((r) => r.id === state.activeJDId)
          if (!active?.resume.data) return state
          const version = active.resume.versions.find((v) => v.id === versionId)
          if (!version) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId
                ? { ...r, resume: { ...r.resume, data: { ...r.resume.data!, content: version.content } } }
                : r
            ),
          }
        }),

      removeResumeVersion: (versionId) =>
        set((state) => ({
          resumeVersions: state.resumeVersions.filter((v) => v.id !== versionId),
        })),

      setUserProfile: (profile) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
        })),

      addWorkExperience: (exp) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            workExperience: [...state.userProfile.workExperience, exp],
          },
        })),

      removeWorkExperience: (id) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            workExperience: state.userProfile.workExperience.filter((e) => e.id !== id),
          },
        })),

      updateWorkExperience: (id, exp) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            workExperience: state.userProfile.workExperience.map((e) =>
              e.id === id ? { ...e, ...exp } : e
            ),
          },
        })),

      addProject: (project) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            projects: [...state.userProfile.projects, project],
          },
        })),

      removeProject: (id) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            projects: state.userProfile.projects.filter((p) => p.id !== id),
          },
        })),

      updateProject: (id, project) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            projects: state.userProfile.projects.map((p) =>
              p.id === id ? { ...p, ...project } : p
            ),
          },
        })),

      resetResume: () => set({ userProfile: initialUserProfile, resumeStep: 'profile' }),

      setMockQuestions: (questions) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) => {
              if (r.id !== state.activeJDId) return r
              const mock = r.mockInterview || {
                jdRecordId: r.id,
                questions: [],
                answers: [],
                currentQuestionIndex: 0,
                status: 'idle' as const,
                feedback: '',
              }
              return {
                ...r,
                mockInterview: { ...mock, questions },
                updatedAt: Date.now(),
              }
            }),
          }
        }),

      setMockAnswer: (answer) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) => {
              if (r.id !== state.activeJDId || !r.mockInterview) return r
              const mock = r.mockInterview
              const existing = mock.answers.findIndex((a) => a.questionId === answer.questionId)
              const newAnswers = [...mock.answers]
              if (existing >= 0) {
                newAnswers[existing] = answer
              } else {
                newAnswers.push(answer)
              }
              return { ...r, mockInterview: { ...mock, answers: newAnswers } }
            }),
          }
        }),

      setMockCurrentIndex: (currentQuestionIndex) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId && r.mockInterview
                ? { ...r, mockInterview: { ...r.mockInterview, currentQuestionIndex } }
                : r
            ),
          }
        }),

      setMockStatus: (status) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId && r.mockInterview
                ? { ...r, mockInterview: { ...r.mockInterview, status } }
                : r
            ),
          }
        }),

      setMockFeedback: (feedback) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId && r.mockInterview
                ? { ...r, mockInterview: { ...r.mockInterview, feedback } }
                : r
            ),
          }
        }),

      resetMockInterview: () =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId
                ? { ...r, mockInterview: null }
                : r
            ),
          }
        }),

      setJDAnalysis: (analysis) =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId
                ? { ...r, jdAnalysis: analysis, updatedAt: Date.now() }
                : r
            ),
          }
        }),

      resetJDAnalysis: () =>
        set((state) => {
          if (!state.activeJDId) return state
          return {
            jdRecords: state.jdRecords.map((r) =>
              r.id === state.activeJDId
                ? { ...r, jdAnalysis: null, updatedAt: Date.now() }
                : r
            ),
          }
        }),

      setLLMConfig: (config) =>
        set((state) => ({
          llmConfig: { ...state.llmConfig, ...config },
        })),

      setTheme: (theme) => set({ theme }),

      resetLLMConfig: () => set({ llmConfig: initialLLMConfig }),
    }),
    {
      name: 'jd-mate-store',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const persisted = persistedState as Record<string, unknown>
        if (version === 0) {
          const records = persisted.jdRecords as Array<Record<string, unknown>> | undefined
          if (records) {
            persisted.jdRecords = records.map((r) => ({
              ...r,
              jdAnalysis: r.jdAnalysis ?? null,
            }))
          }
        }
        if (version < 2) {
          persisted.resumeStep = 'profile'
        }
        return persisted
      },
      partialize: (state) => ({
        hasEntered: state.hasEntered,
        jdRecords: state.jdRecords,
        activeJDId: state.activeJDId,
        activeModule: state.activeModule,
        llmConfig: state.llmConfig,
        theme: state.theme,
        userProfile: state.userProfile,
        resumeStep: state.resumeStep,
        resumeVersions: state.resumeVersions,
      }),
    }
  )
)

export function useActiveJD(): JDRecord | null {
  const state = useStore()
  return state.jdRecords.find((r) => r.id === state.activeJDId) || null
}

interface InterviewStoreHook {
  (): {
    jd: string
    parsedJD: ParsedJD | null
    questions: Question[]
    answers: UserAnswer[]
    evaluations: EvaluationResult[]
    radarData: RadarDataPoint[]
    totalScore: number
    currentStep: 'idle' | 'parsing' | 'generating' | 'practicing' | 'evaluating' | 'result'
    currentQuestionIndex: number
    setJD: Store['setJD']
    setParsedJD: Store['setParsedJD']
    setQuestions: Store['setQuestions']
    setStep: Store['setStep']
    setAnswer: Store['setAnswer']
    setEvaluations: Store['setEvaluations']
    setRadarData: Store['setRadarData']
    setTotalScore: Store['setTotalScore']
    nextQuestion: Store['nextQuestion']
    prevQuestion: Store['prevQuestion']
    setCurrentQuestionIndex: Store['setCurrentQuestionIndex']
    reset: Store['resetInterview']
  }
  getState: () => Store
}

interface ResumeStoreHook {
  (): {
    userProfile: UserProfile
    resumeData: ResumeData | null
    resumeStep: 'profile' | 'generating' | 'preview'
    resumeVersions: ResumeVersion[]
    setUserProfile: Store['setUserProfile']
    addWorkExperience: Store['addWorkExperience']
    removeWorkExperience: Store['removeWorkExperience']
    updateWorkExperience: Store['updateWorkExperience']
    addProject: Store['addProject']
    removeProject: Store['removeProject']
    updateProject: Store['updateProject']
    setResumeData: Store['setResumeData']
    setResumeStep: Store['setResumeStep']
    addResumeVersion: Store['addResumeVersion']
    restoreResumeVersion: Store['restoreResumeVersion']
    removeResumeVersion: Store['removeResumeVersion']
    resetResume: Store['resetResume']
  }
  getState: () => Store
}

interface AppStoreHook {
  (): {
    activeModule: AppModule
    setActiveModule: Store['setActiveModule']
    sharedJD: string
    sharedParsedJD: null
    setSharedJD: (v: string) => void
    setSharedParsedJD: (v: unknown) => void
  }
  getState: () => Store
}

export const useInterviewStore = (() => {
  const useInterviewStoreHook = () => {
    const state = useStore()
    const active = state.jdRecords.find((r) => r.id === state.activeJDId)
    return {
      jd: active?.jd || '',
      parsedJD: active?.parsedJD || null,
      questions: active?.interview.questions || [],
      answers: active?.interview.answers || [],
      evaluations: active?.interview.evaluations || [],
      radarData: active?.interview.radarData || [],
      totalScore: active?.interview.totalScore || 0,
      currentStep: active?.interview.currentStep as 'idle' | 'parsing' | 'generating' | 'practicing' | 'evaluating' | 'result',
      currentQuestionIndex: active?.interview.currentQuestionIndex || 0,
      setJD: state.setJD,
      setParsedJD: state.setParsedJD,
      setQuestions: state.setQuestions,
      setStep: state.setStep,
      setAnswer: state.setAnswer,
      setEvaluations: state.setEvaluations,
      setRadarData: state.setRadarData,
      setTotalScore: state.setTotalScore,
      nextQuestion: state.nextQuestion,
      prevQuestion: state.prevQuestion,
      setCurrentQuestionIndex: state.setCurrentQuestionIndex,
      reset: state.resetInterview,
    }
  }
  ;(useInterviewStoreHook as InterviewStoreHook).getState = useStore.getState
  return useInterviewStoreHook as InterviewStoreHook
})()

export const useResumeStore = (() => {
  const useResumeStoreHook = () => {
    const state = useStore()
    const active = state.jdRecords.find((r) => r.id === state.activeJDId)
    return {
      userProfile: state.userProfile,
      resumeData: active?.resume.data || null,
      resumeStep: state.resumeStep || 'profile',
      resumeVersions: active?.resume.versions || [],
      setUserProfile: state.setUserProfile,
      addWorkExperience: state.addWorkExperience,
      removeWorkExperience: state.removeWorkExperience,
      updateWorkExperience: state.updateWorkExperience,
      addProject: state.addProject,
      removeProject: state.removeProject,
      updateProject: state.updateProject,
      setResumeData: state.setResumeData,
      setResumeStep: state.setResumeStep,
      addResumeVersion: state.addResumeVersion,
      restoreResumeVersion: state.restoreResumeVersion,
      removeResumeVersion: state.removeResumeVersion,
      resetResume: state.resetResume,
    }
  }
  ;(useResumeStoreHook as ResumeStoreHook).getState = useStore.getState
  return useResumeStoreHook as ResumeStoreHook
})()

export const useAppStore = (() => {
  const useAppStoreHook = () => {
    const state = useStore()
    return {
      activeModule: state.activeModule,
      setActiveModule: state.setActiveModule,
      sharedJD: '',
      sharedParsedJD: null,
      setSharedJD: (_v: string) => {},
      setSharedParsedJD: (_v: unknown) => {},
    }
  }
  ;(useAppStoreHook as AppStoreHook).getState = useStore.getState
  return useAppStoreHook as AppStoreHook
})()

export const useSettingsStore = useStore
