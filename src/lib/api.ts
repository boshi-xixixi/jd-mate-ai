import { useSettingsStore } from '@/lib/store'

export function getLLMConfig() {
  const { llmConfig } = useSettingsStore.getState()
  if (!llmConfig.apiKey) return {}
  return {
    llmConfig: {
      apiKey: llmConfig.apiKey,
      baseURL: llmConfig.baseURL,
      model: llmConfig.model,
    },
  }
}
