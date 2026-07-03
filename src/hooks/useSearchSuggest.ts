import { useState, useCallback } from 'react'

const STORAGE_KEY = 'search_history'

function getHistory(): Record<string, string[]> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

function isAutoFillEnabled() {
  return localStorage.getItem('autoFillOff') !== 'true'
}

export function useSearchSuggest(field: string) {
  const [suggestions, setSuggestions] = useState<string[]>([])

  const saveValue = useCallback((value: string) => {
    if (!value.trim()) return
    const h = getHistory()
    const arr = h[field] || []
    const next = [value, ...arr.filter((v) => v !== value)].slice(0, 10)
    h[field] = next
    localStorage.setItem(STORAGE_KEY, JSON.stringify(h))
  }, [field])

  const loadSuggestions = useCallback(() => {
    if (!isAutoFillEnabled()) { setSuggestions([]); return }
    setSuggestions(getHistory()[field] || [])
  }, [field])

  const listId = `suggest-${field}`
  const items = isAutoFillEnabled() ? suggestions : []

  return { saveValue, loadSuggestions, listId, items }
}
