'use client'

import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import type { SkillTag } from '@/lib/types'
import { motion } from 'framer-motion'
import { Code2, Building2, Award, PenLine, MessageCircle, FileText, Search } from 'lucide-react'

interface SkillTagsProps {
  skills: SkillTag[]
  level: string
  summary: string
  showActions?: boolean
}

const categoryConfig = {
  technical: {
    icon: Code2,
    color: 'bg-primary/15 text-primary border-primary/30',
    label: '技术技能',
  },
  business: {
    icon: Building2,
    color: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
    label: '业务场景',
  },
  experience: {
    icon: Award,
    color: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
    label: '经验要求',
  },
} as const

const quickActions = [
  { key: 'jd-analysis' as const, label: 'JD详解', icon: Search, gradient: 'from-blue-500 to-violet-500' },
  { key: 'interview' as const, label: '开始答题', icon: FileText, gradient: 'from-primary to-chart-2' },
  { key: 'resume' as const, label: '生成简历', icon: PenLine, gradient: 'from-chart-4 to-chart-2' },
  { key: 'mock-interview' as const, label: '模拟面试', icon: MessageCircle, gradient: 'from-chart-3 to-primary' },
]

export function SkillTags({ skills, level, summary, showActions = true }: SkillTagsProps) {
  const { setActiveModule } = useAppStore()

  const grouped = {
    technical: skills.filter((s) => s.category === 'technical'),
    business: skills.filter((s) => s.category === 'business'),
    experience: skills.filter((s) => s.category === 'experience'),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">AI 解析结果</h3>
        <Badge variant="outline" className="text-xs">
          {level}
        </Badge>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-foreground/80">{summary}</p>

      <div className="space-y-4">
        {(Object.entries(grouped) as [keyof typeof categoryConfig, SkillTag[]][]).map(
          ([category, items]) => {
            if (items.length === 0) return null
            const config = categoryConfig[category]
            const Icon = config.icon

            return (
              <div key={category}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Badge
                        variant="outline"
                        className={`${config.color} border text-xs font-medium`}
                      >
                        {skill.name}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          }
        )}
      </div>

      {showActions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 border-t border-border/30 pt-5"
        >
          <p className="mb-3 text-xs text-muted-foreground">JD 已就绪，你可以：</p>
          <div className="grid gap-2 sm:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.key}
                  onClick={() => setActiveModule(action.key)}
                  className="group flex items-center gap-2 rounded-xl border border-border/30 bg-secondary/30 p-3 text-left text-xs font-medium transition-all hover:border-border/50 hover:bg-secondary/60 cursor-pointer"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${action.gradient} shadow-sm`}>
                    <Icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-foreground/80 group-hover:text-foreground">{action.label}</span>
                </button>
              )
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
