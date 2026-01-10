"use client"

import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getLockState, setLockState } from "@/lib/passkeyLock"
import { UnlockScreen } from "@/components/UnlockScreen"
import { startAuthentication } from "@simplewebauthn/browser"

type PasskeyGuardProps = {
    children: ReactNode
}

const TIMEOUT = 5 * 60 * 1000 // 5 minutes

export function PasskeyGuard({ children }: PasskeyGuardProps) {
    const [unlocked, setUnlocked] = useState(false)

    const router = useRouter()
    const state = getLockState()
    const expired = state && Date.now() - state.unlockedAt > TIMEOUT
    useEffect(() => {
        if (state && state.isUnlocked && !expired) {
            setUnlocked(true)
        } else {
        }
    }, [])

    async function requirePasskey() {
        try {
            const res = await fetch("/api/passkey/check")
            const { hasPasskey } = await res.json()

            if (!hasPasskey) {
                return
            }

            const optionsRes = await fetch("/api/passkey/auth/options", { method: "POST" })
            const options = await optionsRes.json()

            const assertion = await startAuthentication({ optionsJSON: options })

            const verifyRes = await fetch("/api/passkey/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(assertion)
            })

            if (verifyRes.ok) {
                setLockState({ isUnlocked: true, unlockedAt: Date.now() })
                setUnlocked(true)
            }
        } catch (err) {
            console.error("Auto-unlock failed", err)
        }
    }


    if (!unlocked) return <UnlockScreen />

    return <>{children}</>
}
