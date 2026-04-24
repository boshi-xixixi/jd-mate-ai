'use client'

import { useState } from 'react'
import { useInterviewStore, useSettingsStore } from '@/lib/store'
import { getLLMConfig } from '@/lib/api'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TokenEstimate } from '@/components/token-estimate'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Sparkles,
  Loader2,
  Target,
  Briefcase,
  ArrowRight,
  Brain,
  Code2,
  BarChart3,
  PenLine,
  MessageCircle,
  ChevronRight,
  Search,
} from 'lucide-react'

const sampleJD = `高级前端工程师 - 字节跳动

岗位职责：
1. 负责公司核心产品的前端架构设计与开发，支撑千万级用户量
2. 主导 React/Vue 技术栈的选型与最佳实践制定
3. 优化前端性能，提升首屏加载速度和交互体验
4. 参与 Node.js BFF 层的开发与维护
5. 推动前端工程化建设，包括 CI/CD、组件库、监控体系

任职要求：
1. 本科及以上学历，5年以上前端开发经验
2. 精通 React 或 Vue 框架，深入理解其核心原理
3. 熟悉 TypeScript，有大型项目实践经验
4. 了解 Node.js，有 BFF 或 SSR 开发经验优先
5. 熟悉前端性能优化，有首屏秒开经验
6. 有微前端架构实践、组件库建设经验优先
7. 良好的沟通协作能力，有技术团队管理经验优先`

const workflowSteps = [
  {
    step: 1,
    icon: FileText,
    title: '粘贴 JD',
    desc: '粘贴目标岗位的职位描述',
    color: 'from-primary to-chart-2',
  },
  {
    step: 2,
    icon: Brain,
    title: 'AI 解析',
    desc: '自动提取技能栈与核心要求',
    color: 'from-chart-2 to-chart-3',
  },
  {
    step: 3,
    icon: Sparkles,
    title: '全方位备战',
    desc: '面试题 / 简历 / 模拟面试',
    color: 'from-chart-3 to-chart-4',
  },
]

const capabilities = [
  {
    icon: Search,
    title: 'JD 详解',
    desc: '深度解读岗位要求，发现隐藏信息与潜台词',
  },
  {
    icon: Code2,
    title: '面试出题',
    desc: '根据 JD 精准生成 9 道面试题，覆盖基础到高难',
  },
  {
    icon: PenLine,
    title: '简历工坊',
    desc: 'AI 优化简历，STAR 法则重写，JD 匹配度评分',
  },
  {
    icon: MessageCircle,
    title: '模拟面试',
    desc: 'AI 面试官多轮追问，模拟真实面试场景',
  },
  {
    icon: BarChart3,
    title: '能力雷达图',
    desc: '多维度评分，定位知识盲区与提升方向',
  },
]

export function JDInput() {
  const { jd, setJD, setParsedJD, setStep } = useInterviewStore()
  const { llmConfig } = useSettingsStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleParse = async () => {
    if (!jd.trim()) {
      setError('请输入 JD 文本')
      return
    }
    setLoading(true)
    setError('')
    setStep('parsing')

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd, ...getLLMConfig() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '解析失败')
      }

      const parsed = await res.json()
      setParsedJD(parsed)
      setStep('generating')

      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: parsed.skills,
          level: parsed.level,
          summary: parsed.summary,
          ...getLLMConfig(),
        }),
      })

      if (!genRes.ok) {
        const data = await genRes.json()
        throw new Error(data.error || '题目生成失败')
      }

      const { questions } = await genRes.json()
      useInterviewStore.getState().setQuestions(questions)
      setStep('practicing')
    } catch (err) {
      const message = err instanceof Error ? err.message : '发生未知错误'
      if (message.includes('API key') || message.includes('401') || message.includes('auth')) {
        setError('API Key 无效或未配置，请点击右上角 ⚙ 设置模型')
      } else {
        setError(message)
      }
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  const handleUseSample = () => {
    setJD(sampleJD)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto w-full max-w-3xl"
    >
      <div className="mb-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="relative mb-4 inline-flex"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-chart-2 to-chart-3 shadow-2xl shadow-primary/20">
            <FileText className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary/20 via-chart-2/20 to-chart-3/20 blur-xl -z-10" />
        </motion.div>
        <h2 className="mb-2 text-3xl font-bold tracking-tight">
          粘贴你的{' '}
          <span className="animate-gradient bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
            JD
          </span>
        </h2>
        <p className="text-sm text-muted-foreground">
          一份 JD 驱动全部 — 面试题、定制简历、模拟面试，一站搞定
        </p>
      </div>

      <div className="mb-6 flex items-center justify-center gap-2 sm:gap-4">
        {workflowSteps.map((step, i) => {
          const Icon = step.icon
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-2 sm:gap-4"
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg`}>
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{step.title}</p>
                  <p className="hidden text-[10px] text-muted-foreground sm:block">{step.desc}</p>
                </div>
              </div>
              {i < workflowSteps.length - 1 && (
                <ChevronRight className="mb-5 h-4 w-4 text-muted-foreground/30" />
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="sticky top-[72px] z-40 -mx-2 rounded-2xl p-4 glass-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <span className="text-sm font-medium">粘贴目标岗位的 JD</span>
          </div>
          <button
            onClick={handleUseSample}
            className="flex items-center gap-1 text-xs text-primary/70 transition-colors hover:text-primary cursor-pointer"
          >
            试试示例 JD
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <Textarea
          value={jd}
          onChange={(e) => setJD(e.target.value)}
          placeholder="在这里粘贴目标岗位的 JD 文本...&#10;&#10;例如：&#10;高级前端工程师 - 字节跳动&#10;岗位职责：...&#10;任职要求：..."
          className="min-h-[180px] max-h-[400px] resize-y border-border/50 bg-background/50 text-sm leading-relaxed focus-visible:ring-primary/30"
        />

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Target className="h-3 w-3" /> 精准解析
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Briefcase className="h-3 w-3" /> 定制出题
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <TokenEstimate
              input={2000}
              output={4000}
              label="JD 解析 + 题目生成"
              model={llmConfig.model || 'doubao-seed-2-0-lite-260215'}
            />
            <Button
              onClick={handleParse}
              disabled={loading || !jd.trim()}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-chart-2 px-8 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 解析中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  开始解析
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <p className="mb-4 text-center text-xs text-muted-foreground">解析完成后，你可以使用以下全部功能</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="flex items-start gap-3 rounded-xl border border-border/20 bg-secondary/20 p-4"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary/70" />
                </div>
                <div>
                  <p className="text-sm font-medium">{cap.title}</p>
                  <p className="text-xs text-muted-foreground">{cap.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
