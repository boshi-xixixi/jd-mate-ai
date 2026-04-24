'use client'

import { useState } from 'react'
import { useInterviewStore } from '@/lib/store'
import type { QuestionType } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Code2,
  HelpCircle,
  ListChecks,
  PenLine,
  ToggleLeft,
} from 'lucide-react'

const typeConfig: Record<QuestionType, { label: string; icon: React.ElementType; color: string }> = {
  'single-choice': { label: '单选题', icon: CheckCircle2, color: 'text-chart-1' },
  'multiple-choice': { label: '多选题', icon: ListChecks, color: 'text-chart-2' },
  'true-false': { label: '判断题', icon: ToggleLeft, color: 'text-chart-4' },
  'short-answer': { label: '简答题', icon: PenLine, color: 'text-chart-3' },
  coding: { label: '代码题', icon: Code2, color: 'text-chart-5' },
}

const difficultyConfig = {
  easy: { label: '基础', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  medium: { label: '进阶', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  hard: { label: '挑战', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
}

function getSavedAnswer(answers: Array<{ questionId: string; answer?: string; selectedOptions?: string[] }>, questionId: string | undefined) {
  const saved = answers.find((a) => a.questionId === questionId)
  return {
    multiSelect: saved?.selectedOptions || [],
    textAnswer: saved?.answer || '',
    singleSelect: saved?.selectedOptions?.[0] || '',
  }
}

export function QuestionCard() {
  const {
    questions,
    answers,
    currentQuestionIndex,
    setAnswer,
    nextQuestion,
    prevQuestion,
    setCurrentQuestionIndex,
    setStep,
  } = useInterviewStore()

  const question = questions[currentQuestionIndex]
  const saved = getSavedAnswer(answers, question?.id)
  const [multiSelect, setMultiSelect] = useState<string[]>(saved.multiSelect)
  const [textAnswer, setTextAnswer] = useState(saved.textAnswer)
  const [singleSelect, setSingleSelect] = useState(saved.singleSelect)

  if (!question) return null

  const config = typeConfig[question.type]
  const diffConfig = difficultyConfig[question.difficulty]
  const Icon = config.icon
  const isLast = currentQuestionIndex === questions.length - 1
  const answeredCount = answers.filter((a) =>
    questions.some((q) => q.id === a.questionId)
  ).length

  const handleSingleSelect = (value: string) => {
    setSingleSelect(value)
    setAnswer({
      questionId: question.id,
      answer: value,
      selectedOptions: [value],
    })
  }

  const handleMultiSelect = (option: string) => {
    const newSelected = multiSelect.includes(option)
      ? multiSelect.filter((o) => o !== option)
      : [...multiSelect, option]
    setMultiSelect(newSelected)
    setAnswer({
      questionId: question.id,
      answer: newSelected.join(', '),
      selectedOptions: newSelected,
    })
  }

  const handleTextAnswer = (value: string) => {
    setTextAnswer(value)
    if (value.trim()) {
      setAnswer({
        questionId: question.id,
        answer: value,
      })
    }
  }

  const handleSubmit = () => {
    setStep('evaluating')
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          已答 {answeredCount}/{questions.length}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {questions.map((q, i) => {
          const isAnsweredQ = answers.some((a) => a.questionId === q.id)
          const isCurrentQ = i === currentQuestionIndex
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(i)}
              aria-label={`跳转到第 ${i + 1} 题`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isCurrentQ
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : isAnsweredQ
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-secondary ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <Badge variant="outline" className={`text-[10px] ${diffConfig.color}`}>
                  {diffConfig.label}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {config.label}
                </Badge>
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {question.points} 分
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] text-primary/70">
                  {question.skillTag}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="mb-6 text-base leading-relaxed font-medium">
                {question.question}
              </div>

              {question.codeSnippet && (
                <div className="mb-6 overflow-hidden rounded-xl border border-border/30">
                  <div className="flex items-center gap-2 border-b border-border/30 bg-secondary/50 px-4 py-2">
                    <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Code</span>
                  </div>
                  <pre className="overflow-x-auto bg-background/80 p-4">
                    <code className="text-sm leading-relaxed text-foreground/90">
                      {question.codeSnippet}
                    </code>
                  </pre>
                </div>
              )}

              <Separator className="mb-6 bg-border/30" />

              {(question.type === 'single-choice' || question.type === 'true-false') && (
                <RadioGroup
                  value={singleSelect}
                  onValueChange={handleSingleSelect}
                  className="space-y-3"
                >
                  {question.options?.map((option) => (
                    <div key={option.label}>
                      <Label
                        htmlFor={`${question.id}-${option.label}`}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                          singleSelect === option.label
                            ? 'border-primary/50 bg-primary/10 text-foreground'
                            : 'border-border/30 bg-background/30 hover:border-border/50 hover:bg-secondary/30'
                        }`}
                      >
                        <RadioGroupItem
                          value={option.label}
                          id={`${question.id}-${option.label}`}
                          className="border-primary/50"
                        />
                        <span className="mr-2 text-xs font-bold text-muted-foreground">
                          {option.label}.
                        </span>
                        <span className="text-sm">{option.text}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === 'multiple-choice' && (
                <div className="space-y-3">
                  {question.options?.map((option) => {
                    const isSelected = multiSelect.includes(option.label)
                    return (
                      <button
                        key={option.label}
                        onClick={() => handleMultiSelect(option.label)}
                        role="checkbox"
                        aria-checked={isSelected}
                        aria-label={`选项 ${option.label}: ${option.text}`}
                        className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary/50 bg-primary/10 text-foreground'
                            : 'border-border/30 bg-background/30 hover:border-border/50 hover:bg-secondary/30'
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <span className="mr-2 text-xs font-bold text-muted-foreground">
                          {option.label}.
                        </span>
                        <span className="text-sm">{option.text}</span>
                      </button>
                    )
                  })}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                    <HelpCircle className="h-3 w-3" />
                    多选题：可选择多个选项
                  </p>
                </div>
              )}

              {(question.type === 'short-answer' || question.type === 'coding') && (
                <div className="space-y-3">
                  <Textarea
                    value={textAnswer}
                    onChange={(e) => handleTextAnswer(e.target.value)}
                    placeholder={
                      question.type === 'coding'
                        ? '请描述你的实现思路，或直接写出代码...'
                        : '请输入你的答案...'
                    }
                    className="min-h-[160px] resize-none border-border/30 bg-background/30 text-sm leading-relaxed focus-visible:ring-primary/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    {question.type === 'coding'
                      ? '💡 重点描述思路和关键代码即可，无需完整实现'
                      : '💡 尽量使用专业术语，条理清晰地作答'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className="gap-1 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          上一题
        </Button>

        {isLast ? (
          <Button
            onClick={handleSubmit}
            className="gap-2 bg-gradient-to-r from-primary to-chart-2 px-8 shadow-lg shadow-primary/25"
            disabled={answeredCount < questions.length}
          >
            <Send className="h-4 w-4" />
            提交答案
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={nextQuestion}
            className="gap-1 text-muted-foreground"
          >
            下一题
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
