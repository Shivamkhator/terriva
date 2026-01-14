"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { ChevronRightIcon, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { Session } from "next-auth"

type ClarityClientProps = {
    user: Session["user"];
};

export default function ClarityPage({ user }: ClarityClientProps) {
    const [question, setQuestion] = useState("")
    const [answer, setAnswer] = useState("")
    const [loading, setLoading] = useState(false)
    const [insights, setInsights] = useState<any>(null);
    const [loadingInsights, setLoadingInsights] = useState(true);

    const router = useRouter()

    useEffect(() => {
        let isMounted = true;
        const loadInsights = async () => {
            try {
                const res = await fetch("/api/insights");
                if (!res.ok) {
                    if (isMounted)
                        setInsights(null);
                } else {
                    const data = await res.json();
                    if (isMounted) {
                        setInsights(data);
                    }
                }
            } catch (err) {
                console.error("Failed to load insights", err);
                setInsights(null);
            } finally {
                setLoadingInsights(false);
            }
        };

        loadInsights();
        return () => { isMounted = false; };
    }, []);

    const handleAsk = async () => {
        if (!question.trim()) return

        setLoading(true)
        setAnswer("")
        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            })

            const data = await res.json()
            setAnswer(data.answer)
        } catch {
            setAnswer("Sorry, I couldn't process your question. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (!insights) {
        return (
            <div className="flex w-full max-w-5xl mx-auto flex-col gap-2 p-4 md:p-8">

                {/* Header */}
                <div className="relative mb-4 overflow-hidden rounded-2xl bg-primary p-8 text-white">

                    <div className="pointer-events-none absolute -top-1/2 -right-[10%] h-[200px] w-[300px] rounded-full bg-white/10"></div>
                    <div className="pointer-events-none absolute -bottom-[30%] -left-[5%] h-[200px] w-[200px] rounded-full bg-white/10"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <div className="mb-2 text-2xl md:text-3xl font-semibold">
                                    <span className="items-center gap-2">
                                        Get Clarity with Terriva
                                    </span>
                                </div>
                                <p className="opacity-70 text-sm flex items-center gap-1">
                                    Add more data to unlock the ability to chat with your assistant
                                </p>
                            </div>

                            <div className="text-left md:text-right">

                                <Button onClick={() => router.push("/dashboard")} className="bg-white/20 hover:bg-white/30 text-white font-medium h-10 flex items-center gap-2">
                                    Dashboard
                                    <ChevronRightIcon className="h-4 w-4" />
                                </Button>

                            </div>

                        </div>
                    </div>
                </div>
                {loadingInsights ? (
                    <div className=" flex flex-col bg-white/80 backdrop-blur-sm border-pink-100 rounded-2xl p-4 md:p-6 lg:col-span-5 lg:row-span-2">
                        <div className="flex flex-col items-center justify-center h-[40svh]">
                            <video src="/Loader.webm" className="mx-auto w-16 h-16" autoPlay loop muted />
                        </div>
                    </div>
                ) : (
                <div className=" flex flex-col bg-white/80 backdrop-blur-sm border-pink-100 rounded-2xl p-4 md:p-6 lg:col-span-5 lg:row-span-2">
                    <div className="flex flex-col items-center justify-center h-[40svh]">
                        <Brain className="h-12 w-12 text-pink-500 mb-4" />
                        <p className="text-gray-500 text-lg">No personal data available.</p>
                        <p className='text-gray-400 text-sm text-center'>Add more data in dashboard to chat with Terriva.</p>
                    </div>
                </div>
                )}
            </div >
        )
    }

    return (
        <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 md:py-10 space-y-6 mb-20">

            {/* Header */}
            <div className="relative mb-4 overflow-hidden rounded-2xl bg-primary p-8 text-white">

                <div className="pointer-events-none absolute -top-1/2 -right-[10%] h-[200px] w-[300px] rounded-full bg-white/10"></div>
                <div className="pointer-events-none absolute -bottom-[30%] -left-[5%] h-[200px] w-[200px] rounded-full bg-white/10"></div>

                <div className="relative z-10">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <div className="mb-2 text-2xl md:text-3xl font-semibold">
                                <span className="items-center gap-2">
                                    Get Clarity with Terriva
                                </span>
                            </div>
                            <p className="opacity-70 text-sm flex items-center gap-1">
                                Track more cycles to make your AI Assistant smarter
                            </p>
                        </div>

                        <div className="text-left md:text-right">

                            <Button onClick={() => router.push("/dashboard")} className="bg-white/20 hover:bg-white/30 text-white font-medium h-10 flex items-center gap-2">
                                Dashboard
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Card */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl h-fit">
                <CardContent className="p-5 md:p-8 space-y-6">

                    {/* Input */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            placeholder="Ask anything to Terriva..."
                            value={question}
                            disabled={loading}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                            className="h-12"
                        />

                        <Button
                            onClick={handleAsk}
                            disabled={loading}
                            className="h-12 px-6 bg-primary text-white flex items-center gap-2"
                        >
                            <Brain className="h-4 w-4" />
                            {loading ? "Thinking..." : "Ask"}
                        </Button>
                    </div>

                    <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 mt-2">
                        <p className="text-sm uppercase text-red-600 font-semibold">
                            Disclaimer
                        </p>
                        <p className="text-sm font-semibold text-pink-700 mt-2 ">
                            These insights are informational only, not medical advice.
                        </p>
                    </div>

                </CardContent>
            </Card>

            {!loading &&
                <Card className="bg-white/70 backdrop-blur-xl rounded-2xl">
                    {/* Answer */}
                    {answer && (
                        <div className="rounded-2xl bg-muted p-4 md:p-6 text-sm leading-relaxed whitespace-pre-wrap animate-in fade-in">
                            {answer}
                        </div>
                    )}

                    {/* Empty State */}
                    {!answer && !loading && (
                        <div className="text-center text-sm text-muted-foreground py-6">
                            Ask questions to see the magic of Terriva
                        </div>
                    )}</Card>
            }
        </div>
    )
}
