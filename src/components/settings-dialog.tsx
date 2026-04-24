'use client'

import { useState, useEffect } from 'react'
import { useSettingsStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Settings2,
  Key,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  Download,
  Upload,
} from 'lucide-react'

const providerPresets = [
  { label: 'OpenAI', baseURL: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini', docs: 'https://platform.openai.com/docs/models', keyDocs: 'https://platform.openai.com/api-keys' },
  { label: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat', docs: 'https://platform.deepseek.com/api-docs/models', keyDocs: 'https://platform.deepseek.com/api_keys' },
  { label: '火山引擎', baseURL: 'https://ark.cn-beijing.volces.com/api/v3', defaultModel: 'doubao-seed-2-0-lite-260215', docs: 'https://www.volcengine.com/docs/82379/1263482', keyDocs: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey' },
  { label: '阿里通义', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', defaultModel: 'qwen-plus', docs: 'https://help.aliyun.com/zh/model-studio/getting-started/models', keyDocs: 'https://bailian.console.aliyun.com/' },
  { label: '智谱 GLM', baseURL: 'https://open.bigmodel.cn/api/paas/v4', defaultModel: 'glm-4-flash', docs: 'https://open.bigmodel.cn/dev/howuse/model', keyDocs: 'https://open.bigmodel.cn/usercenter/apikeys' },
  { label: '自定义', baseURL: '', defaultModel: '', docs: '', keyDocs: '' },
]

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { llmConfig, setLLMConfig, resetLLMConfig } = useSettingsStore()
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedProvider, setSelectedProvider] = useState(() => {
    const match = providerPresets.find((p) => p.baseURL === llmConfig.baseURL)
    return match?.label || '自定义'
  })

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, parseInt(document.body.style.top || '0') * -1)
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [open])

  const handleProviderChange = (label: string) => {
    setSelectedProvider(label)
    const provider = providerPresets.find((p) => p.label === label)
    if (provider) {
      setLLMConfig({ baseURL: provider.baseURL })
      if (provider.defaultModel && !llmConfig.apiKey) {
        setLLMConfig({ model: provider.defaultModel })
      }
    }
  }

  const handleTestConnection = async () => {
    if (!llmConfig.apiKey) return
    setTesting(true)
    setTestResult(null)
    setErrorMessage('')

    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          llmConfig: {
            apiKey: llmConfig.apiKey,
            baseURL: llmConfig.baseURL,
            model: llmConfig.model || 'doubao-seed-2-0-lite-260215',
          },
        }),
      })

      if (res.ok) {
        setTestResult('success')
      } else {
        let msg = '连接失败'
        try {
          const text = await res.text()
          try {
            const data = JSON.parse(text)
            msg = data.error || msg
          } catch {
            msg = text.slice(0, 200) || `HTTP ${res.status}`
          }
        } catch {
          msg = `HTTP ${res.status}: ${res.statusText || '服务端错误'}`
        }
        setTestResult('error')
        setErrorMessage(msg)
      }
    } catch {
      setTestResult('error')
      setErrorMessage('网络请求失败')
    } finally {
      setTesting(false)
    }
  }

  const handleExportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      interview: JSON.parse(localStorage.getItem('jd-interview-session') || '{}'),
      resume: JSON.parse(localStorage.getItem('jd-resume-session') || '{}'),
      app: JSON.parse(localStorage.getItem('jd-app-store') || '{}'),
      settings: JSON.parse(localStorage.getItem('jd-settings') || '{}'),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jd-mate-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.version !== 1) {
          alert('不支持的数据格式')
          return
        }
        if (data.interview && Object.keys(data.interview).length) {
          localStorage.setItem('jd-interview-session', JSON.stringify(data.interview))
        }
        if (data.resume && Object.keys(data.resume).length) {
          localStorage.setItem('jd-resume-session', JSON.stringify(data.resume))
        }
        if (data.app && Object.keys(data.app).length) {
          localStorage.setItem('jd-app-store', JSON.stringify(data.app))
        }
        if (data.settings && Object.keys(data.settings).length) {
          localStorage.setItem('jd-settings', JSON.stringify(data.settings))
        }
        window.location.reload()
      } catch {
        alert('导入失败，请检查文件格式')
      }
    }
    input.click()
  }

  const currentProvider = providerPresets.find((p) => p.label === selectedProvider)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card relative w-full max-w-md rounded-2xl p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                  <Settings2 className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-base font-bold">模型设置</h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">服务商</label>
                <div className="flex flex-wrap gap-1.5">
                  {providerPresets.map((provider) => (
                    <button
                      key={provider.label}
                      onClick={() => handleProviderChange(provider.label)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                        selectedProvider === provider.label
                          ? 'bg-primary/15 text-primary ring-1 ring-primary/25'
                          : 'bg-secondary/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {provider.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Key className="h-3 w-3" />
                    API Key
                  </label>
                  {currentProvider?.keyDocs && (
                    <a
                      href={currentProvider.keyDocs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-primary/60 transition-colors hover:text-primary"
                    >
                      获取 Key
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={llmConfig.apiKey}
                    onChange={(e) => setLLMConfig({ apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 pr-9 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showKey ? '隐藏密钥' : '显示密钥'}
                  >
                    {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Base URL</label>
                  <span className="text-[11px] text-muted-foreground/50">选填，默认由服务商提供</span>
                </div>
                <input
                  type="text"
                  value={llmConfig.baseURL}
                  onChange={(e) => setLLMConfig({ baseURL: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">模型名称</label>
                  {currentProvider?.docs && (
                    <a
                      href={currentProvider.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-primary/60 transition-colors hover:text-primary"
                    >
                      查看可用模型
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={llmConfig.model}
                  onChange={(e) => setLLMConfig({ model: e.target.value })}
                  placeholder={currentProvider?.defaultModel || 'doubao-seed-2-0-lite-260215'}
                  className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>

              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 rounded-lg p-2.5 text-xs ${
                    testResult === 'success'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {testResult === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {testResult === 'success' ? '连接成功！模型可用' : errorMessage || '连接失败，请检查配置'}
                </motion.div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border/30 pt-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  导出
                </button>
                <span className="text-muted-foreground/30">|</span>
                <button
                  onClick={handleImportData}
                  className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                  <Upload className="h-3 w-3" />
                  导入
                </button>
                <span className="text-muted-foreground/30">|</span>
                <button
                  onClick={() => {
                    resetLLMConfig()
                    setSelectedProvider('OpenAI')
                    setTestResult(null)
                  }}
                  className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  重置
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={!llmConfig.apiKey || testing}
                  className="h-8 gap-1.5 text-xs"
                >
                  {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                  测试
                </Button>
                <Button size="sm" onClick={onClose} className="h-8 gap-1.5 text-xs">
                  保存
                </Button>
              </div>
            </div>

            {!llmConfig.apiKey && (
              <p className="mt-3 text-[11px] text-muted-foreground/60 leading-relaxed">
                未配置时使用服务端默认密钥。如需用自己的模型，请填写 API Key 并选择服务商。
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
