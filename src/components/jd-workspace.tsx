'use client'

import { lazy, Suspense, useEffect, useState } from 'react'
import { useStore, useInterviewStore } from '@/lib/store'
import { getLLMConfig } from '@/lib/api'
import { fetchWithTimeout } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  Zap,
  Brain,
  Target,
  ChevronRight,
} from 'lucide-react'
import { LoadingOverlay } from '@/components/loading-overlay'
import { SkillTags } from '@/components/skill-tags'
import { QuestionCard } from '@/components/question-card'
import { ResultPanel } from '@/components/result-panel'

const MockInterview = lazy(() => import('@/components/mock-interview').then((m) => ({ default: m.MockInterview })))
const Dashboard = lazy(() => import('@/components/dashboard').then((m) => ({ default: m.Dashboard })))
const ResumeBuilder = lazy(() => import('@/components/resume-builder').then((m) => ({ default: m.ResumeBuilder })))
const ResumePreview = lazy(() => import('@/components/resume-preview').then((m) => ({ default: m.ResumePreview })))
const JDAnalysis = lazy(() => import('@/components/jd-analysis').then((m) => ({ default: m.JDAnalysis })))

const features = [
  {
    icon: Brain,
    title: '智能解析',
    desc: '深度分析 JD 要求',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'hover:border-blue-500/30',
  },
  {
    icon: Target,
    title: '精准出题',
    desc: '匹配岗位技能点',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'hover:border-violet-500/30',
  },
  {
    icon: Zap,
    title: '即时反馈',
    desc: 'AI 评分与建议',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'hover:border-amber-500/30',
  },
]

export function JDWorkspace() {
  const { activeModule, selectJDRecord, activeJDId, jdRecords, resumeStep, setResumeStep } = useStore()
  const { currentStep, parsedJD, questions, setStep, setParsedJD, setQuestions, jd, currentQuestionIndex } = useInterviewStore()
  const [parseError, setParseError] = useState('')

  useEffect(() => {
    if (activeModule === 'resume' && (resumeStep !== 'profile' && resumeStep !== 'generating' && resumeStep !== 'preview')) {
      setResumeStep('profile')
    }
  }, [activeModule, resumeStep, setResumeStep])

  const activeJD = jdRecords.find((r) => r.id === activeJDId)

  useEffect(() => {
    if (currentStep !== 'parsing') return

    let cancelled = false
    setParseError('')

    const parseAndGenerate = async () => {
      try {
        console.log('[面试出题] 开始解析JD, JD长度:', jd.length, 'LLM配置:', getLLMConfig())
        const res = await fetchWithTimeout('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jd, ...getLLMConfig() }),
        }, 120000)

        console.log('[面试出题] 解析JD响应状态:', res.status, res.statusText)

        if (!res.ok) {
          const data = await res.json()
          console.error('[面试出题] 解析JD失败:', data)
          throw new Error(data.error || '解析失败')
        }

        const parsed = await res.json()
        console.log('[面试出题] 解析JD成功:', parsed)

        if (cancelled) return

        setParsedJD(parsed)
        setStep('generating')
        console.log('[面试出题] 切换到生成题目阶段')

        const genRes = await fetchWithTimeout('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skills: parsed.skills,
            level: parsed.level,
            summary: parsed.summary,
            ...getLLMConfig(),
          }),
        }, 120000)

        console.log('[面试出题] 生成题目响应状态:', genRes.status, genRes.statusText)

        if (!genRes.ok) {
          const data = await genRes.json()
          console.error('[面试出题] 生成题目失败:', data)
          throw new Error(data.error || '题目生成失败')
        }

        if (cancelled) return

        const { questions: generatedQuestions } = await genRes.json()
        console.log('[面试出题] 生成题目成功, 数量:', generatedQuestions?.length)
        useInterviewStore.getState().setQuestions(generatedQuestions)
        setStep('practicing')
        console.log('[面试出题] 切换到练习阶段')
      } catch (err) {
        if (cancelled) return
        console.error('[面试出题] 流程异常:', err)
        const message = err instanceof Error ? err.message : '发生未知错误'
        if (message.includes('API key') || message.includes('401') || message.includes('auth')) {
          setParseError('API Key 无效或未配置，请点击右上角 ⚙ 设置模型')
        } else {
          setParseError(message)
        }
        setStep('idle')
      }
    }

    parseAndGenerate()

    return () => {
      cancelled = true
    }
  }, [currentStep, jd, setStep, setParsedJD, setQuestions])

  useEffect(() => {
    if (currentStep === 'evaluating') {
      const evaluate = async () => {
        try {
          console.log('[评分] 开始评分, 题目数量:', questions.length)
          const res = await fetchWithTimeout('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questions,
              answers: useStore.getState().jdRecords.find((r) => r.id === useStore.getState().activeJDId)?.interview.answers || [],
              skills: parsedJD?.skills || [],
            }),
          }, 120000)

          console.log('[评分] 响应状态:', res.status, res.statusText)

          if (!res.ok) throw new Error('评分失败')

          const data = await res.json()
          console.log('[评分] 评分成功:', data)
          useStore.getState().setEvaluations(data.evaluations)
          useStore.getState().setRadarData(data.radarData)
          useStore.getState().setTotalScore(data.totalScore)
          setStep('result')
          console.log('[评分] 切换到结果阶段')
        } catch (err) {
          console.error('[评分] 评分异常:', err)
          setStep('practicing')
        }
      }
      evaluate()
    }
  }, [currentStep, questions, parsedJD, setStep])

  return (
    <div className="flex flex-col">
      {/* JD Header */}
      <div className="mb-6 pt-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => selectJDRecord(null)}
            className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-relaxed break-words whitespace-pre-wrap">
                  {activeJD?.title}
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {activeJD && new Date(activeJD.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  {parsedJD && (
                    <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 h-5 text-[11px]">
                      <CheckCircle2 className="h-3 w-3" />
                      已解析
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[calc(100vh-200px)]">
        <AnimatePresence mode="wait">
          {activeModule === 'jd-analysis' && (
            <motion.div key="jd-analysis" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>}>
                <JDAnalysis />
              </Suspense>
            </motion.div>
          )}

          {activeModule === 'interview' && (
            <motion.div key="interview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              {currentStep === 'idle' && (
                <div className="py-12">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI 智能出题
                    </div>
                    <h1 className="text-2xl font-bold mb-3 tracking-tight">面试准备</h1>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                      基于岗位需求，AI 为你生成针对性面试题目
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
                    {features.map((f) => (
                      <Card key={f.title} className={`p-5 text-center border-border/60 ${f.border} transition-colors`}>
                        <div className={`mx-auto mb-3 h-10 w-10 rounded-lg ${f.bg} flex items-center justify-center`}>
                          <f.icon className={`h-5 w-5 ${f.color}`} />
                        </div>
                        <p className="text-sm font-semibold mb-1">{f.title}</p>
                        <p className="text-xs text-muted-foreground">{f.desc}</p>
                      </Card>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <Button
                      onClick={() => setStep('parsing')}
                      size="lg"
                      className="gap-2 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                    >
                      <Sparkles className="h-4 w-4" />
                      开始解析 JD
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    {parseError && (
                      <p className="text-sm text-destructive max-w-md text-center">{parseError}</p>
                    )}
                  </div>
                </div>
              )}

              {(currentStep === 'parsing' || currentStep === 'generating') && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingOverlay type={currentStep === 'parsing' ? 'parsing' : 'generating'} />
                  {parsedJD && currentStep === 'generating' && (
                    <div className="mx-auto mt-8 max-w-2xl">
                      <SkillTags skills={parsedJD.skills} level={parsedJD.level} summary={parsedJD.summary} />
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 'practicing' && parsedJD && (
                <motion.div key="practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <SkillTags skills={parsedJD.skills} level={parsedJD.level} summary={parsedJD.summary} />
                  <QuestionCard key={currentQuestionIndex} />
                </motion.div>
              )}

              {currentStep === 'evaluating' && (
                <motion.div key="evaluating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingOverlay type="evaluating" />
                </motion.div>
              )}

              {currentStep === 'result' && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ResultPanel />
                </motion.div>
              )}
            </motion.div>
          )}

          {activeModule === 'resume' && (
            <motion.div key="resume" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>}>
                {resumeStep === 'profile' && <ResumeBuilder />}
                {resumeStep === 'generating' && <LoadingOverlay type="resume-generating" />}
                {resumeStep === 'preview' && <ResumePreview />}
              </Suspense>
            </motion.div>
          )}

          {activeModule === 'mock-interview' && (
            <motion.div key="mock" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>}>
                <MockInterview />
              </Suspense>
            </motion.div>
          )}

          {activeModule === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>}>
                <Dashboard />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
