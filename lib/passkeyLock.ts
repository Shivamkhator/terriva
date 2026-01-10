const LOCK_KEY = "passkey_lock"

export type LockState = {
  isUnlocked: boolean
  unlockedAt: number
}

export function getLockState(): LockState {
  if (typeof window === "undefined") {
    return { isUnlocked: false, unlockedAt: 0 }
  }

  try {
    const raw = localStorage.getItem(LOCK_KEY)
    if (!raw) return { isUnlocked: false, unlockedAt: 0 }
    return JSON.parse(raw)
  } catch {
    return { isUnlocked: false, unlockedAt: 0 }
  }
}

export function setLockState(state: LockState) {
  if (typeof window === "undefined") return
  localStorage.setItem(LOCK_KEY, JSON.stringify(state))
}

export function clearLockState() {
  if (typeof window === "undefined") return
  localStorage.removeItem(LOCK_KEY)
}
