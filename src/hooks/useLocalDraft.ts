import { useState, useEffect, useCallback } from 'react'

/**
 * Persists form state to localStorage so it survives navigation.
 * Call clearDraft() after a successful save to wipe the stored values.
 *
 * @param key     - Unique storage key, e.g. 'draft:expense:new' or `draft:profile:${id}`
 * @param initial - Initial form values (used when no draft exists yet)
 */
export function useLocalDraft<T extends Record<string, unknown>>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored) as T
        // Only restore if the stored draft has the same keys as initial
        const initKeys = Object.keys(initial)
        const hasMatchingKeys = initKeys.some(k => k in parsed)
        if (hasMatchingKeys) return { ...initial, ...parsed }
      }
    } catch {
      // ignore parse errors
    }
    return initial
  })

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // ignore quota errors
    }
  }, [key, state])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  }, [key])

  // Reset the form to initial values and clear the draft
  const resetDraft = useCallback((newInitial?: T) => {
    const next = newInitial ?? initial
    setState(next)
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return { state, setState, clearDraft, resetDraft }
}
