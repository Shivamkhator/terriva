"use client"

import React, { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"
import { ArrowRight, ArrowDown, Activity, Calendar, PieChart, Shield } from "lucide-react"
import { useSession } from "next-auth/react";
import { PreviewCard, PreviewCardPanel, PreviewCardTrigger } from "@/components/animate-ui/components/base/preview-card";

const features = [

    {
        id: 1,
        title: "Secure & Encrypted",
        subtitle: "Security First",
        description: "Well protected with end-to-end encryption to track & share securely.",
        color: "bg-[#6C63FF]", // Indigo
        icon: Shield,
    },
    {
        id: 2,
        title: "Daily Log",
        subtitle: "Dashboard",
        description: "Your central hub to log your flow & mood instantly.",
        color: "bg-teal-500", // Teal
        icon: Calendar,
    },
    {
        id: 3,
        title: "Cycle Analysis",
        subtitle: "Analysis",
        description: "Visualize your history & get predictions about your next phase.",
        color: "bg-[#FF6F79]", // Coral
        icon: Activity,
    },
]

export default function PeriodTrackerHome() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    })

    const rotate = useTransform(scrollYProgress, [0, 1], [0, 120])

    return (
        <div ref={containerRef} className="relative bg-background text-foreground font-sans selection:bg-primary selection:text-white">
            <HeroSection />
            <ScrollCarouselSection />
            <FooterSection />
        </div>
    )
}

function HeroSection() {
    // --- Movement state ---
    const mode = "scroll";

    const [x, setX] = React.useState(0);
    const [y, setY] = React.useState(0);



    // --- Scroll parallax ---
    const { scrollY } = useScroll();
    let scrollYProgress = useTransform(scrollY, [0, 1000], [0, 960]);
    React.useEffect(() => {
        const unsub = (scrollYProgress as any).onChange((val: number) => {
            setY(val);
        });
        return () => unsub && unsub();
    }, [mode, scrollYProgress]);

    return (
        <section className="relative z-10 h-screen w-full flex flex-col justify-between pl-6 md:p-12 border-b border-primary/10">
            <nav className="flex justify-between items-start uppercase tracking-widest text-sm md:text-md font-bold text-gray-primary/80">
                <div>Terriva by SkyBee</div>

            </nav>

            <div className="mt-auto mb-[10vh] md:mb-[4vh] mr-2 md:mr-6">
                <h1 className="text-[20vw] md:text-[14vw] leading-[0.85] font-bold text-primary tracking-tighter uppercase mix-blend-darken">
                    Clarity <span className="block italic font-serif font-light text-accent-foreground ml-[9vw]">Every</span> Month
                </h1>
                <div className="flex flex-col md:flex-row justify-between items-end mt-16 border-t border-primary/30 pt-16 md:pt-2">
                    <p className="max-w-md text-xl text-gray-primary leading-relaxed">
                        Your Insights, Only Yours. <br />
                        <span className="opacity-70 text-sm">Scroll to sync.</span>
                    </p>
                    <div className="animate-bounce mt-4 md:mt-0 mr-2">
                        <ArrowDown className="w-7 h-7 text-primary" />
                    </div>
                </div>
            </div>

            <motion.div
                style={{ x, y }}
                className=" absolute -z-1 top-4 md:top-12 md:right-12 pointer-events-none"
            >
                <Image
                    src="/terriva.png"
                    alt="Terriva Logo"
                    width={512}
                    height={512}
                    priority={false}
                    draggable={false}
                />
            </motion.div>
        </section>
    );
}


function ScrollCarouselSection() {
    const targetRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"],
    })

    const totalSlides = features.length

    return (
        <section ref={targetRef} className="relative h-[400vh] z-20">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">

                <SidebarUI scrollYProgress={scrollYProgress} totalSlides={totalSlides} />

                {/* --- CENTER SPLIT LAYOUT --- */}
                <div className="relative w-full h-full flex items-center justify-center">
                    {features.map((feature, index) => (
                        <CarouselSlide
                            key={feature.id}
                            feature={feature}
                            index={index}
                            totalSlides={totalSlides}
                            scrollYProgress={scrollYProgress}
                        />
                    ))}
                </div>

            </div>
        </section>
    )
}

function SidebarUI({ scrollYProgress, totalSlides }: { scrollYProgress: MotionValue<number>, totalSlides: number }) {
    const activeIndex = useTransform(scrollYProgress, (value) => {
        const step = 1 / totalSlides
        return Math.min(Math.floor(value / step), totalSlides - 1)
    })

    return (
        <div className="absolute inset-0 pointer-events-none px-6 md:px-12 flex justify-between items-center z-30">
            <div className="h-full flex flex-col justify-center">
                <div className="overflow-hidden h-16rem flex items-end">
                    <FeatureCounter activeIndex={activeIndex} />
                </div>
            </div>
        </div>
    )
}

function FeatureCounter({ activeIndex }: { activeIndex: MotionValue<number> }) {
    const [current, setCurrent] = React.useState(0)
    React.useEffect(() => activeIndex.on("change", (v) => setCurrent(v)), [activeIndex])

    return (
        <div className="flex items-baseline mix-blend-multiply opacity-20 md:opacity-100">
            <span className="text-[12rem] leading-none font-bold text-primary tabular-nums tracking-tighter">
                0{current + 1}
            </span>
        </div>
    )
}

function CarouselSlide({ feature, index, totalSlides, scrollYProgress }: any) {
    const step = 1 / totalSlides
    const start = index * step
    const end = start + step

    // Controls opacity: Fade in, stay, fade out
    const opacity = useTransform(
        scrollYProgress,
        [start - 0.05, start + 0.05, end - 0.05, end],
        [0, 1, 1, 0]
    )

    // Controls movement: The text slides up slightly while visible
    const y = useTransform(scrollYProgress, [start, end], ["150px", "100px"])

    const Icon = feature.icon

    return (
        <motion.div
            style={{ opacity }}
            className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
        >
            <div className="w-full h-full flex flex-col md:flex-row items-center">

                {/* LEFT */}
                <div className={`w-full md:w-1/2 h-full ${feature.color} flex items-center justify-center relative overflow-hidden`}>
                    <Icon className="absolute w-[80%] h-[80%] text-white opacity-20 -rotate-15 stroke-[0.5px]" />

                    <motion.div style={{ y }} className="relative z-10 text-white">
                        <h3 className="text-[3rem] lg:text-[6rem] font-bold leading-none tracking-tighter opacity-90 mix-blend-overlay">
                            {feature.subtitle}
                        </h3>
                    </motion.div>
                </div>

                {/* RIGHT */}
                <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-12 md:px-24 pointer-events-auto bg-background/50 backdrop-blur-sm">
                    <span className="text-sm font-bold uppercase tracking-widest text-accent-foreground mb-4">
                        {feature.subtitle}
                    </span>
                    <h2 className="text-4xl lg:text-6xl font-bold text-primary mb-8 uppercase leading-[0.9]">
                        {feature.title}
                    </h2>
                    <p className="text-lg lg:text-xl text-gray-primary mb-12 max-w-md leading-relaxed">
                        {feature.description}
                    </p>
                </div>

            </div>
        </motion.div>
    )
}

function FooterSection() {
    const { data: session } = useSession();
    return (
        <section className="h-[60vh] bg-primary flex flex-col items-center justify-center text-center p-12">
            <PreviewCard>
                <PreviewCardTrigger
                    render={
                        <Link className="text-white leading-none uppercase mb-8 text-[8vw] font-bold text-shadow-lg" href="https://skybee.vercel.app">Terriva
                        </Link>
                    }
                />

                <PreviewCardPanel
                    className="w-[70vw] md:w-[40vw]  bg-background rounded-lg shadow-lg"
                >
                    <div className="flex gap-2">
                        <Image
                            className="w-12 h-12 rounded-full overflow-hidden border"
                            width={48}
                            height={48}
                            src="https://skybee.vercel.app/SkyBee.svg"
                            alt="SkyBee"
                        />
                        <div className="flex flex-col gap-2">
                            <div>
                                <div className="font-bold">Terriva</div>
                                <div className="text-xs text-muted-foreground">SkyBee's Creation</div>
                            </div>
                            <div className="text-sm text-gray-700">
                                Building useful tools for a better digital life.
                            </div>
                            <div className="flex">
                                <Link href="mailto:skybee.hq@gmail.com" className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:scale-105 transition-transform">
                                    Mail Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </PreviewCardPanel>
            </PreviewCard>
            <div className="flex gap-4">
                <Link href="/dashboard" className="px-6 py-4 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors hover:scale-105">
                    {session ? "Dashboard" : "Login"}
                </Link>
                <Link href="https://instagram.com/weareskybee" className="heart-btn">
                    <span aria-hidden="true"></span>
                    <span>Follow Us</span>
                </Link>
                <div className="text-white">

                </div>

            </div>
        </section>
    )
}