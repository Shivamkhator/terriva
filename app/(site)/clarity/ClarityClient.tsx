"use client"

import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { ChevronRightIcon, Brain, RotateCcw, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Session } from "next-auth"
import { text } from "stream/consumers";

type ClarityClientProps = {
    user: Session["user"];
};

type Message = {
    role: "user" | "assistant";
    content: string;
    time?: string;
};

const MAX_QUESTIONS = 5;

export default function ClarityPage({ user }: ClarityClientProps) {
    const [question, setQuestion] = useState("")
    const [loading, setLoading] = useState(false)
    const [insights, setInsights] = useState<any>(null);
    const [loadingInsights, setLoadingInsights] = useState(true);
    const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
    const [questionCount, setQuestionCount] = useState(0);

    const router = useRouter()

    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversationHistory, loading]);


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
        if (questionCount >= MAX_QUESTIONS) return

        setLoading(true)
        const currentQuestion = question.trim();
        setQuestion("")
        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: currentQuestion, conversationHistory }),
            })

            const data = await res.json()
            if (data.limitReached) {


                setConversationHistory(prev => [
                    ...prev,
                    { role: 'user', content: currentQuestion, },
                    { role: 'assistant', content: "You've reached the maximum of 5 questions. Please start a new conversation." }
                ]);
                return;
            }
            const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            // Add both user question and assistant answer to history
            setConversationHistory(prev => [
                ...prev,
                { role: 'user', content: currentQuestion, time: now },
                { role: 'assistant', content: data.answer, time: now }
            ]);
            setQuestionCount(prev => prev + 1);

        } catch {
            setConversationHistory(prev => [
                ...prev,
                { role: 'user', content: currentQuestion, },
                { role: 'assistant', content: "Sorry, I couldn't process your question. Please try again." }
            ]);
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setConversationHistory([]);
        setQuestionCount(0);
        setQuestion("");
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
        <div className="mx-auto min-h-screen max-w-5xl px-4 py-4 md:py-8 flex flex-col gap-2 mb-20">

            {/* Header */}
            <div>
                <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-white mb-4">
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
            </div>

            <div className="flex-1 pb-4 space-y-4">

                {/* Conversation History */}
                {conversationHistory.length > 0 && (
                    <>
                        {conversationHistory.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >

                                <Card
                                    key={idx}
                                    className={`
    rounded-2xl border
    ${msg.role === "user"
                                            ? "ml-auto bg-primary/15 border-primary/30 shadow-sm"
                                            : "mr-auto bg-white/80 border-gray-200 shadow"}
    max-w-[85%]
  `}
                                >

                                    <CardContent className={`p-4 md:p-6`}>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-muted-foreground mb-1">
                                                    {msg.role === 'user' ? 'You' : 'Terriva'} • {msg.time}
                                                </p>
                                                <div
                                                    className={`
    prose prose-sm max-w-none
    ${msg.role === "user" ? "text-primary" : "text-gray-800"}
  `}
                                                >
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ node, ...props }) => <p className="my-1" {...props} />,
                                                            ul: ({ node, ...props }) => (
                                                                <ul className="list-disc pl-4 my-1" {...props} />
                                                            ),
                                                            ol: ({ node, ...props }) => (
                                                                <ol className="list-decimal pl-4 my-1" {...props} />
                                                            ),
                                                            li: ({ node, ...props }) => <li className="my-0" {...props} />,
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>




                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                        ))}
                        <div ref={bottomRef} />

                    </>
                )}


                {/* Loading State */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mr-auto bg-white/80 border border-gray-200 rounded-2xl px-4 py-3 w-fit shadow"
                    >
                        <p className="text-sm text-gray-700">
                            Terriva is typing<span className="animate-pulse">...</span>
                        </p>
                    </motion.div>
                )}



                {/* Chat Card */}
                <Card className="bg-white/50 border-black/40 backdrop-blur-xl rounded-2xl h-fit">
                    <CardContent className="p-5 md:p-8 space-y-3">
                        {/* Question Counter and Reset */}
                        {questionCount > 0 && (<div className="flex items-center justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Questions: {questionCount}/{MAX_QUESTIONS}
                                </span>
                                {questionCount >= MAX_QUESTIONS && (
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                )}
                            </div>
                            {conversationHistory.length > 0 && (
                                <Button
                                    onClick={handleReset}
                                    variant="ghost"
                                    className="text-red-500 hover:bg-red-50 flex items-center gap-2"
                                    size="sm"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    New Conversation
                                </Button>
                            )}
                        </div>
                        )}


                        {/* Input */}
                        <div className="flex flex-col sm:flex-row gap-3 bg-white/70 p-3 rounded-xl border border-gray-200">
                            <Input
                                placeholder="Ask anything to Terriva..."
                                value={question}
                                disabled={loading || questionCount >= MAX_QUESTIONS}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                                className="h-12 bg-transparent border-none shadow-none focus-visible:ring-0"
                            />

                            <Button
                                onClick={handleAsk}
                                disabled={loading || questionCount >= MAX_QUESTIONS}
                                className="h-12 px-8 bg-primary/90 text-white flex items-center gap-2 active:scale-95 hover:scale-120 transition rounded-md"
                            >
                                <Brain className="h-4 w-4" />
                                {loading ? "Thinking..." : "Ask"}
                            </Button>
                        </div>


                        {questionCount >= MAX_QUESTIONS && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                                <p className="text-sm text-amber-800">
                                    You've reached the maximum of 5 questions. Start a new conversation to continue.
                                </p>
                            </div>
                        )}


                        <div className="p-3 rounded-xl bg-pink-50 border border-pink-200">
                            <p className="text-sm uppercase text-red-600 font-semibold">
                                Disclaimer
                            </p>
                            <p className="text-sm font-semibold text-pink-700 mt-2 ">
                                These insights are informational only, not medical advice.
                            </p>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
