'use client'

import { useState } from 'react'
import { Sparkles, RotateCcw, FileText, PenLine, MessageCircle, LayoutDashboard, Settings2, Sun, Moon, Monitor, Home, Search } from 'lucide-react'
import { useStore, useInterviewStore, useAppStore, useSettingsStore } from '@/lib/store'
import { SettingsDialog } from '@/components/settings-dialog'
import { useTheme } from '@/hooks/use-theme'
import { motion } from 'framer-motion'
import type { AppModule } from '@/lib/types'

const navItems: { key: 'home' | AppModule; label: string; icon: React.ElementType; requiresJD?: boolean }[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'jd-analysis', label: 'JD详解', icon: Search, requiresJD: true },
  { key: 'interview', label: '面试出题', icon: FileText, requiresJD: true },
  { key: 'resume', label: '简历工坊', icon: PenLine, requiresJD: true },
  { key: 'mock-interview', label: '模拟面试', icon: MessageCircle, requiresJD: true },
  { key: 'dashboard', label: '仪表盘', icon: LayoutDashboard, requiresJD: true },
]

export function Header({ onBackToLanding, showBackButton }: { onBackToLanding?: () => void; showBackButton?: boolean } = {}) {
  const { activeJDId, selectJDRecord } = useStore()
  const { currentStep, reset } = useInterviewStore()
  const { activeModule, setActiveModule } = useAppStore()
  const { llmConfig } = useSettingsStore()
  const { theme, setTheme } = useTheme()
  const [showSettings, setShowSettings] = useState(false)

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light')
    else if (theme === 'light') setTheme('system')
    else setTheme('dark')
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  const handleNavClick = (item: typeof navItems[number]) => {
    if (item.key === 'home') {
      selectJDRecord(null)
      return
    }
    
    if (item.requiresJD && !activeJDId) {
      return
    }
    
    setActiveModule(item.key as AppModule)
  }

  const getActiveNavKey = () => {
    if (!activeJDId) return 'home'
    return activeModule
  }

  const activeNavKey = getActiveNavKey()

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-chart-2 to-chart-3 shadow-lg shadow-primary/20">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight">JD Mate AI</span>
          </div>

          {showBackButton && (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              <Home className="h-3.5 w-3.5" />
              <span>返回宣传页</span>
            </button>
          )}

          <nav className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = activeNavKey === item.key
              const isDisabled = item.requiresJD && !activeJDId
              const Icon = item.icon

              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item)}
                  disabled={isDisabled}
                  className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    isDisabled
                      ? 'cursor-not-allowed text-muted-foreground/20'
                      : isActive
                        ? 'text-foreground cursor-pointer'
                        : 'text-muted-foreground hover:text-foreground cursor-pointer'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-primary/10"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            {activeModule === 'interview' && currentStep !== 'idle' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={reset}
                className="flex items-center gap-1.5 rounded-lg border border-border/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">重新开始</span>
              </motion.button>
            )}

            <button
              onClick={cycleTheme}
              aria-label={`切换主题 (当前: ${theme === 'dark' ? '暗色' : theme === 'light' ? '亮色' : '跟随系统'})`}
              className="flex items-center justify-center rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              <ThemeIcon className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              aria-label="模型设置"
              className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                llmConfig.apiKey
                  ? 'text-primary hover:bg-primary/10'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {llmConfig.apiKey ? '已配置' : '设置模型'}
              </span>
              {!llmConfig.apiKey && (
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
