'use client'

import { useState, useEffect } from 'react'
import { useInterviewStore, useStore } from '@/lib/store'
import { useSettingsStore } from '@/lib/store'
import { getLLMConfig } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TokenEstimate } from '@/components/token-estimate'
import { motion, AnimatePresence } from 'framer-motion'
import type { JDAnalysis } from '@/lib/types'
import {
  Search,
  Sparkles,
  Loader2,
  Briefcase,
  GraduationCap,
  Eye,
  BarChart3,
  Target,
  Map,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Star,
  Flame,
  BookOpen,
  Lightbulb,
} from 'lucide-react'

export function JDAnalysis() {
  const { jd } = useInterviewStore()
  const { llmConfig } = useSettingsStore()
  const { jdRecords, activeJDId, setJDAnalysis } = useStore()
  const savedAnalysis = jdRecords.find((r) => r.id === activeJDId)?.jdAnalysis ?? null
  const [analysis, setAnalysis] = useState<JDAnalysis | null>(savedAnalysis)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setAnalysis(savedAnalysis)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJDId])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    skills: true,
    hidden: true,
    competitiveness: true,
    strategy: true,
    learning: true,
  })

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const analyzeJD = async () => {
    if (isLoading || !jd.trim()) return
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd, ...getLLMConfig() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '分析失败' }))
        throw new Error(err.error || '分析失败')
      }

      const data = await res.json()
      setAnalysis(data)
      setJDAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setIsLoading(false)
    }
  }

  const SectionHeader = ({
    icon: Icon,
    title,
    sectionKey,
    color = 'text-primary',
  }: {
    icon: React.ElementType
    title: string
    sectionKey: string
    color?: string
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex w-full items-center justify-between rounded-xl bg-secondary/30 p-4 transition-colors hover:bg-secondary/50 cursor-pointer"
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`h-4.5 w-4.5 ${color}`} />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  )

  if (!analysis && !isLoading) {
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
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-primary shadow-2xl shadow-blue-500/20">
              <Search className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-primary/20 blur-xl -z-10" />
          </motion.div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            <span className="animate-gradient bg-gradient-to-r from-blue-500 via-violet-500 to-primary bg-clip-text text-transparent bg-[length:200%_200%]">
              JD 深度解析
            </span>
          </h2>
          <p className="text-muted-foreground">
            AI 深度解读岗位要求，发现隐藏信息，制定面试策略
          </p>
          {jd ? (
            <Badge variant="outline" className="mt-3 gap-1 text-xs text-primary/70">
              <Briefcase className="h-3 w-3" />
              已关联 JD
            </Badge>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-xs text-yellow-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>请先在「面试出题」中粘贴 JD</span>
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-medium">解析内容</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { icon: Briefcase, label: 'JD 概览', desc: '岗位核心信息提炼' },
                { icon: GraduationCap, label: '技能拆解', desc: '必须/加分/隐性技能' },
                { icon: Eye, label: '潜台词解读', desc: 'JD 措辞背后的真相' },
                { icon: BarChart3, label: '竞争力评估', desc: '岗位难度与稀缺度' },
                { icon: Target, label: '面试策略', desc: '重点方向与高频考点' },
                { icon: Map, label: '学习路径', desc: '从入门到胜任的路线' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3 text-xs">
                  <item.icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <div>
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground ml-1">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <TokenEstimate
              input={2000}
              output={1500}
              label="解析预估"
              model={llmConfig.model || 'doubao-seed-2-0-lite-260215'}
            />
            <Button
              onClick={analyzeJD}
              disabled={!jd.trim()}
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-500 via-violet-500 to-primary shadow-lg shadow-blue-500/25"
            >
              <Sparkles className="h-4 w-4" />
              开始解析
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto w-full max-w-3xl"
      >
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-primary/20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">正在深度解析 JD</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            AI 正在分析岗位要求、解读潜台词、制定面试策略...
          </p>
          <div className="mx-auto flex flex-wrap justify-center gap-2">
            {['技能拆解', '潜台词解读', '竞争力评估', '面试策略', '学习路径'].map((step, i) => (
              <Badge key={step} variant="outline" className="gap-1 text-xs">
                <span className={`h-1.5 w-1.5 rounded-full ${i < 2 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                {step}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  if (!analysis) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-3xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold">JD 深度解析</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={analyzeJD} disabled={isLoading} className="gap-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            重新解析
          </Button>
        </div>
      </div>

      {/* 概览 */}
      <div className="glass-card rounded-2xl p-1">
        <SectionHeader icon={Briefcase} title="JD 概览" sectionKey="overview" color="text-blue-500" />
        <AnimatePresence>
          {expandedSections.overview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-3 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
                    {analysis.overview.title}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {analysis.overview.level}
                  </Badge>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{analysis.overview.summary}</p>
                <div>
                  <h4 className="mb-2 text-xs font-medium text-muted-foreground">核心要求</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.overview.keyRequirements.map((req) => (
                      <Badge key={req} variant="secondary" className="text-[11px] gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 技能拆解 */}
      <div className="glass-card rounded-2xl p-1">
        <SectionHeader icon={GraduationCap} title="技能拆解" sectionKey="skills" color="text-violet-500" />
        <AnimatePresence>
          {expandedSections.skills && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-3 space-y-4">
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs font-semibold text-red-500">必须掌握</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {analysis.skills.required.map((s) => (
                      <div key={s.name} className="rounded-lg bg-red-500/5 p-3 border border-red-500/10">
                        <span className="text-sm font-medium">{s.name}</span>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-500">加分项</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {analysis.skills.bonus.map((s) => (
                      <div key={s.name} className="rounded-lg bg-amber-500/5 p-3 border border-amber-500/10">
                        <span className="text-sm font-medium">{s.name}</span>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-xs font-semibold text-purple-500">隐性要求</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {analysis.skills.hidden.map((s) => (
                      <div key={s.keyword} className="rounded-lg bg-purple-500/5 p-3 border border-purple-500/10">
                        <span className="text-sm font-medium">{s.keyword}</span>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 潜台词解读 */}
      <div className="glass-card rounded-2xl p-1">
        <SectionHeader icon={Eye} title="潜台词解读" sectionKey="hidden" color="text-amber-500" />
        <AnimatePresence>
          {expandedSections.hidden && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-3 space-y-3">
                {analysis.hiddenMessages.map((msg, i) => (
                  <div key={i} className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        「{msg.phrase}」
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-foreground/90 leading-relaxed">
                      <span className="font-medium">潜台词：</span>{msg.interpretation}
                    </p>
                    <div className="flex items-start gap-2 rounded-lg bg-green-500/5 p-2.5">
                      <Lightbulb className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        <span className="font-medium text-green-600 dark:text-green-400">应对：</span>{msg.advice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 竞争力评估 */}
      <div className="glass-card rounded-2xl p-1">
        <SectionHeader icon={BarChart3} title="竞争力评估" sectionKey="competitiveness" color="text-emerald-500" />
        <AnimatePresence>
          {expandedSections.competitiveness && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-3 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-center">
                    <div className="mb-1 text-xs text-muted-foreground">竞争难度</div>
                    <div className="flex items-center justify-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-5 rounded-sm ${
                            i < analysis.competitiveness.difficulty
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                              : 'bg-secondary'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {analysis.competitiveness.difficulty}/5
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 text-center">
                    <div className="mb-1 text-xs text-muted-foreground">人才稀缺度</div>
                    <div className="flex items-center justify-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-5 rounded-sm ${
                            i < analysis.competitiveness.scarcity
                              ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                              : 'bg-secondary'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                      {analysis.competitiveness.scarcity}/5
                    </div>
                  </div>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{analysis.competitiveness.analysis}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 面试策略 */}
      <div className="glass-card rounded-2xl p-1">
        <SectionHeader icon={Target} title="面试策略" sectionKey="strategy" color="text-rose-500" />
        <AnimatePresence>
          {expandedSections.strategy && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-3 space-y-4">
                <div>
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                    <Target className="h-3.5 w-3.5 text-rose-500" />
                    重点方向
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {analysis.interviewStrategy.focusAreas.map((area, i) => (
                      <div key={i} className="rounded-lg bg-rose-500/5 p-3 border border-rose-500/10">
                        <div className="mb-1 text-sm font-medium">{area.area}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{area.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    高频考点
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.interviewStrategy.highFreqTopics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-[11px] gap-1 border-orange-500/20 text-orange-600 dark:text-orange-400">
                        <Flame className="h-2.5 w-2.5" />
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                    <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                    准备建议
                  </h4>
                  <div className="space-y-2">
                    {analysis.interviewStrategy.preparationTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-yellow-500/5 p-3 text-xs text-foreground/90 leading-relaxed">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-[10px] text-yellow-600 dark:text-yellow-400">
                          {i + 1}
                        </span>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 学习路径 */}
      <div className="glass-card rounded-2xl p-1">
        <SectionHeader icon={Map} title="学习路径" sectionKey="learning" color="text-cyan-500" />
        <AnimatePresence>
          {expandedSections.learning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-3">
                <div className="relative space-y-0">
                  {analysis.learningPath.map((step, i) => (
                    <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-xs font-bold text-primary-foreground shadow-lg shadow-cyan-500/20">
                          {i + 1}
                        </div>
                        {i < analysis.learningPath.length - 1 && (
                          <div className="mt-1 h-full w-0.5 bg-gradient-to-b from-cyan-500/50 to-transparent" />
                        )}
                      </div>
                      <div className="flex-1 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-semibold">{step.stage}</span>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <BookOpen className="h-2.5 w-2.5" />
                            {step.estimatedTime}
                          </Badge>
                        </div>
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {step.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[10px]">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.resources}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
