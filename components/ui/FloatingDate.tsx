"use client"

import React from "react"
import { motion } from "framer-motion"

export default function FloatingDate() {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const now = new Date()
    const day = now.getDate().toString().padStart(2, '0')
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const year = now.getFullYear()

    const dateString = `${year}.${month}.${day}`

    return (
        
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="fixed top-8 md:top-16 right-8 md:right-12\6 z-50 pointer-events-none select-none"
        >
            <span className="text-xs md:text-sm  font-light tracking-[0.3em] text-black italic" >
                {dateString}
            </span>
        </motion.div>
    )
}