'use client';
import AnimatedCircularProgressBar from '@/components/CircularProgressBar';
import FlowChart from '@/components/FlowChart';
import LineChart from '@/components/LineChart';
import { Session } from "next-auth";
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "lucide-react"
import { Button } from '@/components/ui/button';
import {
    getLastPeriod,
    getAveragePeriodLength,
    getAverageCycleLength,
    getNextPeriodDate,
    getDaysUntilNextPeriod,
} from "@/lib/cycleInsights";

type CycleClientProps = {
    user: Session["user"];
};

function formatDate(date?: Date) {
    if (!date) return "";
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function monthKey(date: Date) {
    return date.toISOString().slice(0, 7); // YYYY-MM
}

function daysBetween(start: Date, end: Date) {
    return Math.floor(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
}

export default function InsightsClient({ user }: CycleClientProps) {
    const router = useRouter();

    const [periods, setPeriods] = useState<Array<{ startDate: Date; endDate?: Date }>>([]);
    const [dailyFlows, setDailyFlows] = useState<Array<{ date: string; intensity: number }>>([]);

    const [insights, setInsights] = useState<any>(null);
    const [loadingInsights, setLoadingInsights] = useState<boolean>(true);

    const phaseSuggestions = {
        menstrual: [
            "Low energy days — rest and hydration can help 🌸",
            "It’s okay to slow down today. Be kind to your body 💗",
            "Gentle movement and warmth may feel comforting today.",
            "You may feel more tired today — listening to your body helps.",
            "Rest, fluids, and light meals can support you today."
        ],

        follicular: [
            "Your energy may be rising — a good time to start new things ✨",
            "You might feel clearer and more motivated today.",
            "This phase often brings fresh energy and focus.",
            "A great time to plan, learn, or try something new 🌱",
            "You may feel lighter and more optimistic today."
        ],

        ovulation: [
            "You may feel more confident and social today 🌼",
            "Your body is at a natural peak of energy right now.",
            "Good day for communication and connection 💬",
            "You might feel stronger and more expressive today.",
            "Energy and mood often feel balanced in this phase."
        ],

        luteal: [
            "Slowing down a bit may feel good today 💛",
            "Self-care and rest can be especially helpful now.",
            "You might feel more sensitive — that’s completely normal.",
            "Focus on comfort and simple routines today.",
            "Listening to your needs is important in this phase."
        ]
    };

    const cycleStats = useMemo(() => {
        const avgPeriodLength = getAveragePeriodLength(periods);
        const avgCycleLength = getAverageCycleLength(periods);

        const lastPeriod = getLastPeriod(periods);

        const nextPeriodDate = getNextPeriodDate(
            periods,
            avgCycleLength
        );

        const daysUntilNext = getDaysUntilNextPeriod(
            nextPeriodDate
        );

        return {
            avgPeriodLength,
            avgCycleLength,
            lastPeriod,
            nextPeriodDate,
            daysUntilNext,
        };
    }, [periods]);


    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch periods
                const periodsRes = await fetch('/api/periods');
                if (periodsRes.ok) {
                    const periodsData = await periodsRes.json();
                    setPeriods(periodsData.map((p: any) => ({
                        ...p,
                        startDate: new Date(p.startDate),
                        endDate: p.endDate ? new Date(p.endDate) : undefined,
                    })));
                }

                // Fetch flows
                const flowsRes = await fetch('/api/flows');
                if (flowsRes.ok) {
                    const flowsData = await flowsRes.json();
                    setDailyFlows(flowsData.map((f: any) => ({
                        date: new Date(f.date).toISOString().split('T')[0],
                        intensity: f.intensity,
                    })));
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, []);

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

    // Sort periods by actual start date (most recent first) for display
    const sortedPeriods = useMemo(() => {
        return [...periods].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }, [periods]);

    const monthlyPeriodData = useMemo(() => {
        const map = new Map<string, number[]>();

        sortedPeriods.forEach(p => {
            if (!p.endDate) return;

            const key = monthKey(p.startDate);
            const length = daysBetween(p.startDate, p.endDate);

            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(length);
        });

        return Array.from(map.entries()).map(([month, values]) => ({
            month,
            cycleDays: Math.round(
                values.reduce((a, b) => a + b, 0) / values.length
            ),
        }));
    }, [periods]);

    const monthlyFlowData = useMemo(() => {
        const map = new Map<
            string,
            { light: number; medium: number; heavy: number }
        >();

        dailyFlows.forEach(f => {
            const key = f.date.slice(0, 7); // YYYY-MM

            if (!map.has(key)) {
                map.set(key, { light: 0, medium: 0, heavy: 0 });
            }

            const bucket = map.get(key)!;

            if (f.intensity === 1) bucket.light++;
            if (f.intensity === 2) bucket.medium++;
            if (f.intensity === 3) bucket.heavy++;
        });

        return Array.from(map.entries()).map(([month, counts]) => ({
            month,
            ...counts,
        }));
    }, [dailyFlows]);

    const { currentDay, totalDays } = useMemo(() => {
  if (!cycleStats.lastPeriod) {
    return {
      currentDay: 1,
      totalDays: cycleStats.avgCycleLength ?? 28,
    };
  }

  const start = new Date(cycleStats.lastPeriod.startDate);
  start.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const day =
    Math.floor(
      (today.getTime() - start.getTime()) /
      (1000 * 60 * 60 * 24)
    ) + 1;

  return {
    currentDay: day,
    totalDays: cycleStats.avgCycleLength ?? 28,
  };
}, [cycleStats]);

    function todayKey() {
        return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    }


    function getDailySuggestionCached(
        phase: keyof typeof phaseSuggestions
    ) {
        const key = `daily-suggestion-${todayKey()}-${phase}`;

        const cached = localStorage.getItem(key);
        if (cached) return cached;

        const suggestions = phaseSuggestions[phase];
        const selected =
            suggestions[Math.floor(Math.random() * suggestions.length)];

        localStorage.setItem(key, selected);
        return selected;
    }
    function getCyclePhase(
        day: number,
        periodLength: number,
        cycleLength: number
    ) {
        if (day <= periodLength) return "menstrual";

        const ovulationDay = cycleLength - 14;

        if (day < ovulationDay - 4) return "follicular";
        if (day >= ovulationDay - 4 && day <= ovulationDay + 1) return "ovulation";
        return "luteal";
    }

    function isFertileToday(
        day: number,
        cycleLength: number
    ) {
        const ovulationDay = cycleLength - 14;

        const fertileStart = ovulationDay - 4;
        const fertileEnd = ovulationDay + 1;

        return day >= fertileStart && day <= fertileEnd;
    }


    const currentPhase = useMemo(() => {
        if (!insights) return "follicular";

        return getCyclePhase(
            currentDay,
            cycleStats.avgPeriodLength ?? 5,
            cycleStats.avgCycleLength ?? 28
        );
    }, [currentDay, cycleStats]);

    const dailySuggestion = useMemo(() => {
        if (typeof window === "undefined") return "";
        return getDailySuggestionCached(currentPhase);
    }, [currentPhase]);

    function getCycleLengths(
        periods: Array<{ startDate: Date }>
    ): number[] {
        if (periods.length < 2) return [];

        const sorted = [...periods].sort(
            (a, b) => a.startDate.getTime() - b.startDate.getTime()
        );

        const lengths: number[] = [];

        for (let i = 1; i < sorted.length; i++) {
            const prev = sorted[i - 1].startDate;
            const curr = sorted[i].startDate;

            lengths.push(
                Math.round(
                    (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
                )
            );
        }

        return lengths;
    }

    function standardDeviation(values: number[]) {
        if (values.length === 0) return 0;

        const mean =
            values.reduce((a, b) => a + b, 0) / values.length;

        const variance =
            values.reduce((a, b) => a + (b - mean) ** 2, 0) /
            values.length;

        return Math.sqrt(variance);
    }

    function cycleRegularityScore(cycleLengths: number[]) {
        if (cycleLengths.length < 3) {
            return {
                score: null,
                label: "Not enough data",
            };
        }

        const sd = standardDeviation(cycleLengths);

        // Map SD → score
        const score = Math.max(0, Math.min(100, 100 - sd * 10));

        let label = "Irregular";
        if (sd <= 2) label = "Very Regular";
        else if (sd <= 4) label = "Regular";
        else if (sd <= 7) label = "Somewhat Irregular";

        return {
            score: Math.round(score),
            label,
            sd: Math.round(sd * 10) / 10,
        };
    }

    const cycleRegularity = useMemo(() => {
        const lengths = getCycleLengths(periods);
        return cycleRegularityScore(lengths);
    }, [periods]);

    const isFertile = useMemo(() => {
        if (!cycleStats) return null;

        return isFertileToday(
            currentDay,
            cycleStats.avgCycleLength ?? 28
        );
    }, [currentDay, cycleStats]);


    function getHealthWarnings({
        avgPeriodLength,
        avgCycleLength,
        dailyFlows,
    }: {
        avgPeriodLength?: number;
        avgCycleLength?: number;
        dailyFlows: Array<{ date: string; intensity: number }>;
    }) {
        const warnings: string[] = [];

        // Period length
        if (avgPeriodLength && avgPeriodLength > 8) {
            warnings.push(
                "Your periods seem longer than usual. Tracking this over time can help spot patterns."
            );
        }

        if (avgPeriodLength && avgPeriodLength < 3) {
            warnings.push(
                "Your periods seem shorter than average. Consider consulting a healthcare professional."
            );
        }

        // Cycle length
        if (avgCycleLength) {
            if (avgCycleLength < 21) {
                warnings.push(
                    "Your cycle appears shorter than average. This can sometimes happen due to stress or hormonal changes."
                );
            }
            if (avgCycleLength > 35) {
                warnings.push(
                    "Your cycle appears longer than average. Keeping track may help understand your rhythm."
                );
            }
        }

        // Flow heaviness
        const heavyDays = dailyFlows.filter(f => f.intensity === 3);

        if (heavyDays.length >= 3) {
            warnings.push(
                "You’ve logged several heavy flow days. Make sure to rest and stay hydrated."
            );
        }

        return warnings;
    }

    const healthWarnings = useMemo(() => {
        if (!cycleStats) return [];

        return getHealthWarnings({
            avgPeriodLength: cycleStats.avgPeriodLength ?? 5,
            avgCycleLength: cycleStats.avgCycleLength ?? 28,
            dailyFlows,
        });
    }, [cycleStats, dailyFlows]);

    if (!cycleStats) {
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
                                        Knowing Yourself
                                    </span>
                                </div>
                                <p className="opacity-70 text-sm flex items-center gap-1">
                                    Add more cycle data to unlock personalized insights
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
                <div className=" flex flex-col bg-white/80 backdrop-blur-sm border-pink-100 rounded-2xl p-4 md:p-6 lg:col-span-5 lg:row-span-2">
                    <div className="flex flex-col items-center justify-center h-[60svh]">
                        <svg
                            className="w-16 h-16 text-gray-400 mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <p className="text-gray-500 text-lg">No insights available.</p>
                        <p className='text-gray-400 text-sm text-center'>Add more data in dashboard to see personalized insights.</p>
                    </div>
                </div>
            </div >
        )
    }

    return (
        <div className="min-h-screen">
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
                                        Knowing Yourself
                                    </span>
                                </div>
                                <p className="opacity-70 text-sm flex items-center gap-1">
                                    Track more cycles to make insights more accurate
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
                        <div className="flex flex-col items-center justify-center h-[60svh]">
                            <video src="/Loader.webm" className="mx-auto w-16 h-16" autoPlay loop muted />

                        </div>
                    </div>
                ) : (
                    <div className=" flex flex-col gap-4 grid-cols-1 lg:grid lg:grid-cols-12">
                        <div className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-2xl p-4 md:p-6 lg:col-span-5 lg:row-span-2">
                            <h3 className="font-semibold text-gray-500">Cycle Overview</h3>
                            {loadingInsights ? (
                                <div className="flex flex-col items-center justify-center h-48">
                                    <video src="/Loader.webm" className="mx-auto w-16 h-16" autoPlay loop muted />
                                </div>
                            ) : (

                                <AnimatedCircularProgressBar
                                    currentDay={currentDay}
                                    periodLength={insights?.avgPeriodLength || 5}
                                    cycleLength={totalDays}
                                />
                            )}

                            {/* Health Warnings or Daily Suggestion */}

                            {healthWarnings.length > 0 ? (
                                <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                    <p className="text-sm uppercase tracking-wide text-amber-600 mb-1 font-semibold">
                                        Health Notice
                                    </p>

                                    <ul className="list-disc list-inside text-[12px] text-amber-700 space-y-1">
                                        {healthWarnings.map((warning, idx) => (
                                            <li key={idx}>{warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="mb-3 rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 transition-all">
                                    <p className="text-sm uppercase tracking-wide text-pink-500 mb-1 font-semibold">
                                        Did you know?
                                    </p>

                                    <p className="text-[12px] text-pink-700 leading-relaxed">
                                        {dailySuggestion}
                                    </p>
                                </div>)}


                            {/* Bottom Section: Data-Driven Insights */}

                            <div className="relative p-4 bg-linear-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-pink-100 hover:shadow-md transition-all group ">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-pink-700">Pro Metrics</span>
                                </div>
                                <div className="grid grid-cols-2 mb-4">

                                    <div className=" p-3 rounded-xl">
                                        <p className="text-xs uppercase text-gray-400 font-bold">Last Period on</p>
                                        <p className="font-semibold text-xl text-gray-700">{formatDate(cycleStats.lastPeriod?.startDate) || "--"}</p>
                                    </div>
                                    <div className=" p-3 rounded-xl">
                                        <p className="text-xs uppercase text-gray-400 font-bold">{(() => {
                                            const days = cycleStats.daysUntilNext;
                                            if (days === null) return "--";
                                            if (days < 1) return "Next Period";
                                            return "Next Period in";
                                        })()}</p>
                                        <p className="font-semibold text-xl text-gray-700">
                                            {(() => {
                                                const days = cycleStats.daysUntilNext;
                                                if (days === null) return "--";
                                                if (days < 1) return "May start soon";
                                                if (days === 1) return "1 day";
                                                return `${days} days`;
                                            })()}
                                        </p>
                                    </div>
                                    <div className=" p-3 rounded-xl">
                                        <p className="text-xs uppercase text-gray-400 font-bold">Avg. Period Length</p>
                                        <p className="font-semibold text-xl text-gray-700">{cycleStats.avgPeriodLength || "--"} Days</p>
                                    </div>
                                    <div className=" p-3 rounded-xl">
                                        <p className="text-xs uppercase text-gray-400 font-bold">Avg. Cycle Length</p>
                                        <p className="font-semibold text-xl text-gray-700">{cycleStats.avgCycleLength || "--"} Days</p>
                                    </div>

                                </div>

                                <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                                    <p className="text-sm uppercase text-gray-primary font-semibold">
                                        Fertility Status
                                    </p>

                                    {isFertile === null ? (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Track more cycles to calculate
                                        </p>
                                    ) : isFertile ? (
                                        <p className="font-semibold text-green-600 mt-1">
                                            High fertility window 🌱
                                        </p>
                                    ) : (
                                        <p className="font-semibold text-gray-600 mt-1">
                                            Low fertility today
                                        </p>
                                    )}
                                </div>


                                <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 mt-2">
                                    <p className="text-sm uppercase text-gray-primary font-semibold">
                                        Cycle Regularity
                                    </p>

                                    {cycleRegularity.score === null ? (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Track more cycles to calculate
                                        </p>
                                    ) : (
                                        <p className="font-semibold text-lg text-pink-600 mt-1">
                                            {cycleRegularity.score}% · {cycleRegularity.label}
                                        </p>
                                    )}
                                </div>
                                <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 mt-2">
                                    <p className="text-sm uppercase text-red-600 font-semibold">
                                        Disclaimer
                                    </p>
                                    <p className="text-sm font-semibold text-pink-700 mt-2 ">
                                        These insights are informational only, not medical advice.
                                    </p>
                                </div>

                            </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-2xl p-4 md:p-6 lg:col-span-7 lg:row-span-1">
                            <h3 className="font-semibold text-gray-500 mb-4">Average Periods Length </h3>

                            {loadingInsights ? (
                                <div className="flex flex-col items-center justify-center h-48">
                                    <video src="/Loader.webm" className="mx-auto w-16 h-16" autoPlay loop muted />
                                </div>
                            ) : (
                                <LineChart data={monthlyPeriodData} />
                            )}
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-2xl p-4 md:p-6 lg:col-span-7 lg:row-span-1">
                            <h3 className="font-semibold text-gray-500 mb-4">Flow Intensity</h3>

                            {loadingInsights ? (
                                <div className="flex flex-col items-center justify-center h-48">
                                    <video src="/Loader.webm" className="mx-auto w-16 h-16" autoPlay loop muted />
                                </div>
                            ) : (
                                <FlowChart data={monthlyFlowData} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
