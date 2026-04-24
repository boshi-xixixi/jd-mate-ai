'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useInterviewStore } from '@/lib/store'
import { useSettingsStore } from '@/lib/store'
import { getLLMConfig } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { TokenEstimate } from '@/components/token-estimate'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Send,
  Loader2,
  StopCircle,
  FileText,
  Sparkles,
  RotateCcw,
  AlertCircle,
  ClipboardCheck,
  TrendingUp,
  Lightbulb,
  Target,
} from 'lucide-react'
import { RadarChart } from '@/components/radar-chart'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface InterviewReport {
  dimensions: { name: string; score: number; feedback: string }[]
  highlights: string[]
  improvements: string[]
  suggestions: string[]
}

export function MockInterview() {
  const { jd, parsedJD } = useInterviewStore()
  const { llmConfig } = useSettingsStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [report, setReport] = useState<InterviewReport | null>(null)
  const [showReport, setShowReport] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const targetJD = jd
  const targetParsedJD = parsedJD

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const startInterview = async () => {
    setStarted(true)
    setFinished(false)
    const initialMessages: ChatMessage[] = [
      {
        role: 'assistant',
        content: '你好！我是你的模拟面试官。让我们开始面试吧，首先请做一个简单的自我介绍。',
      },
    ]
    setMessages(initialMessages)
  }

  const NOISE_LINE_PATTERNS = [
    /^\[HMR\]/,
    /^\[WDS\]/,
    /React DevTools/,
    /react-devtools/,
    /forward-look-shared/,
    /Download the React/,
    /Hot Module Replacement/,
    /webpack compiled/,
    /webpack updated/,
    /Fast Refresh/,
  ]

  const isNoiseLine = (text: string): boolean => {
    const trimmed = text.trim()
    if (!trimmed) return false
    return NOISE_LINE_PATTERNS.some((p) => p.test(trimmed))
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      abortRef.current = new AbortController()

      const apiMessages = newMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          jd: targetJD,
          parsedJD: targetParsedJD,
          ...getLLMConfig(),
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error('对话失败')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk

        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
          return updated
        })
      }

      const cleanedLines = assistantContent
        .split('\n')
        .filter((line) => !isNoiseLine(line))
      const cleanedContent = cleanedLines.join('\n')
      if (cleanedContent !== assistantContent) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: cleanedContent }
          return updated
        })
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setMessages((prev) => [
          ...prev,
          { role: 'system', content: '对话出错，请重试' },
        ])
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }

  const stopGeneration = () => {
    abortRef.current?.abort()
    setIsLoading(false)
  }

  const endInterview = () => {
    setFinished(true)
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '好的，面试到此结束。感谢你的参与！你可以点击「生成面试报告」查看详细的复盘分析。',
      },
    ])
  }

  const resetInterview = () => {
    setMessages([])
    setStarted(false)
    setFinished(false)
    setInput('')
    setReport(null)
    setShowReport(false)
  }

  const generateReport = async () => {
    if (reportLoading) return
    setReportLoading(true)
    try {
      const res = await fetch('/api/interview-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          jd: targetJD,
          ...getLLMConfig(),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '生成报告失败' }))
        throw new Error(err.error || '生成报告失败')
      }

      const data = await res.json()
      setReport(data)
      setShowReport(true)
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: `报告生成失败：${err instanceof Error ? err.message : '未知错误'}，请重试`,
        },
      ])
    } finally {
      setReportLoading(false)
    }
  }

  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-3xl"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="relative mb-6 inline-flex"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-3 via-primary to-chart-2 shadow-2xl shadow-chart-3/20">
              <MessageCircle className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-chart-3/20 via-primary/20 to-chart-2/20 blur-xl -z-10" />
          </motion.div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            <span className="animate-gradient bg-gradient-to-r from-chart-3 via-primary to-chart-2 bg-clip-text text-transparent bg-[length:200%_200%]">
              AI 模拟面试
            </span>
          </h2>
          <p className="text-muted-foreground">
            AI 扮演面试官，根据 JD 进行多轮追问深挖
          </p>
          {targetJD ? (
            <Badge variant="outline" className="mt-3 gap-1 text-xs text-primary/70">
              <FileText className="h-3 w-3" />
              已关联 JD
            </Badge>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-xs text-yellow-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>请先在「面试出题」中粘贴 JD，或</span>
              <button
                onClick={() => useAppStore.getState().setActiveModule('interview')}
                className="font-medium underline underline-offset-2 hover:text-yellow-300 cursor-pointer"
              >
                前往输入
              </button>
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-medium">面试流程</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {['自我介绍', '技术基础', '项目深挖', '系统设计'].map((step, i) => (
                <div key={step} className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3 text-xs">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <TokenEstimate
              input={1500}
              output={800}
              label="每轮对话预估"
              model={llmConfig.model || 'doubao-seed-2-0-lite-260215'}
            />
            <Button
              onClick={startInterview}
              size="lg"
              className="gap-2 bg-gradient-to-r from-chart-3 to-primary shadow-lg shadow-chart-3/25"
            >
              <Sparkles className="h-4 w-4" />
              开始模拟面试
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (showReport && report) {
    const radarData = report.dimensions.map((d) => ({
      skill: d.name,
      score: d.score,
      fullMark: 100,
    }))
    const avgScore = Math.round(
      report.dimensions.reduce((sum, d) => sum + d.score, 0) / report.dimensions.length
    )

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-3xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-chart-3" />
            <h2 className="text-xl font-bold">面试复盘报告</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReport(false)}
              className="gap-1.5 text-xs"
            >
              返回对话
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetInterview}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              重新面试
            </Button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
            <RadarChart data={radarData} size={280} />
            <div className="flex flex-col items-center justify-center gap-1 sm:items-start sm:pt-8">
              <span className="text-xs text-muted-foreground">综合评分</span>
              <span className="text-5xl font-bold bg-gradient-to-r from-chart-3 to-primary bg-clip-text text-transparent">
                {avgScore}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>

          <div className="mb-6 space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-chart-3" />
              维度评分
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {report.dimensions.map((dim) => (
                <div
                  key={dim.name}
                  className="rounded-xl border border-border/30 bg-background/50 p-3"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium">{dim.name}</span>
                    <Badge
                      variant={dim.score >= 80 ? 'default' : dim.score >= 60 ? 'secondary' : 'destructive'}
                      className="text-[10px]"
                    >
                      {dim.score}分
                    </Badge>
                  </div>
                  <div className="mb-1.5 h-1.5 w-full rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-chart-3 to-primary transition-all"
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{dim.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {report.highlights.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-green-500" />
                面试亮点
              </h3>
              <div className="space-y-2">
                {report.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-green-500/5 p-3 text-xs text-foreground/90 leading-relaxed"
                  >
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-[10px] text-green-500">
                      ✓
                    </span>
                    {h}
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.improvements.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                需要改进
              </h3>
              <div className="space-y-2">
                {report.improvements.map((imp, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-yellow-500/5 p-3 text-xs text-foreground/90 leading-relaxed"
                  >
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-[10px] text-yellow-500">
                      !
                    </span>
                    {imp}
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="h-4 w-4 text-chart-4" />
                学习建议
              </h3>
              <div className="space-y-2">
                {report.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-chart-4/5 p-3 text-xs text-foreground/90 leading-relaxed"
                  >
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-chart-4/20 text-[10px] text-chart-4">
                      {i + 1}
                    </span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto flex w-full max-w-3xl flex-col"
      style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-chart-3" />
          <span className="text-sm font-medium">
            {finished ? '模拟面试已结束' : '模拟面试进行中'}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {messages.filter((m) => m.role === 'user').length} 轮
          </Badge>
          <TokenEstimate
            input={1500 * messages.filter((m) => m.role === 'user').length}
            output={800 * messages.filter((m) => m.role === 'user').length}
            label="累计对话预估"
            model={llmConfig.model || 'gpt-4o-mini'}
          />
        </div>
        <div className="flex gap-2">
          {!finished && messages.filter((m) => m.role === 'user').length >= 3 && (
            <Button variant="outline" size="sm" onClick={endInterview} className="gap-1.5 text-xs">
              <StopCircle className="h-3.5 w-3.5" />
              结束面试
            </Button>
          )}
          {finished && !report && (
            <Button
              size="sm"
              onClick={generateReport}
              disabled={reportLoading}
              className="gap-1.5 text-xs bg-gradient-to-r from-chart-3 to-primary shadow-lg shadow-chart-3/25"
            >
              {reportLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ClipboardCheck className="h-3.5 w-3.5" />
              )}
              {reportLoading ? '正在生成报告...' : '生成面试报告'}
            </Button>
          )}
          {finished && report && (
            <Button
              size="sm"
              onClick={() => setShowReport(true)}
              className="gap-1.5 text-xs bg-gradient-to-r from-chart-3 to-primary shadow-lg shadow-chart-3/25"
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              查看面试报告
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={resetInterview} className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            重新开始
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl border border-border/30 bg-background/30 p-4"
      >
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary/20 text-foreground'
                      : msg.role === 'system'
                      ? 'bg-destructive/10 text-destructive'
                      : 'glass-card text-foreground/90'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="mb-1 text-[10px] font-medium text-chart-3">面试官</div>
                  )}
                  {msg.content || (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass-card max-w-[80%] rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  思考中...
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          placeholder={finished ? '面试已结束' : '输入你的回答...'}
          disabled={isLoading || finished}
          className="min-h-[44px] resize-none border-border/50 bg-background/50 text-sm"
        />
        {isLoading ? (
          <Button variant="outline" size="icon" onClick={stopGeneration} className="flex-shrink-0">
            <StopCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || finished}
            size="icon"
            className="flex-shrink-0 bg-gradient-to-r from-chart-3 to-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
