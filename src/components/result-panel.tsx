'use client'

import { useState, useEffect, useRef } from 'react'
import { useInterviewStore } from '@/lib/store'
import { RadarChart } from '@/components/radar-chart'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import {
  Trophy,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'

export function ResultPanel() {
  const {
    questions,
    evaluations,
    radarData,
    totalScore,
    parsedJD,
    reset,
  } = useInterviewStore()

  const [expandedQ, setExpandedQ] = useState<string | null>(null)
  const [animatedScore, setAnimatedScore] = useState(0)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (totalScore === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional animation reset
      setAnimatedScore(0)
      return
    }
    if (animationRef.current) clearInterval(animationRef.current)
    let start = 0
    const end = totalScore
    const duration = 1500
    const stepTime = Math.max(duration / end, 16)
    animationRef.current = window.setInterval(() => {
      start += 1
      setAnimatedScore(start)
      if (start >= end && animationRef.current) clearInterval(animationRef.current)
    }, stepTime)
    return () => {
      if (animationRef.current) clearInterval(animationRef.current)
    }
  }, [totalScore])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '卓越'
    if (score >= 80) return '优秀'
    if (score >= 70) return '良好'
    if (score >= 60) return '及格'
    return '需加强'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-500'
    if (score >= 60) return 'from-yellow-400 to-orange-500'
    return 'from-red-400 to-rose-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto w-full max-w-4xl space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-chart-2 to-chart-3 shadow-2xl shadow-primary/20"
        >
          <Trophy className="h-8 w-8 text-primary-foreground" />
        </motion.div>
        <h2 className="mb-1 text-2xl font-bold">面试评估报告</h2>
        <p className="text-sm text-muted-foreground">
          {parsedJD?.level} · {parsedJD?.skills.length} 项核心技能
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="flex-1 text-center md:text-left">
            <div className="mb-2 text-sm text-muted-foreground">综合评分</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-6xl font-black ${getScoreColor(animatedScore)}`}>
                {animatedScore}
              </span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <Badge
              className={`mt-3 bg-gradient-to-r ${getScoreGradient(totalScore)} text-white border-0`}
            >
              {getScoreLabel(totalScore)}
            </Badge>
            <div className="mt-4">
              <Progress
                value={animatedScore}
                className="h-2 bg-secondary"
              />
            </div>
          </div>

          <div className="flex-shrink-0">
            <RadarChart data={radarData} size={280} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-border/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {evaluations.reduce((acc, e) => acc + (e.score >= e.maxScore * 0.6 ? 1 : 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground">达标题目</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-border/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/15">
                <Target className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {evaluations.reduce((acc, e) => acc + e.keyPoints.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">得分点</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-border/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {evaluations.reduce((acc, e) => acc + e.blindSpots.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">知识盲区</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          逐题解析
        </h3>
        {evaluations.map((evaluation, index) => {
          const question = questions.find((q) => q.id === evaluation.questionId)
          if (!question) return null
          const isExpanded = expandedQ === evaluation.questionId
          const scorePercent = (evaluation.score / evaluation.maxScore) * 100

          return (
            <motion.div
              key={evaluation.questionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card cursor-pointer border-border/30 transition-all hover:border-border/50">
                <CardHeader
                  className="p-4"
                  onClick={() =>
                    setExpandedQ(isExpanded ? null : evaluation.questionId)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                          scorePercent >= 60
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="line-clamp-1 text-sm font-medium">
                          {question.question}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {question.skillTag}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {evaluation.score}/{evaluation.maxScore} 分
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden w-20 sm:block">
                        <Progress
                          value={scorePercent}
                          className={`h-1.5 ${
                            scorePercent >= 60 ? '[&>div]:bg-green-400' : '[&>div]:bg-red-400'
                          }`}
                        />
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="border-t border-border/20 px-4 pb-4 pt-3">
                    <p className="mb-4 text-sm leading-relaxed text-foreground/80">
                      {evaluation.feedback}
                    </p>

                    {evaluation.keyPoints.length > 0 && (
                      <div className="mb-3">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-green-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          得分点
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {evaluation.keyPoints.map((point, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="border-green-500/30 bg-green-500/10 text-xs text-green-400"
                            >
                              {point}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {evaluation.blindSpots.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-red-400">
                          <XCircle className="h-3.5 w-3.5" />
                          知识盲区
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {evaluation.blindSpots.map((spot, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="border-red-500/30 bg-red-500/10 text-xs text-red-400"
                            >
                              {spot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button
          onClick={reset}
          variant="outline"
          className="gap-2 border-border/50"
        >
          <RotateCcw className="h-4 w-4" />
          重新开始
        </Button>
      </div>
    </motion.div>
  )
}
