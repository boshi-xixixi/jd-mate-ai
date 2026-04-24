'use client'

import { useInterviewStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Check, ClipboardList, Search, Sparkles, PenLine, Bot, BarChart3 } from 'lucide-react'

const steps = [
  { key: 'idle', label: '粘贴 JD', icon: ClipboardList },
  { key: 'parsing', label: 'AI 解析', icon: Search },
  { key: 'generating', label: '生成题目', icon: Sparkles },
  { key: 'practicing', label: '答题', icon: PenLine },
  { key: 'evaluating', label: 'AI 判卷', icon: Bot },
  { key: 'result', label: '查看报告', icon: BarChart3 },
] as const

export function StepIndicator() {
  const { currentStep } = useInterviewStore()

  const currentIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <div className="mb-8 flex items-center justify-center gap-1" role="list">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = step.key === currentStep
        const isPending = index > currentIndex

        return (
          <div key={step.key} className="flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2"
              role="listitem"
              aria-label={`步骤 ${index + 1}: ${step.label}${isCompleted ? ' (已完成)' : isCurrent ? ' (当前)' : ''}`}
            >
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-300
                  ${isCompleted ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : ''}
                  ${isCurrent ? 'bg-primary/20 text-primary ring-2 ring-primary/50 animate-pulse-glow' : ''}
                  ${isPending ? 'bg-secondary text-muted-foreground' : ''}
                `}
              >
              {isCompleted ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
              </div>
              <span
                className={`hidden text-xs sm:inline ${
                  isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </motion.div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-px w-6 transition-colors duration-300 sm:w-10 ${
                  isCompleted ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
