'use client'

import { Coins } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TokenEstimateProps {
  input: number
  output: number
  label?: string
  model?: string
}

const modelPricing: Record<string, { input: number; output: number; currency: string }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.60, currency: '$' },
  'gpt-4o': { input: 2.50, output: 10.00, currency: '$' },
  'gpt-4.1-mini': { input: 0.40, output: 1.60, currency: '$' },
  'gpt-4.1': { input: 2.00, output: 8.00, currency: '$' },
  'deepseek-chat': { input: 0.14, output: 0.28, currency: '¥' },
  'deepseek-reasoner': { input: 0.55, output: 2.19, currency: '¥' },
  'qwen-plus': { input: 0.80, output: 2.00, currency: '¥' },
  'qwen-turbo': { input: 0.30, output: 0.60, currency: '¥' },
  'glm-4-flash': { input: 0.10, output: 0.10, currency: '¥' },
  'glm-4-plus': { input: 0.50, output: 0.50, currency: '¥' },
  'doubao': { input: 0.50, output: 1.00, currency: '¥' },
  'doubao-seed': { input: 0.30, output: 0.60, currency: '¥' },
}

function getModelPricing(model: string) {
  for (const [key, pricing] of Object.entries(modelPricing)) {
    if (model.includes(key) || key.includes(model)) return pricing
  }
  return null
}

export function TokenEstimate({ input, output, label, model = 'doubao-seed-2-0-lite-260215' }: TokenEstimateProps) {
  const total = input + output
  const pricing = getModelPricing(model)

  const cost = pricing
    ? ((input / 1000000) * pricing.input + (output / 1000000) * pricing.output).toFixed(4)
    : null

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger render={(props) => (
          <div {...props} className="inline-flex items-center gap-1.5 rounded-md bg-secondary/40 px-2 py-0.5 text-[11px] text-muted-foreground cursor-help">
            <Coins className="h-3 w-3" />
            <span>~{total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total} tokens</span>
            {cost && pricing && (
              <span className="text-primary/60">
                ≈{pricing.currency}{parseFloat(cost) < 0.01 ? '<0.01' : cost}
              </span>
            )}
          </div>
        )} />
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            {label && <p className="font-medium">{label}</p>}
            <p>输入: ~{input} tokens</p>
            <p>输出: ~{output} tokens</p>
            {cost && pricing && (
              <p className="border-t border-border/30 pt-1">
                预估费用: {pricing.currency}{cost}
                <span className="text-muted-foreground"> (按 {model} 计)</span>
              </p>
            )}
            {!cost && (
              <p className="text-muted-foreground">费用取决于模型定价</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
