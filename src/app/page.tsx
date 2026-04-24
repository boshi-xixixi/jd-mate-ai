'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Header } from '@/components/header'
import { JDHome } from '@/components/jd-home'
import { JDWorkspace } from '@/components/jd-workspace'
import { LandingPage } from '@/components/landing-page'
import { useTheme } from '@/hooks/use-theme'
import { AnimatePresence, motion } from 'framer-motion'

export default function Home() {
  const { activeJDId, hasEntered, setHasEntered, selectJDRecord } = useStore()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe pattern
    setMounted(true)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    )
  }

  const handleEnterFromLanding = () => {
    setHasEntered(true)
  }

  const handleBackToLanding = () => {
    setHasEntered(false)
    selectJDRecord(null)
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none fixed inset-0 overflow-hidden will-change-transform">
        <div className={`absolute -left-40 -top-40 h-80 w-80 rounded-full blur-3xl ${resolvedTheme === 'dark' ? 'bg-primary/5' : 'bg-primary/10'}`} />
        <div className={`absolute -right-40 top-1/3 h-80 w-80 rounded-full blur-3xl ${resolvedTheme === 'dark' ? 'bg-chart-2/5' : 'bg-chart-2/10'}`} />
        <div className={`absolute -bottom-40 left-1/3 h-80 w-80 rounded-full blur-3xl ${resolvedTheme === 'dark' ? 'bg-chart-3/5' : 'bg-chart-3/10'}`} />
      </div>

      <Header onBackToLanding={handleBackToLanding} showBackButton={hasEntered && !activeJDId} />

      <main className="relative mx-auto w-full flex-1">
        <AnimatePresence mode="wait">
          {!hasEntered && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LandingPage onEnter={handleEnterFromLanding} />
            </motion.div>
          )}

          {hasEntered && !activeJDId && (
            <motion.div key="jd-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="px-6 pb-8">
                <JDHome />
              </div>
            </motion.div>
          )}

          {hasEntered && activeJDId && (
            <motion.div key="workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mx-auto max-w-6xl px-6 pb-8">
                <JDWorkspace />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!hasEntered && (
        <footer className="border-t border-border/30 py-6 text-center">
          <p className="text-xs text-muted-foreground/50">
            JD Mate AI · Powered by AI · 开源求职一站式助手
          </p>
        </footer>
      )}
    </div>
  )
}
