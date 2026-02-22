"use client"

import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getLockState, setLockState } from "@/lib/passkeyLock"
import { UnlockScreen } from "@/components/UnlockScreen"

type PasskeyGuardProps = {
    children: ReactNode
}

const TIMEOUT = 5 * 60 * 1000 // 5 minutes

export function PasskeyGuard({ children }: PasskeyGuardProps) {
    const [unlocked, setUnlocked] = useState(false)
    const [isChecking, setIsChecking] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkLockState()
    }, [])

    function checkLockState() {
        const state = getLockState()
        const isExpired = state && Date.now() - state.unlockedAt > TIMEOUT

        if (state?.isUnlocked && !isExpired) {
            setUnlocked(true)
            setIsChecking(false)
        } else {
            // Clear expired lock
            if (isExpired) {
                setLockState({ isUnlocked: false, unlockedAt: 0 })
            }
            // Redirect to unlock screen instead of auto-prompting
            setIsChecking(false)
        }
    }

    if (isChecking) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <video src="/Loader.webm" className="mx-auto w-24 h-24" autoPlay loop muted />
                </div>
            </div>
        )
    }

    if (!unlocked) return <UnlockScreen />

    return <>{children}</>
}