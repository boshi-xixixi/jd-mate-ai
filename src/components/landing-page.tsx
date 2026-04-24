'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Brain,
  Target,
  Zap,
  FileText,
  PenLine,
  MessageCircle,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Code2,
  Users,
  Trophy,
} from 'lucide-react'

const workflowSteps = [
  {
    icon: FileText,
    title: '粘贴 JD',
    desc: '只需一份岗位描述，开启智能求职之旅',
    gradient: 'from-blue-500 to-violet-500',
  },
  {
    icon: Brain,
    title: 'AI 解析',
    desc: '深度分析技能栈与核心要求',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Target,
    title: '精准出题',
    desc: '匹配岗位技能点生成面试题',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: '备战面试',
    desc: '模拟面试、简历优化一站搞定',
    gradient: 'from-pink-500 to-amber-500',
  },
]

const features = [
  {
    icon: Code2,
    title: '智能面试出题',
    desc: '基于 JD 精准生成 9 道面试题，覆盖基础到高难度，全面检验你的技术实力',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'hover:border-blue-500/30',
  },
  {
    icon: PenLine,
    title: '简历优化工坊',
    desc: 'AI 运用 STAR 法则重写简历，提升 JD 匹配度，让 HR 一眼看到你的亮点',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'hover:border-violet-500/30',
  },
  {
    icon: MessageCircle,
    title: 'AI 模拟面试',
    desc: '还原真实面试场景，多轮追问互动，即时反馈建议，助你从容应对',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'hover:border-amber-500/30',
  },
  {
    icon: BarChart3,
    title: '能力雷达分析',
    desc: '多维度评分可视化，精准定位知识盲区，制定提升计划',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'hover:border-emerald-500/30',
  },
]

const stats = [
  { icon: Trophy, label: '面试题目', value: '5000+' },
  { icon: Users, label: '求职用户', value: '10000+' },
  { icon: Target, label: '技能覆盖', value: '100+' },
  { icon: Sparkles, label: '好评率', value: '98%' },
]

const highlights = [
  'AI 深度解析岗位需求，精准提取核心技能点',
  '智能生成针对性面试题，告别盲目刷题',
  'STAR 法则优化简历，提升面试邀约率',
  '模拟真实面试场景，提前适应面试节奏',
  '多维度能力评估，明确提升方向',
]

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [isHovering, setIsHovering] = useState(false)

  const handleStart = () => {
    onEnter()
  }

  return (
    <div className="relative mx-auto max-w-6xl">
      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
        {/* Animated Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
        </div>

        <div className="relative z-10 flex h-full min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6 py-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary"
          >
            <Sparkles className="h-4 w-4" />
            AI 驱动的求职助手
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-center"
          >
            <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              <span className="bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                JD Mate AI
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground sm:text-2xl">
              一份 JD，开启 AI 求职全链路
            </p>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 max-w-xl text-center text-base text-muted-foreground/80 sm:text-lg"
          >
            粘贴岗位描述，AI 为你生成定制化面试题、优化简历、模拟面试，助你轻松拿下心仪 Offer
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-16"
          >
            <button
              onClick={handleStart}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 px-10 py-5 text-lg font-semibold text-white shadow-2xl shadow-violet-500/25 transition-all duration-300 hover:scale-105 hover:shadow-violet-500/40"
            >
              <Sparkles className="h-6 w-6" />
              开始使用
              <motion.div
                animate={{ x: isHovering ? 6 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="h-6 w-6" />
              </motion.div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 blur-xl opacity-50 transition-opacity group-hover:opacity-75" />
            </button>
          </motion.div>

          {/* Workflow Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mx-auto mb-16 max-w-5xl"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="relative rounded-xl border border-border/30 bg-card/30 p-5 backdrop-blur-sm transition-all hover:border-border/50 hover:bg-card/50"
                  >
                    <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${step.gradient} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="mb-1 text-sm font-semibold">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:gap-12"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative border-t border-border/30 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
              一站式求职解决方案
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              从岗位解析到面试通关，AI 全程助力你的求职之路
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-xl border border-border/30 bg-card/30 p-6 backdrop-blur-sm transition-all hover:shadow-lg ${feature.border}`}
                >
                  <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.bg}`}>
                    <Icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="relative border-t border-border/30 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <h2 className="mb-3 text-3xl font-bold tracking-tight">
              为什么选择 JD Mate AI？
            </h2>
            <p className="text-muted-foreground">
              让 AI 成为你最强大的求职武器
            </p>
          </motion.div>

          <div className="space-y-4">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 rounded-lg border border-border/20 bg-card/20 p-4 backdrop-blur-sm"
              >
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-sm leading-relaxed">{highlight}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative border-t border-border/30 px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            准备好开启你的求职之旅了吗？
          </h2>
          <p className="mb-8 text-muted-foreground">
            只需一份岗位描述，让 AI 助你一臂之力
          </p>
          <button
            onClick={handleStart}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:scale-105 hover:shadow-violet-500/40"
          >
            立即开始
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
