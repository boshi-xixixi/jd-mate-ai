'use client'

import { useInterviewStore, useResumeStore, useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { RadarChart } from '@/components/radar-chart'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  PenLine,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Zap,
} from 'lucide-react'

export function Dashboard() {
  const { parsedJD, totalScore, radarData, evaluations } = useInterviewStore()
  const { resumeData } = useResumeStore()

  const hasInterviewData = evaluations.length > 0
  const hasResumeData = !!resumeData
  const hasJD = !!parsedJD

  const answeredCount = evaluations.length
  const correctCount = evaluations.filter((e) => e.score >= e.maxScore * 0.6).length
  const blindSpotCount = evaluations.reduce((acc, e) => acc + e.blindSpots.length, 0)
  const keyPointCount = evaluations.reduce((acc, e) => acc + e.keyPoints.length, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-5xl space-y-6"
    >
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-chart-1 to-chart-2">
          <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">求职能力仪表盘</h2>
          <p className="text-sm text-muted-foreground">综合面试、简历、模拟面试数据，全方位展示你的求职竞争力</p>
        </div>
      </div>

      {!hasJD && !hasInterviewData && !hasResumeData && (
        <Card className="glass-card border-border/30">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/20" />
            <h3 className="mb-2 text-lg font-medium">暂无数据</h3>
            <p className="mb-6 text-sm text-muted-foreground">开始使用面试出题或简历工坊，数据将自动汇总到这里</p>
            <div className="flex gap-3">
              <button
                onClick={() => useAppStore.getState().setActiveModule('interview')}
                className="flex items-center gap-2 rounded-lg border border-border/50 px-4 py-2 text-sm transition-colors hover:bg-secondary"
              >
                <FileText className="h-4 w-4" />
                面试出题
              </button>
              <button
                onClick={() => useAppStore.getState().setActiveModule('resume')}
                className="flex items-center gap-2 rounded-lg border border-border/50 px-4 py-2 text-sm transition-colors hover:bg-secondary"
              >
                <PenLine className="h-4 w-4" />
                简历工坊
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {(hasJD || hasInterviewData || hasResumeData) && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="glass-card border-border/30">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{hasInterviewData ? totalScore : '--'}</div>
                    <div className="text-xs text-muted-foreground">面试评分</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-border/30">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/15">
                    <PenLine className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{hasResumeData ? `${resumeData.matchScore}%` : '--'}</div>
                    <div className="text-xs text-muted-foreground">简历匹配度</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="glass-card border-border/30">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{hasInterviewData ? `${correctCount}/${answeredCount}` : '--'}</div>
                    <div className="text-xs text-muted-foreground">达标题目</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card border-border/30">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{hasInterviewData ? blindSpotCount : '--'}</div>
                    <div className="text-xs text-muted-foreground">知识盲区</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {hasInterviewData && radarData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Card className="glass-card border-border/30">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">能力雷达图</span>
                    </div>
                    <div className="flex justify-center">
                      <RadarChart data={radarData} size={260} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {hasJD && parsedJD && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="glass-card border-border/30">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-chart-4" />
                      <span className="text-sm font-medium">JD 解析结果</span>
                      <Badge variant="outline" className="ml-auto text-[10px]">{parsedJD.level}</Badge>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">{parsedJD.summary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedJD.skills.map((skill) => (
                        <Badge key={skill.name} variant="outline" className="text-[10px]">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {hasResumeData && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <Card className="glass-card border-border/30">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-chart-5" />
                      <span className="text-sm font-medium">技能缺口分析</span>
                    </div>
                    <div className="space-y-2">
                      {resumeData.skillGaps.map((gap, i) => {
                        const normalizedGap = typeof gap === 'string'
                          ? { skill: gap, status: 'missing' as const, suggestion: '' }
                          : gap
                        const colorMap = {
                          matched: 'text-green-400',
                          partial: 'text-yellow-400',
                          missing: 'text-red-400',
                        }
                        return (
                          <div key={normalizedGap.skill || i} className="flex items-center gap-2 text-sm">
                            <span className={colorMap[normalizedGap.status] || colorMap.missing}>●</span>
                            <span className="flex-1">{normalizedGap.skill}</span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] ${
                                normalizedGap.status === 'matched'
                                  ? 'border-green-500/30 text-green-400'
                                  : normalizedGap.status === 'partial'
                                  ? 'border-yellow-500/30 text-yellow-400'
                                  : 'border-red-500/30 text-red-400'
                              }`}
                            >
                              {normalizedGap.status === 'matched' ? '匹配' : normalizedGap.status === 'partial' ? '部分' : '缺失'}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {hasInterviewData && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="glass-card border-border/30">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-chart-2" />
                      <span className="text-sm font-medium">面试表现概览</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-muted-foreground">总体得分</span>
                          <span className="font-medium">{totalScore}/100</span>
                        </div>
                        <Progress value={totalScore} className="h-2" />
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-muted-foreground">达标题目</span>
                          <span className="font-medium">{correctCount}/{answeredCount}</span>
                        </div>
                        <Progress value={(correctCount / Math.max(answeredCount, 1)) * 100} className="h-2" />
                      </div>
                      <Separator className="bg-border/30" />
                      <div className="flex gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">得分点</span>
                          <span className="ml-1 font-medium text-green-400">{keyPointCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">知识盲区</span>
                          <span className="ml-1 font-medium text-red-400">{blindSpotCount}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <Card className="glass-card border-border/30">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">提升建议</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {hasInterviewData && evaluations.flatMap((e) => e.blindSpots).slice(0, 4).map((spot, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-red-500/5 p-3 text-xs">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                    <span className="text-foreground/70">{spot}</span>
                  </div>
                ))}
                {hasResumeData && resumeData.suggestions.slice(0, 4).map((suggestion, i) => (
                  <div key={`resume-${i}`} className="flex items-start gap-2 rounded-lg bg-chart-4/5 p-3 text-xs">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-chart-4" />
                    <span className="text-foreground/70">{suggestion}</span>
                  </div>
                ))}
                {!hasInterviewData && !hasResumeData && (
                  <p className="text-sm text-muted-foreground">完成面试或生成简历后，这里会显示个性化提升建议</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  )
}
