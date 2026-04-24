'use client'

import { useRef, useState, useMemo, useEffect } from 'react'
import { useResumeStore, useAppStore, useInterviewStore, useSettingsStore } from '@/lib/store'
import { getLLMConfig } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Target,
  Lightbulb,
  FileText,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Code2,
  User,
  ChevronRight,
  Palette,
  Pencil,
  Check,
  X,
  Plus,
  Trash2,
  History,
  Clock,
  Undo2,
  Loader2,
  Eye,
  Printer,
} from 'lucide-react'

const resumeThemes = [
  { id: 'indigo', name: '靛蓝', sidebar: '#1e1b4b', accent: '#6366f1', accentLight: '#818cf8', text: '#e0e7ff', textMuted: 'rgba(224,231,255,0.6)', tagBg: 'rgba(129,140,248,0.2)', tagColor: '#c7d2fe', tagBgAlt: 'rgba(129,140,248,0.1)', tagColorAlt: '#a5b4fc', avatarGrad: 'linear-gradient(135deg, #6366f1, #8b5cf6)', sectionIcon: 'bg-indigo-50 text-indigo-600', sectionTitle: 'text-indigo-900', dot: 'bg-indigo-400', accentBar: 'bg-indigo-500', codeBg: 'bg-indigo-50', codeText: 'text-indigo-600' },
  { id: 'slate', name: '石墨', sidebar: '#0f172a', accent: '#475569', accentLight: '#64748b', text: '#e2e8f0', textMuted: 'rgba(226,232,240,0.5)', tagBg: 'rgba(148,163,184,0.2)', tagColor: '#cbd5e1', tagBgAlt: 'rgba(148,163,184,0.1)', tagColorAlt: '#94a3b8', avatarGrad: 'linear-gradient(135deg, #475569, #64748b)', sectionIcon: 'bg-slate-100 text-slate-600', sectionTitle: 'text-slate-800', dot: 'bg-slate-400', accentBar: 'bg-slate-500', codeBg: 'bg-slate-50', codeText: 'text-slate-600' },
  { id: 'emerald', name: '翡翠', sidebar: '#022c22', accent: '#059669', accentLight: '#34d399', text: '#d1fae5', textMuted: 'rgba(209,250,229,0.5)', tagBg: 'rgba(52,211,153,0.2)', tagColor: '#a7f3d0', tagBgAlt: 'rgba(52,211,153,0.1)', tagColorAlt: '#6ee7b7', avatarGrad: 'linear-gradient(135deg, #059669, #34d399)', sectionIcon: 'bg-emerald-50 text-emerald-600', sectionTitle: 'text-emerald-900', dot: 'bg-emerald-400', accentBar: 'bg-emerald-500', codeBg: 'bg-emerald-50', codeText: 'text-emerald-600' },
  { id: 'rose', name: '玫瑰', sidebar: '#4c0519', accent: '#e11d48', accentLight: '#fb7185', text: '#ffe4e6', textMuted: 'rgba(255,228,230,0.5)', tagBg: 'rgba(251,113,133,0.2)', tagColor: '#fecdd3', tagBgAlt: 'rgba(251,113,133,0.1)', tagColorAlt: '#fda4af', avatarGrad: 'linear-gradient(135deg, #e11d48, #fb7185)', sectionIcon: 'bg-rose-50 text-rose-600', sectionTitle: 'text-rose-900', dot: 'bg-rose-400', accentBar: 'bg-rose-500', codeBg: 'bg-rose-50', codeText: 'text-rose-600' },
  { id: 'amber', name: '琥珀', sidebar: '#451a03', accent: '#d97706', accentLight: '#fbbf24', text: '#fef3c7', textMuted: 'rgba(254,243,199,0.5)', tagBg: 'rgba(251,191,36,0.2)', tagColor: '#fde68a', tagBgAlt: 'rgba(251,191,36,0.1)', tagColorAlt: '#fcd34d', avatarGrad: 'linear-gradient(135deg, #d97706, #fbbf24)', sectionIcon: 'bg-amber-50 text-amber-600', sectionTitle: 'text-amber-900', dot: 'bg-amber-400', accentBar: 'bg-amber-500', codeBg: 'bg-amber-50', codeText: 'text-amber-600' },
]

const statusConfig = {
  matched: { icon: CheckCircle2, label: '匹配', dot: 'bg-emerald-400', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  partial: { icon: AlertTriangle, label: '部分', dot: 'bg-amber-400', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  missing: { icon: XCircle, label: '缺失', dot: 'bg-red-400', bg: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

interface ResumeSection {
  title: string
  icon: string
  content: string
}

function parseMarkdownSections(markdown: string): ResumeSection[] {
  const sections: ResumeSection[] = []
  const parts = markdown.split(/^(?=##\s)/m)
  for (const part of parts) {
    const match = part.match(/^##\s*(.+)/)
    if (match) {
      sections.push({
        title: match[1].trim(),
        icon: getSectionIcon(match[1].trim()),
        content: part.replace(/^##\s*.+\n?/, '').trim(),
      })
    }
  }
  return sections
}

function getSectionIcon(title: string): string {
  const lower = title.toLowerCase()
  if (lower.includes('工作') || lower.includes('经历') || lower.includes('experience')) return 'briefcase'
  if (lower.includes('教育') || lower.includes('education')) return 'education'
  if (lower.includes('项目') || lower.includes('project')) return 'code'
  if (lower.includes('技能') || lower.includes('skill')) return 'skill'
  if (lower.includes('自我') || lower.includes('about') || lower.includes('简介')) return 'user'
  return 'default'
}

function extractName(markdown: string): string {
  const h1 = markdown.match(/^#\s+(.+)$/m)
  return h1 ? h1[1].trim() : ''
}

function extractContact(markdown: string) {
  const email = markdown.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || ''
  const phone = markdown.match(/1[3-9]\d{9}/)?.[0] || ''
  const location = markdown.match(/(?:地址|城市|所在地|地点)[:：]\s*(.+)/)?.[1]?.trim() || ''
  return { email, phone, location }
}

function formatInlineMarkdown(text: string, theme: typeof resumeThemes[0], darkMode = false): string {
  const boldStyle = darkMode ? `color:${theme.text};font-weight:600` : ''
  const boldTailwind = darkMode ? '' : 'font-semibold text-gray-900'
  const codeStyle = darkMode ? `background:${theme.tagBg};color:${theme.tagColor};border-radius:4px;padding:1px 6px;font-size:12px;font-weight:500` : ''
  const codeTailwind = darkMode ? '' : `rounded-md ${theme.codeBg} ${theme.codeText} px-1.5 py-0.5 text-[12px] font-medium`
  const linkStyle = darkMode ? `color:${theme.tagColorAlt};font-weight:500` : ''
  const linkTailwind = darkMode ? '' : `${theme.codeText} font-medium`
  return text
    .replace(/\*\*(.+?)\*\*/g, `<strong ${boldStyle ? `style="${boldStyle}"` : ''} ${boldTailwind ? `class="${boldTailwind}"` : ''}>$1</strong>`)
    .replace(/`(.+?)`/g, `<code ${codeStyle ? `style="${codeStyle}"` : ''} ${codeTailwind ? `class="${codeTailwind}"` : ''}>$1</code>`)
    .replace(/\[(.+?)\]\((.+?)\)/g, `<span ${linkStyle ? `style="${linkStyle}"` : ''} ${linkTailwind ? `class="${linkTailwind}"` : ''}>$1</span>`)
}

function computeDiffLines(oldText: string, newText: string): Map<string, 'added' | 'removed'> {
  const diffMap = new Map<string, 'added' | 'removed'>()
  const oldLines = new Set(oldText.split('\n').map(l => l.trim()).filter(Boolean))
  const newLines = new Set(newText.split('\n').map(l => l.trim()).filter(Boolean))

  for (const line of newLines) {
    if (!oldLines.has(line)) diffMap.set(line, 'added')
  }
  for (const line of oldLines) {
    if (!newLines.has(line)) diffMap.set(line, 'removed')
  }
  return diffMap
}

function renderMarkdownText(text: string, theme: typeof resumeThemes[0], diffMap?: Map<string, 'added' | 'removed'>, darkMode = false) {
  if (!text) return null
  const lines = text.split('\n')
  const textMain = darkMode ? theme.text : 'text-gray-700'
  const textBold = darkMode ? theme.text : 'text-gray-900'
  const textSub = darkMode ? theme.text : 'text-gray-800'
  const codeClass = darkMode ? `${theme.tagBg} ${theme.tagColor}` : `${theme.codeBg} ${theme.codeText}`
  const linkColor = darkMode ? theme.tagColorAlt : theme.codeText

  return lines.map((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return null
    const diffStatus = diffMap?.get(trimmed)
    const addedClass = diffStatus === 'added' ? 'bg-emerald-100/80 rounded px-1 -mx-1' : ''
    const removedClass = diffStatus === 'removed' ? 'bg-red-100/80 rounded px-1 -mx-1 line-through opacity-60' : ''
    const diffClass = addedClass || removedClass

    if (trimmed.startsWith('### ')) {
      return <h3 key={i} className={`mt-5 mb-2 text-[15px] font-bold ${darkMode ? '' : textBold} ${diffClass}`} style={darkMode ? { color: theme.text } : {}}>{trimmed.replace(/^###\s+/, '')}</h3>
    }
    if (trimmed.startsWith('#### ')) {
      return <h4 key={i} className={`mt-4 mb-1.5 text-[13.5px] font-semibold ${darkMode ? '' : textSub} ${diffClass}`} style={darkMode ? { color: theme.text, opacity: 0.8 } : {}}>{trimmed.replace(/^####\s+/, '')}</h4>
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.replace(/^[-*]\s+/, '')
      return (
        <div key={i} className={`flex gap-3 py-1.5 pl-1 ${diffClass}`}>
          <span className={`mt-[8px] h-2 w-2 flex-shrink-0 rounded-full ${theme.dot}`} />
          <span className={`text-[14px] leading-[1.8] ${darkMode ? '' : textMain}`} style={darkMode ? { color: theme.text, opacity: 0.85 } : {}} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content, theme, darkMode) }} />
        </div>
      )
    }
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return <p key={i} className={`mt-3 mb-1.5 text-[14px] font-semibold ${darkMode ? '' : textBold} ${diffClass}`} style={darkMode ? { color: theme.text } : {}}>{trimmed.replace(/\*\*/g, '')}</p>
    }
    return <p key={i} className={`text-[14px] leading-[1.8] ${darkMode ? '' : textMain} ${diffClass}`} style={darkMode ? { color: theme.text, opacity: 0.85 } : {}} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed, theme, darkMode) }} />
  })
}

function renderDiffText(oldText: string, newText: string) {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')

  const oldSet = new Set(oldLines.map(l => l.trim()).filter(Boolean))
  const newSet = new Set(newLines.map(l => l.trim()).filter(Boolean))

  const added = newLines.filter(l => l.trim() && !oldSet.has(l.trim()))
  const removed = oldLines.filter(l => l.trim() && !newSet.has(l.trim()))

  const allLines = newLines.filter(l => l.trim())

  return (
    <div className="space-y-1 text-[12px] leading-relaxed font-mono">
      {allLines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return null
        const isAdded = added.some(a => a.trim() === trimmed)
        const isRemoved = removed.some(r => r.trim() === trimmed)
        if (isAdded) {
          return (
            <div key={i} className="flex gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border-l-2 border-emerald-500">
              <span className="text-emerald-500 font-bold">+</span>
              <span className="text-emerald-700 dark:text-emerald-400">{trimmed}</span>
            </div>
          )
        }
        return (
          <div key={i} className="px-2 py-0.5 text-muted-foreground">
            {trimmed}
          </div>
        )
      })}
      {removed.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return null
        return (
          <div key={`del-${i}`} className="flex gap-1 px-2 py-0.5 rounded bg-red-500/10 border-l-2 border-red-500">
            <span className="text-red-500 font-bold">-</span>
            <span className="text-red-700 dark:text-red-400 line-through">{trimmed}</span>
          </div>
        )
      })}
    </div>
  )
}

type ParsedItem =
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'paragraph'; text: string }

function parseSectionContent(content: string): ParsedItem[] {
  const items: ParsedItem[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('#### ')) {
      items.push({ type: 'subheading', text: trimmed.replace(/^####\s+/, '') })
    } else if (trimmed.startsWith('### ')) {
      items.push({ type: 'heading', text: trimmed.replace(/^###\s+/, '') })
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      items.push({ type: 'bullet', text: trimmed.replace(/^[-*]\s+/, '') })
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      items.push({ type: 'paragraph', text: trimmed })
    } else {
      items.push({ type: 'paragraph', text: trimmed })
    }
  }
  return items
}

function serializeSectionItems(items: ParsedItem[]): string {
  return items.map(item => {
    if (item.type === 'heading') return `### ${item.text}`
    if (item.type === 'subheading') return `#### ${item.text}`
    if (item.type === 'bullet') return `- ${item.text}`
    return item.text
  }).join('\n')
}

function SectionEditor({
  section,
  onSave,
  onCancel,
}: {
  section: ResumeSection
  onSave: (content: string) => void
  onCancel: () => void
}) {
  const [items, setItems] = useState<ParsedItem[]>(() => parseSectionContent(section.content))
  const [polishing, setPolishing] = useState(false)
  const { jd } = useInterviewStore()

  const updateItem = (index: number, text: string) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, text } : item))
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const addItemAfter = (index: number, type: 'bullet' | 'paragraph') => {
    setItems(prev => {
      const next = [...prev]
      next.splice(index + 1, 0, { type, text: '' })
      return next
    })
  }

  const toggleItemType = (index: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item
      if (item.type === 'heading') return { ...item, type: 'subheading' }
      if (item.type === 'subheading') return { ...item, type: 'paragraph' }
      if (item.type === 'bullet') return { ...item, type: 'paragraph' }
      return { ...item, type: 'bullet' }
    }))
  }

  const handleSave = () => {
    const filtered = items.filter(item => item.text.trim())
    onSave(serializeSectionItems(filtered))
  }

  const handlePolish = async () => {
    const currentContent = serializeSectionItems(items.filter(item => item.text.trim()))
    if (!currentContent.trim()) return

    setPolishing(true)
    try {
      const { jd } = useInterviewStore()
      const res = await fetch('/api/polish-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionTitle: section.title,
          sectionContent: currentContent,
          jd: jd || '',
          ...getLLMConfig(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '润色失败')
      }

      const data = await res.json()
      const polishedItems = parseSectionContent(data.content)
      setItems(polishedItems)
    } catch (err) {
      console.error('Polish error:', err)
    } finally {
      setPolishing(false)
    }
  }

  return (
    <div className="space-y-3 rounded-2xl bg-card/80 backdrop-blur-sm p-5 shadow-lg shadow-black/5 ring-1 ring-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Pencil className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium">编辑 · {section.title}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePolish}
            disabled={polishing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {polishing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                润色中...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                AI 润色
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-80 cursor-pointer"
          >
            <Check className="h-3 w-3" />
            保存
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
          >
            取消
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="group/item flex items-center gap-2 rounded-lg px-1 py-0.5 transition-colors hover:bg-muted/50">
            <button
              onClick={() => toggleItemType(index)}
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:text-foreground hover:bg-muted cursor-pointer"
              title={
                item.type === 'bullet' ? '点击变为段落' :
                item.type === 'heading' ? '点击变为二级标题' :
                item.type === 'subheading' ? '点击变为三级标题' :
                '点击变为列表项'
              }
            >
              {item.type === 'bullet' && <span className="h-1 w-1 rounded-full bg-current" />}
              {item.type === 'heading' && <span className="font-bold text-[9px]">H3</span>}
              {item.type === 'subheading' && <span className="font-bold text-[8px]">H4</span>}
              {item.type === 'paragraph' && <span className="text-[9px]">¶</span>}
            </button>
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(index, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addItemAfter(index, 'bullet')
                }
              }}
              className={`flex-1 bg-transparent px-1 py-1.5 text-[13px] leading-relaxed outline-none border-b border-transparent transition-colors placeholder:text-muted-foreground/40 focus:border-border ${item.type === 'heading' ? 'font-semibold' : item.type === 'subheading' ? 'font-medium' : ''}`}
              placeholder={
                item.type === 'heading' ? '三级标题...' :
                item.type === 'subheading' ? '四级标题...' :
                item.type === 'bullet' ? '列表项，按 Enter 添加新行' :
                '段落内容...'
              }
              autoFocus={index === 0}
            />
            <div className="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
              <button
                onClick={() => addItemAfter(index, 'bullet')}
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/30 transition-colors hover:text-emerald-500 cursor-pointer"
                title="在下方添加"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                onClick={() => removeItem(index)}
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/30 transition-colors hover:text-red-400 cursor-pointer"
                title="删除此行"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setItems(prev => [...prev, { type: 'bullet', text: '' }])}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/50 py-2 text-[11px] text-muted-foreground/50 transition-colors hover:border-border hover:text-muted-foreground hover:bg-muted/30 cursor-pointer"
      >
        <Plus className="h-3 w-3" />
        添加一行
      </button>
    </div>
  )
}

export function ResumePreview() {
  const { resumeData, setResumeData, resetResume, resumeVersions, restoreResumeVersion, userProfile } = useResumeStore()
  useAppStore()
  const resumeRef = useRef<HTMLDivElement>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('indigo')
  const [editingSection, setEditingSection] = useState<number | null>(null)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const themePickerRef = useRef<HTMLDivElement>(null)

  const theme = useMemo(() => resumeThemes.find(t => t.id === currentTheme) || resumeThemes[0], [currentTheme])
  const sections = useMemo(() => resumeData ? parseMarkdownSections(resumeData.content) : [], [resumeData])
  const name = useMemo(() => resumeData ? extractName(resumeData.content) : '', [resumeData])
  const contact = useMemo(() => resumeData ? extractContact(resumeData.content) : { email: '', phone: '', location: '' }, [resumeData])

  const diffMap = useMemo(() => {
    if (!previewVersionId || !resumeData) return undefined
    const version = resumeVersions.find(v => v.id === previewVersionId)
    if (!version) return undefined
    return computeDiffLines(version.content, resumeData.content)
  }, [previewVersionId, resumeData, resumeVersions])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themePickerRef.current && !themePickerRef.current.contains(e.target as Node)) {
        setShowThemePicker(false)
      }
    }
    if (showThemePicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showThemePicker])

  if (!resumeData) return null

  const matchedSkills = resumeData.skillGaps.filter(g => typeof g !== 'string' && g.status === 'matched').map(g => typeof g === 'string' ? g : g.skill)
  const partialSkills = resumeData.skillGaps.filter(g => typeof g !== 'string' && g.status === 'partial').map(g => typeof g === 'string' ? g : g.skill)

  const handleExportPDF = async () => {
    if (!resumeRef.current) return
    setIsExporting(true)
    await new Promise(r => setTimeout(r, 100))
    try {
      const html2canvas = (await import('html2canvas-pro')).default
      const jsPDF = (await import('jspdf')).default
      const canvas = await html2canvas(resumeRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = 210
      const pdfHeight = 297
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width
      const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0
      pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight)
      pdf.save(`${name || 'resume'}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = async () => {
    setIsExporting(true)
    await new Promise(r => setTimeout(r, 100))
    const printContent = resumeRef.current
    if (!printContent) { setIsExporting(false); return }
    const printWindow = window.open('', '_blank')
    if (!printWindow) { setIsExporting(false); return }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${name || '简历'}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; display: flex; justify-content: center; background: #fff; }
          img { width: 210mm; height: auto; }
        </style>
      </head>
      <body>
        <img src="" id="resume-img" />
        <script>
          window.onload = function() { window.print(); window.close(); }
        <\/script>
      </body>
      </html>
    `)
    printWindow.document.close()
    const html2canvas = (await import('html2canvas-pro')).default
    const canvas = await html2canvas(printContent, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
    const imgEl = printWindow.document.getElementById('resume-img')
    if (imgEl) (imgEl as HTMLImageElement).src = canvas.toDataURL('image/png')
    setIsExporting(false)
  }

  const handleExportMarkdown = () => {
    const blob = new Blob([resumeData.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name || 'resume'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const saveSection = (sectionIndex: number, newContent: string) => {
    const updatedSections = [...sections]
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], content: newContent }
    const newMarkdown = `# ${name}\n\n` + updatedSections.map(s => `## ${s.title}\n${s.content}`).join('\n\n')
    setResumeData({ ...resumeData, content: newMarkdown })
    setEditingSection(null)
  }

  const sectionIcons: Record<string, React.ReactNode> = {
    briefcase: <Briefcase className="h-3 w-3" />,
    education: <GraduationCap className="h-3 w-3" />,
    code: <Code2 className="h-3 w-3" />,
    skill: <Code2 className="h-3 w-3" />,
    user: <User className="h-3 w-3" />,
    default: <ChevronRight className="h-3 w-3" />,
  }

  const isEditing = editingSection !== null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">简历预览</h2>
          <p className="text-sm text-muted-foreground">AI 根据你的背景和目标 JD 生成的定制简历</p>
        </div>
        <div className="flex items-center gap-2">
          <div ref={themePickerRef} className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="gap-1.5"
            >
              <Palette className="h-3.5 w-3.5" />
              <span className="h-3 w-3 rounded-sm" style={{ background: theme.sidebar }} />
              {theme.name}
            </Button>
            <AnimatePresence>
              {showThemePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 rounded-xl border border-border/50 bg-card p-3 shadow-xl"
                  style={{ minWidth: '280px' }}
                >
                  <div className="mb-2 text-xs font-medium text-muted-foreground">选择主题</div>
                  <div className="grid grid-cols-2 gap-2">
                    {resumeThemes.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setCurrentTheme(t.id); setShowThemePicker(false) }}
                        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all cursor-pointer ${
                          currentTheme === t.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                            : 'border-border/30 hover:border-border hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex gap-0.5">
                          <span className="h-5 w-5 rounded-md" style={{ background: t.sidebar }} />
                          <span className="h-5 w-5 rounded-md" style={{ background: t.accent }} />
                          <span className="h-5 w-5 rounded-md" style={{ background: t.accentLight }} />
                        </div>
                        <span className="text-xs font-medium">{t.name}</span>
                        {currentTheme === t.id && <Check className="ml-auto h-3 w-3 text-primary" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button variant="outline" size="sm" onClick={() => { setShowAnalysis(!showAnalysis); setEditingSection(null); setShowHistory(false) }} className="gap-1.5">
            <Target className="h-3.5 w-3.5" />
            {showAnalysis ? '隐藏分析' : 'JD 分析'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setShowHistory(!showHistory); setEditingSection(null); setShowAnalysis(false) }} className="gap-1.5 relative">
            <History className="h-3.5 w-3.5" />
            历史版本
            {resumeVersions.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {resumeVersions.length}
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportMarkdown} className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Markdown
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} disabled={isExporting} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            打印
          </Button>
          <Button size="sm" onClick={handleExportPDF} disabled={isExporting} className="gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20">
            <Download className="h-3.5 w-3.5" />
            {isExporting ? '导出中...' : '导出 PDF'}
          </Button>
        </div>
      </div>

      {isEditing && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <Pencil className="h-3.5 w-3.5 text-primary" />
            <span className="text-primary">正在编辑：{sections[editingSection]?.title}</span>
            <span className="text-xs text-muted-foreground">— 修改后点击保存，简历会实时更新</span>
          </div>
        </motion.div>
      )}

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {previewVersionId && (
            <div className="mb-3 flex items-center justify-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-200" /> 新增内容</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-200" /> 删除内容</span>
              </div>
              <span className="text-xs text-muted-foreground">|</span>
              <span className="text-xs text-primary font-medium">正在对比历史版本</span>
              <button
                onClick={() => setPreviewVersionId(null)}
                className="ml-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕ 关闭对比
              </button>
            </div>
          )}
          <div className="flex justify-center pb-4 overflow-x-auto">
            <div
              ref={resumeRef}
              className="shadow-[0_2px_20px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] flex-shrink-0"
              style={{
                width: '210mm',
                minHeight: '297mm',
                background: '#ffffff',
                fontFamily: '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif',
                borderRadius: '2px',
              }}
            >
              <div className="flex" style={{ minHeight: '297mm' }}>
                  <div
                    style={{
                      width: '78mm',
                      minWidth: '78mm',
                      background: theme.sidebar,
                      padding: '36px 20px',
                      color: theme.text,
                    }}
                  >
                    <div className="mb-8 flex justify-center">
                      <div
                        className="flex items-center justify-center overflow-hidden"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          background: userProfile?.avatarUrl ? 'transparent' : theme.avatarGrad,
                          boxShadow: `0 4px 16px ${theme.accent}50`,
                        }}
                      >
                        {userProfile?.avatarUrl ? (
                          <img src={userProfile.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {name ? name.charAt(0) : 'U'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-7 text-center">
                      <h1 className="text-lg font-bold text-white tracking-wide">{name || '你的名字'}</h1>
                    </div>

                    <div className="mb-7">
                      <div className="mb-2.5 flex items-center gap-1.5">
                        <div className="h-px flex-1" style={{ background: `${theme.accent}40` }} />
                        <span className="text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>联系</span>
                        <div className="h-px flex-1" style={{ background: `${theme.accent}40` }} />
                      </div>
                      <div className="space-y-2.5 pt-1.5">
                        {contact.email && (
                          <div className="flex items-center gap-2.5 text-[13px]">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" style={{ color: `${theme.accent}90` }} />
                            <span className="break-all" style={{ color: theme.text }}>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2.5 text-[13px]">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" style={{ color: `${theme.accent}90` }} />
                            <span style={{ color: theme.text }}>{contact.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5 text-[13px]">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: `${theme.accent}90` }} />
                          <span style={{ color: theme.text }}>{contact.location || '中国'}</span>
                        </div>
                      </div>
                    </div>

                    {(matchedSkills.length > 0 || partialSkills.length > 0) && (
                      <div className="mb-7">
                        <div className="mb-2.5 flex items-center gap-1.5">
                          <div className="h-px flex-1" style={{ background: `${theme.accent}40` }} />
                          <span className="text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>技能</span>
                          <div className="h-px flex-1" style={{ background: `${theme.accent}40` }} />
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {matchedSkills.map((skill, i) => (
                            <span key={i} className="inline-block rounded-md px-2 py-1 text-[12px] font-medium" style={{ background: theme.tagBg, color: theme.tagColor }}>
                              {skill}
                            </span>
                          ))}
                          {partialSkills.map((skill, i) => (
                            <span key={`p-${i}`} className="inline-block rounded-md px-2 py-1 text-[12px]" style={{ background: theme.tagBgAlt, color: theme.tagColorAlt }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {sections.filter(s => s.icon === 'education').map((section, i) => {
                      return (
                        <div key={i} className="mb-7">
                          <div className="mb-2.5 flex items-center gap-1.5">
                            <div className="h-px flex-1" style={{ background: `${theme.accent}40` }} />
                            <span className="text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>教育</span>
                            <div className="h-px flex-1" style={{ background: `${theme.accent}40` }} />
                          </div>
                          <div className="pt-1.5 text-[13px] leading-[1.9]" style={{ color: theme.text }}>
                            {renderMarkdownText(section.content, theme, diffMap, true)}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex-1 overflow-y-auto" style={{ padding: '36px 32px', background: '#ffffff' }}>
                    {name && (
                      <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{name}</h1>
                        <div className={`mt-2 h-1 w-12 rounded-full ${theme.accentBar}`} />
                      </div>
                    )}

                    {sections
                      .filter(s => s.icon !== 'education')
                      .map((section, i) => {
                        const globalIdx = sections.indexOf(section)
                        const isThisEditing = editingSection === globalIdx
                        return (
                          <div key={i} className="mb-7 group">
                            <div className="mb-3 flex items-center gap-2.5">
                              <div className={`flex h-6 w-6 items-center justify-center rounded-md ${theme.sectionIcon}`}>
                                {sectionIcons[section.icon] || sectionIcons.default}
                              </div>
                              <h2 className={`text-[15px] font-bold uppercase tracking-wider ${theme.sectionTitle}`}>
                                {section.title}
                              </h2>
                              <div className="h-px flex-1 bg-gray-100" />
                              {!isThisEditing && !isExporting && (
                                <button
                                  onClick={() => setEditingSection(globalIdx)}
                                  className="flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary/70 transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 cursor-pointer"
                                >
                                  <Pencil className="h-3 w-3" />
                                  编辑
                                </button>
                              )}
                            </div>
                            <div className="pl-8">
                              {isThisEditing ? (
                                <SectionEditor
                                  section={section}
                                  onSave={(content) => saveSection(globalIdx, content)}
                                  onCancel={() => setEditingSection(null)}
                                />
                              ) : (
                                renderMarkdownText(section.content, theme, diffMap)
                              )}
                            </div>
                          </div>
                        )
                      })}

                    {sections.length === 0 && (
                      <div className="prose prose-sm max-w-none text-gray-600">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{resumeData.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
          </div>
        </div>

        <AnimatePresence>
          {showAnalysis && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-72 flex-shrink-0 space-y-3"
            >
              <div className="rounded-xl border border-border/30 bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">JD 匹配度</span>
                </div>
                <div className="mb-1.5 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">{resumeData.matchScore}</span>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <Progress value={resumeData.matchScore} className="h-1.5" />
              </div>

              <div className="rounded-xl border border-border/30 bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-chart-4" />
                  <span className="text-sm font-medium">技能匹配</span>
                </div>
                <div className="space-y-1.5">
                  {resumeData.skillGaps.map((gap, i) => {
                    const normalizedGap = typeof gap === 'string' ? { skill: gap, status: 'missing' as const, suggestion: '' } : gap
                    const config = statusConfig[normalizedGap.status] || statusConfig.missing
                    return (
                      <div key={normalizedGap.skill || i} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                        <span className="flex-1 text-xs">{normalizedGap.skill}</span>
                        <Badge variant="outline" className={`text-[8px] px-1 py-0 ${config.bg}`}>{config.label}</Badge>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-border/30 bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium">改进建议</span>
                </div>
                <div className="space-y-2">
                  {resumeData.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-medium">{i + 1}</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" onClick={resetResume} className="w-full gap-2">
                <RotateCcw className="h-4 w-4" />
                重新编辑
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-80 flex-shrink-0"
            >
              <div className="rounded-xl border border-border/30 bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">历史版本</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{resumeVersions.length} 个版本</Badge>
                </div>
                {resumeVersions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <History className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    <p>暂无历史版本</p>
                    <p className="mt-1">每次编辑保存后会自动生成新版本</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {resumeVersions.slice().reverse().map((version) => {
                      const isPreviewing = previewVersionId === version.id
                      return (
                        <div key={version.id} className={`rounded-lg border p-3 transition-colors ${isPreviewing ? 'border-primary/50 bg-primary/5' : 'border-border/30 hover:border-primary/30 hover:bg-primary/5'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{version.label}</p>
                              <p className="mt-1 text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                                {version.content.substring(0, 80)}...
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-1.5">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setPreviewVersionId(isPreviewing ? null : version.id)}
                              className="gap-1 h-5 text-[10px] px-1.5"
                            >
                              <Eye className="h-2.5 w-2.5" />
                              {isPreviewing ? '收起' : '查看变更'}
                            </Button>
                            <Button
                              size="xs"
                              onClick={() => {
                                restoreResumeVersion(version.id)
                                setPreviewVersionId(null)
                                setShowHistory(false)
                              }}
                              className="gap-1 h-5 text-[10px] px-1.5 bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              <Undo2 className="h-2.5 w-2.5" />
                              恢复
                            </Button>
                            <span className="text-[9px] text-muted-foreground">
                              {new Date(version.createdAt).toLocaleString('zh-CN', {
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {isPreviewing && (
                            <div className="mt-3 rounded-lg border border-border/30 bg-background/50 p-3">
                              <p className="text-[11px] text-muted-foreground">变更已标注在简历页面上，<span className="text-emerald-500">绿色</span>为新增，<span className="text-red-500">红色</span>为删除</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!showAnalysis && !isEditing && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={resetResume} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            重新编辑
          </Button>
        </div>
      )}
    </motion.div>
  )
}
