export interface LockState {
  isUnlocked: boolean
  unlockedAt: number
  userId?: string // Track which user unlocked
}

const LOCK_DURATION = 5 * 60 * 1000 // 5 minutes
const STORAGE_KEY = 'passkey_lock_state'

export function getLockState(): LockState | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const state: LockState = JSON.parse(stored)
    
    // Check if lock has expired
    if (Date.now() - state.unlockedAt > LOCK_DURATION) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    
    return state
  } catch {
    return null
  }
}

export function setLockState(state: LockState) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to set lock state:', error)
  }
}

export function clearLockState() {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear lock state:', error)
  }
}

export function isUnlocked(userId: string): boolean {
  const state = getLockState()
  
  if (!state || !state.isUnlocked) return false
  
  // Check if the unlock is for the current user
  if (state.userId && state.userId !== userId) {
    clearLockState()
    return false
  }
  
  return true
}