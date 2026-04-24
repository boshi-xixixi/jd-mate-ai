'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, Check } from 'lucide-react'

interface LoadingOverlayProps {
  type: 'parsing' | 'generating' | 'evaluating' | 'resume-generating'
}

const messages = {
  parsing: {
    title: 'AI 正在解析 JD',
    subtitle: '提取核心技能标签与岗位要求...',
    steps: ['识别技术栈', '分析业务场景', '评估经验要求', '生成结构化数据'],
  },
  generating: {
    title: 'AI 正在生成题目',
    subtitle: '根据技能标签定制面试题...',
    steps: ['生成基础知识题', '设计情景应用题', '编写代码实现题', '校验题目质量'],
  },
  evaluating: {
    title: 'AI 正在判卷',
    subtitle: '分析答案并生成评估报告...',
    steps: ['评分选择题', '评估简答题', '审查代码题', '生成雷达图数据'],
  },
  'resume-generating': {
    title: 'AI 正在生成简历',
    subtitle: '根据你的背景和目标 JD 定制简历...',
    steps: ['分析 JD 匹配度', 'STAR 法则重写经历', '优化技能描述', '生成匹配度评分'],
  },
}

export function LoadingOverlay({ type }: LoadingOverlayProps) {
  const config = messages[type]
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < config.steps.length - 1 ? prev + 1 : prev))
    }, 2500)
    return () => clearInterval(interval)
  }, [config.steps.length])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[400px] flex-col items-center justify-center"
    >
      <div className="relative mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="h-20 w-20 rounded-full border-2 border-primary/20"
          style={{
            borderTopColor: 'oklch(0.7 0.18 270)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      </div>

      <h3 className="mb-2 text-xl font-bold">{config.title}</h3>
      <p className="mb-8 text-sm text-muted-foreground">{config.subtitle}</p>

      <div className="w-full max-w-xs space-y-3">
        {config.steps.map((step, i) => {
          const isCompleted = i < activeStep
          const isActive = i === activeStep

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: i <= activeStep ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.3 }}
              className="flex items-center gap-3"
            >
              {isCompleted ? (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20">
                  <Check className="h-3 w-3 text-primary" />
                </div>
              ) : isActive ? (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </motion.div>
              ) : (
                <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
              )}
              <span className={`text-sm ${isCompleted ? 'text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
