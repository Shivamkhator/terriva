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
        const expired = Date.now() - state.unlockedAt > TIMEOUT
    useEffect(() => {
        

        if (state.isUnlocked && !expired) {
            setUnlocked(true)
        } else {
        }
    }, [])

    async function requirePasskey() {
    try {
        // Step 1: Check if user has passkey
        const res = await fetch("/api/passkey/status")
        const { hasPasskey } = await res.json()

        if (!hasPasskey) {
            // User needs to register. 
            // We do nothing here because UnlockScreen will show the "Create Passkey" button.
            return 
        }

        // Step 2: Normal unlock (Only if they ALREADY have a passkey)
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
        // If it fails, we just stay on the UnlockScreen
    }
}


    if (!unlocked) return <UnlockScreen />

    return <>{children}</>
}
