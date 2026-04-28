'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useResumeStore, useAppStore, useInterviewStore, useSettingsStore } from '@/lib/store'
import { getLLMConfig } from '@/lib/api'
import { fetchWithTimeout } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { TokenEstimate } from '@/components/token-estimate'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PenLine,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  User,
  Briefcase,
  FolderGit2,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  FileUp,
  MessageSquare,
  ClipboardList,
  Camera,
} from 'lucide-react'

type InputMode = 'quick' | 'manual'

export function ResumeBuilder() {
  const { userProfile, setUserProfile, addWorkExperience, removeWorkExperience, addProject, removeProject, setResumeStep, setResumeData } = useResumeStore()
  const { jd, parsedJD } = useInterviewStore()
  const { llmConfig } = useSettingsStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [activeTab, setActiveTab] = useState<'basic' | 'work' | 'projects'>('basic')
  const [inputMode, setInputMode] = useState<InputMode>('quick')
  const [quickText, setQuickText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const targetJD = jd
  const targetParsedJD = parsedJD

  const handleAddSkill = () => {
    if (skillInput.trim() && !userProfile.skills.includes(skillInput.trim())) {
      setUserProfile({ skills: [...userProfile.skills, skillInput.trim()] })
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setUserProfile({ skills: userProfile.skills.filter((s) => s !== skill) })
  }

  const handleAddWork = () => {
    addWorkExperience({
      id: Date.now().toString(),
      company: '',
      role: '',
      duration: '',
      description: '',
    })
  }

  const handleAddProject = () => {
    addProject({
      id: Date.now().toString(),
      name: '',
      techStack: '',
      description: '',
      highlights: '',
    })
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/extract-file', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '文件解析失败')
      }

      const data = await res.json()
      setQuickText(data.text)
      setInputMode('quick')
    } catch (err) {
      const message = err instanceof Error ? err.message : '文件上传失败'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
    e.target.value = ''
  }

  const handleQuickExtract = async () => {
    if (!quickText.trim()) {
      setError('请先输入或上传简历内容')
      return
    }

    setExtracting(true)
    setError('')
    try {
      console.log('[简历工坊] 开始提取信息, 文本长度:', quickText.length)
      const res = await fetchWithTimeout('/api/extract-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: quickText,
          ...getLLMConfig(),
        }),
      }, 120000)

      console.log('[简历工坊] 提取信息响应状态:', res.status, res.statusText)

      if (!res.ok) {
        const data = await res.json()
        console.error('[简历工坊] 提取信息失败:', data)
        throw new Error(data.error || '信息提取失败')
      }

      const data = await res.json()
      console.log('[简历工坊] 提取信息成功:', data)
      setUserProfile({
        name: data.name || userProfile.name,
        title: data.title || userProfile.title,
        email: data.email || userProfile.email,
        phone: data.phone || userProfile.phone,
        location: data.location || userProfile.location,
        summary: data.summary || userProfile.summary,
        education: data.education || userProfile.education,
        skills: data.skills?.length > 0 ? data.skills : userProfile.skills,
      })

      if (data.workExperience?.length > 0) {
        for (const w of data.workExperience) {
          addWorkExperience(w)
        }
      }

      if (data.projects?.length > 0) {
        for (const p of data.projects) {
          addProject(p)
        }
      }

      setInputMode('manual')
      setActiveTab('basic')
    } catch (err) {
      console.error('[简历工坊] 提取信息异常:', err)
      const message = err instanceof Error ? err.message : '信息提取失败'
      if (message.includes('API key') || message.includes('401')) {
        setError('API Key 无效或未配置，请点击右上角 ⚙ 设置模型')
      } else {
        setError(message)
      }
    } finally {
      setExtracting(false)
    }
  }

  const handleGenerate = async () => {
    if (!userProfile.name || !targetJD) {
      setError('请填写姓名并确保已输入 JD')
      return
    }

    setLoading(true)
    setError('')
    setResumeStep('generating')

    try {
      console.log('[简历工坊] 开始生成简历, 用户:', userProfile.name, 'JD长度:', targetJD.length)
      const res = await fetchWithTimeout('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          jd: targetJD,
          parsedJD: targetParsedJD,
          ...getLLMConfig(),
        }),
      }, 180000)

      console.log('[简历工坊] 生成简历响应状态:', res.status, res.statusText)

      if (!res.ok) {
        const data = await res.json()
        console.error('[简历工坊] 生成简历失败:', data)
        throw new Error(data.error || '简历生成失败')
      }

      const data = await res.json()
      console.log('[简历工坊] 生成简历成功')
      setResumeData(data)
      setResumeStep('preview')
    } catch (err) {
      console.error('[简历工坊] 生成简历异常:', err)
      const message = err instanceof Error ? err.message : '发生未知错误'
      if (message.includes('API key') || message.includes('401')) {
        setError('API Key 无效或未配置，请点击右上角 ⚙ 设置模型')
      } else {
        setError(message)
      }
      setResumeStep('profile')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { key: 'basic' as const, label: '基本信息', icon: User },
    { key: 'work' as const, label: '工作经历', icon: Briefcase },
    { key: 'projects' as const, label: '项目经历', icon: FolderGit2 },
  ]

  const modeOptions = [
    { key: 'quick' as InputMode, label: '快速导入', icon: MessageSquare, desc: '粘贴文本或上传简历' },
    { key: 'manual' as InputMode, label: '手动填写', icon: ClipboardList, desc: '逐项填写个人信息' },
  ]

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
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-4 via-chart-2 to-chart-3 shadow-2xl shadow-chart-4/20">
            <PenLine className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-chart-4/20 via-chart-2/20 to-chart-3/20 blur-xl -z-10" />
        </motion.div>
        <h2 className="mb-3 text-3xl font-bold tracking-tight">
          <span className="animate-gradient bg-gradient-to-r from-chart-4 via-chart-2 to-chart-3 bg-clip-text text-transparent bg-[length:200%_200%]">
            简历工坊
          </span>
        </h2>
        <p className="text-muted-foreground">
          AI 根据你的背景 + 目标 JD，生成定制化简历
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
        <div className="mb-6 flex gap-1 rounded-xl bg-secondary/50 p-1">
          {modeOptions.map((mode) => {
            const Icon = mode.icon
            const isActive = inputMode === mode.key
            return (
              <button
                key={mode.key}
                onClick={() => setInputMode(mode.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {mode.label}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {inputMode === 'quick' && (
            <motion.div
              key="quick"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-border/40 hover:border-border/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${dragOver ? 'bg-primary/10' : 'bg-muted/50'}`}>
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                      <FileUp className={`h-6 w-6 ${dragOver ? 'text-primary' : 'text-muted-foreground/50'}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {uploading ? '正在解析文件...' : '拖拽文件到此处，或'}
                      {!uploading && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="ml-1 text-primary hover:underline cursor-pointer"
                        >
                          点击上传
                        </button>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/50">
                      支持 PDF、DOCX、TXT、Markdown，最大 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/30" />
                <span className="text-xs text-muted-foreground/50">或直接粘贴内容</span>
                <div className="h-px flex-1 bg-border/30" />
              </div>

              <div>
                <Textarea
                  value={quickText}
                  onChange={(e) => setQuickText(e.target.value)}
                  placeholder={`粘贴你的简历内容、LinkedIn 主页信息、或用一段话描述你的背景...\n\n例如：\n我叫张三，5年前端开发经验，目前在XX公司担任高级前端工程师。擅长 React、TypeScript、Node.js。之前在YY公司做过电商中台项目，负责前端架构设计...`}
                  className="min-h-[180px] resize-none border-border/50 bg-background/50 text-sm leading-relaxed"
                />
                <p className="mt-1.5 text-xs text-muted-foreground/50">
                  AI 会自动从文本中提取姓名、工作经历、项目经历等信息
                </p>
              </div>

              <div className="flex items-center justify-between">
                {quickText && (
                  <p className="text-xs text-muted-foreground">
                    已输入 {quickText.length} 字
                  </p>
                )}
                {!quickText && <div />}
                <Button
                  onClick={handleQuickExtract}
                  disabled={extracting || !quickText.trim()}
                  className="gap-2 bg-primary px-6"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI 提取中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      AI 提取信息
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {inputMode === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6 flex gap-1 rounded-xl bg-secondary/50 p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'basic' && (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0">
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">头像</label>
                        <div className="relative group">
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              if (file.size > 2 * 1024 * 1024) return
                              const reader = new FileReader()
                              reader.onload = (ev) => {
                                const img = document.createElement('img')
                                img.onload = () => {
                                  const canvas = document.createElement('canvas')
                                  const size = 200
                                  canvas.width = size
                                  canvas.height = size
                                  const ctx = canvas.getContext('2d')
                                  if (!ctx) return
                                  const minDim = Math.min(img.width, img.height)
                              const sx = (img.width - minDim) / 2
                              const sy = (img.height - minDim) / 2
                              ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)
                              setUserProfile({ avatarUrl: canvas.toDataURL('image/jpeg', 0.85) })
                                }
                                img.src = ev.target?.result as string
                              }
                              reader.readAsDataURL(file)
                              e.target.value = ''
                            }}
                            className="hidden"
                          />
                          <button
                            onClick={() => avatarInputRef.current?.click()}
                            className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border/50 bg-muted/30 transition-all hover:border-primary/40 hover:bg-muted/50 cursor-pointer"
                          >
                            {userProfile.avatarUrl ? (
                              <Image src={userProfile.avatarUrl} alt="avatar" fill className="object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-muted-foreground/40">
                                <Camera className="h-5 w-5" />
                                <span className="text-[9px]">上传</span>
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <Camera className="h-5 w-5 text-white" />
                            </div>
                          </button>
                          {userProfile.avatarUrl && (
                            <button
                              onClick={() => setUserProfile({ avatarUrl: '' })}
                              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/80 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1.5 text-[10px] text-muted-foreground/50">JPG/PNG，≤2MB</p>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">姓名 *</label>
                            <input
                              value={userProfile.name}
                              onChange={(e) => setUserProfile({ name: e.target.value })}
                              placeholder="张三"
                              className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">目标职位</label>
                            <input
                              value={userProfile.title}
                              onChange={(e) => setUserProfile({ title: e.target.value })}
                              placeholder="高级前端工程师"
                              className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">邮箱</label>
                        <input
                          value={userProfile.email}
                          onChange={(e) => setUserProfile({ email: e.target.value })}
                          placeholder="zhangsan@email.com"
                          className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">电话</label>
                        <input
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile({ phone: e.target.value })}
                          placeholder="138-xxxx-xxxx"
                          className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">城市</label>
                      <input
                        value={userProfile.location}
                        onChange={(e) => setUserProfile({ location: e.target.value })}
                        placeholder="北京"
                        className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">个人简介</label>
                      <Textarea
                        value={userProfile.summary}
                        onChange={(e) => setUserProfile({ summary: e.target.value })}
                        placeholder="5年前端开发经验，擅长 React 生态..."
                        className="min-h-[80px] resize-none border-border/50 bg-background/50 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">教育背景</label>
                      <input
                        value={userProfile.education}
                        onChange={(e) => setUserProfile({ education: e.target.value })}
                        placeholder="XX大学 · 计算机科学 · 本科 · 2018"
                        className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">技能标签</label>
                      <div className="flex gap-2">
                        <input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                          placeholder="输入技能后回车添加"
                          className="flex-1 rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                        />
                        <Button variant="outline" size="sm" onClick={handleAddSkill} className="gap-1">
                          <Plus className="h-3.5 w-3.5" />
                          添加
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {userProfile.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="gap-1 text-xs">
                            {skill}
                            <button onClick={() => handleRemoveSkill(skill)} className="hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'work' && (
                  <motion.div
                    key="work"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {userProfile.workExperience.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
                        <Briefcase className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">还没有工作经历</p>
                        <p className="text-xs text-muted-foreground/50">点击下方按钮添加</p>
                      </div>
                    )}

                    {userProfile.workExperience.map((exp, index) => (
                      <Card key={exp.id} className="border-border/30 bg-background/30">
                        <CardHeader className="flex flex-row items-center justify-between p-4">
                          <span className="text-xs font-medium text-muted-foreground">工作经历 #{index + 1}</span>
                          <button
                            onClick={() => removeWorkExperience(exp.id)}
                            className="text-muted-foreground/50 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </CardHeader>
                        <CardContent className="space-y-3 px-4 pb-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              value={exp.company}
                              onChange={(e) =>
                                useResumeStore.getState().updateWorkExperience(exp.id, { company: e.target.value })
                              }
                              placeholder="公司名称"
                              className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50"
                            />
                            <input
                              value={exp.role}
                              onChange={(e) =>
                                useResumeStore.getState().updateWorkExperience(exp.id, { role: e.target.value })
                              }
                              placeholder="职位"
                              className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50"
                            />
                          </div>
                          <input
                            value={exp.duration}
                            onChange={(e) =>
                              useResumeStore.getState().updateWorkExperience(exp.id, { duration: e.target.value })
                            }
                            placeholder="时间段，如 2021.06 - 至今"
                            className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50"
                          />
                          <Textarea
                            value={exp.description}
                            onChange={(e) =>
                              useResumeStore.getState().updateWorkExperience(exp.id, { description: e.target.value })
                            }
                            placeholder="工作内容和成果，建议用 STAR 法则描述..."
                            className="min-h-[80px] resize-none border-border/50 bg-background/50 text-sm"
                          />
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      variant="outline"
                      onClick={handleAddWork}
                      className="w-full gap-2 border-dashed"
                    >
                      <Plus className="h-4 w-4" />
                      添加工作经历
                    </Button>
                  </motion.div>
                )}

                {activeTab === 'projects' && (
                  <motion.div
                    key="projects"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {userProfile.projects.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
                        <FolderGit2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">还没有项目经历</p>
                        <p className="text-xs text-muted-foreground/50">点击下方按钮添加</p>
                      </div>
                    )}

                    {userProfile.projects.map((proj, index) => (
                      <Card key={proj.id} className="border-border/30 bg-background/30">
                        <CardHeader className="flex flex-row items-center justify-between p-4">
                          <span className="text-xs font-medium text-muted-foreground">项目经历 #{index + 1}</span>
                          <button
                            onClick={() => removeProject(proj.id)}
                            className="text-muted-foreground/50 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </CardHeader>
                        <CardContent className="space-y-3 px-4 pb-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              value={proj.name}
                              onChange={(e) =>
                                useResumeStore.getState().updateProject(proj.id, { name: e.target.value })
                              }
                              placeholder="项目名称"
                              className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50"
                            />
                            <input
                              value={proj.techStack}
                              onChange={(e) =>
                                useResumeStore.getState().updateProject(proj.id, { techStack: e.target.value })
                              }
                              placeholder="技术栈，如 React + TypeScript"
                              className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50"
                            />
                          </div>
                          <Textarea
                            value={proj.description}
                            onChange={(e) =>
                              useResumeStore.getState().updateProject(proj.id, { description: e.target.value })
                            }
                            placeholder="项目描述..."
                            className="min-h-[60px] resize-none border-border/50 bg-background/50 text-sm"
                          />
                          <Textarea
                            value={proj.highlights}
                            onChange={(e) =>
                              useResumeStore.getState().updateProject(proj.id, { highlights: e.target.value })
                            }
                            placeholder="项目亮点和成果..."
                            className="min-h-[60px] resize-none border-border/50 bg-background/50 text-sm"
                          />
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      variant="outline"
                      onClick={handleAddProject}
                      className="w-full gap-2 border-dashed"
                    >
                      <Plus className="h-4 w-4" />
                      添加项目经历
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {userProfile.name && <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
            {!userProfile.name && <AlertCircle className="h-3.5 w-3.5 text-yellow-400" />}
            <span>{userProfile.name ? '基本信息已填写' : '请填写姓名'}</span>
          </div>

          <div className="flex items-center gap-3">
            <TokenEstimate
              input={3000}
              output={5000}
              label="简历生成"
              model={llmConfig.model || 'doubao-seed-2-0-lite-260215'}
            />
            <Button
              onClick={handleGenerate}
              disabled={loading || !userProfile.name || !targetJD}
              size="lg"
              className="gap-2 bg-gradient-to-r from-chart-4 to-chart-2 px-8 shadow-lg shadow-chart-4/25"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  生成简历
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
