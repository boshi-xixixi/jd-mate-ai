import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 120000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const mergedOptions: RequestInit = {
    ...options,
    signal: options.signal
      ? AbortSignal.any([options.signal, controller.signal])
      : controller.signal,
  }

  return fetch(url, mergedOptions).finally(() => clearTimeout(timeoutId))
}
