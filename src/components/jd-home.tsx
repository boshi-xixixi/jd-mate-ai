'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import {
  FileText,
  Trash2,
  Briefcase,
  Sparkles,
  ChevronRight,
  Clock,
  Loader2,
  PenLine,
  MessageCircle,
  Search,
} from 'lucide-react'

export function JDHome() {
  const { jdRecords, createJDRecord, selectJDRecord, deleteJDRecord } = useStore()
  const [jdInput, setJdInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = () => {
    if (!jdInput.trim()) return
    setIsCreating(true)
    createJDRecord(jdInput.trim())
    useStore.getState().setActiveModule('jd-analysis')
    setJdInput('')
    setIsCreating(false)
  }

  const handleSelect = (id: string) => {
    selectJDRecord(id)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('确定删除这个 JD 记录吗？相关的面试和简历数据也会被删除。')) {
      deleteJDRecord(id)
    }
  }

  const hasRecords = jdRecords.length > 0

  return (
    <div className="mx-auto max-w-2xl pt-4">
      {/* Hero Section */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-4"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI 驱动的求职助手
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          JD Mate AI
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          粘贴岗位描述，AI 为你生成面试题、优化简历、模拟面试
        </p>
      </div>

      {/* Input Card */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm mb-6">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium">粘贴目标岗位的 JD</h2>
          </div>
          <Textarea
            value={jdInput}
            onChange={(e) => setJdInput(e.target.value)}
            placeholder="请粘贴完整的岗位描述（JD）..."
            className="min-h-[160px] max-h-[400px] resize-y text-[13px] leading-relaxed border-border/40 focus:border-primary/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleCreate()
              }
            }}
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              按 <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">⌘ Enter</kbd> 快速解析
            </p>
            <Button
              onClick={handleCreate}
              disabled={!jdInput.trim() || isCreating}
              size="sm"
              className="gap-1.5 h-8 text-xs bg-gradient-to-r from-blue-500 via-violet-500 to-primary shadow-lg shadow-blue-500/20"
            >
              {isCreating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
              开始解析
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      {hasRecords && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <h2 className="text-xs font-medium text-muted-foreground">历史记录</h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {jdRecords.length}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {jdRecords.map((record, index) => {
              const hasInterview = record.interview.questions.length > 0
              const hasResume = !!record.resume.data
              const hasMock = record.mockInterview !== null
              const totalItems = [hasInterview, hasResume, hasMock].filter(Boolean).length

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelect(record.id)}
                  className="group flex cursor-pointer items-center gap-3.5 rounded-xl border border-border/30 bg-card/50 p-3.5 transition-all hover:border-primary/30 hover:bg-card hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{record.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {new Date(record.createdAt).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {totalItems > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {hasInterview && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-blue-500/10 text-blue-500 border-0">
                            {record.interview.questions.length} 道题
                          </Badge>
                        )}
                        {hasResume && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-500 border-0">
                            简历
                          </Badge>
                        )}
                        {hasMock && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-500 border-0">
                            面试
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(record.id, e)}
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State - Compact */}
      {!hasRecords && !jdInput && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <Card className="border-dashed border-border/30 bg-card/30">
            <CardContent className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                <Briefcase className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">暂无历史记录</p>
              <p className="text-xs text-muted-foreground/60">粘贴上方的 JD 开始使用</p>
              
              <div className="mt-5 grid grid-cols-4 gap-2.5 max-w-sm mx-auto">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-primary/5">
                  <Search className="h-4 w-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground">JD详解</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-primary/5">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground">面试出题</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-primary/5">
                  <PenLine className="h-4 w-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground">简历优化</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-primary/5">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground">模拟面试</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
