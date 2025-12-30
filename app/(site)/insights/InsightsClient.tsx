'use client';
import AnimatedCircularProgressBar from '@/components/CircularProgressBar';
import FlowChart from '@/components/FlowChart';
import LineChart from '@/components/LineChart';
import { Session } from "next-auth";
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "lucide-react"
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

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
        if (!periods.length) {
            return { currentDay: 1, totalDays: insights?.avgCycleLength ?? 28 };
        }

        const lastPeriod = periods
            .slice()
            .sort(
                (a, b) =>
                    new Date(b.startDate).getTime() -
                    new Date(a.startDate).getTime()
            )[0];

        const start = new Date(lastPeriod.startDate);
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
            totalDays: insights?.avgCycleLength ?? 28,
        };
    }, [periods, insights]);


    function lastPeriod() {
        return periods.length > 0 ? periods
            .slice()
            .sort(
                (a, b) =>
                    new Date(b.startDate).getTime() -
                    new Date(a.startDate).getTime()
            )[0]: null ;
        }


    function calculateNextPeriodDays() {
        if (!insights?.nextPeriodDate) return null;
        const today = new Date();
        const nextPeriod = new Date(insights.nextPeriodDate);
        return daysBetween(today, nextPeriod);
    }

    return (
        <div className="min-h-screen">
            <div className="flex w-full max-w-5xl mx-auto flex-col gap-6 p-4 md:p-8">

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
                                    <Sparkles className="inline-block w-4 h-4 text-pink-400" />
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

                <div className=" flex flex-col gap-8 grid-cols-1 md:grid md:grid-cols-12">


                    <div className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-2xl p-4 md:p-6 lg:col-span-5 lg:row-span-2">
                        <h3 className="font-semibold text-gray-500">Cycle Overview</h3>

                        <AnimatedCircularProgressBar
                            currentDay={currentDay}
                            periodLength={insights?.avgPeriodLength || 5}
                            cycleLength={totalDays}
                        />

                        {/* Bottom Section: Data-Driven Insights */}

                            <div className="relative p-4 bg-linear-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-pink-100 hover:shadow-md transition-all group ">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-pink-700">Pro Metrics</span>
                                    <Sparkles className="w-4 h-4 text-pink-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">

                                    <div className=" p-3 rounded-xl">
                                        <p className="text-xs uppercase text-gray-400 font-bold">Last Period on</p>
                                        <p className="font-semibold text-xl text-gray-700">{formatDate(lastPeriod()?.startDate) || "--"}</p>
                                    </div>
                                    <div className=" p-3 rounded-xl">
                                        <p className="text-xs uppercase text-gray-400 font-bold">Next Periods in</p>
                                        <p className="font-semibold text-xl text-gray-700">{calculateNextPeriodDays() || "--"} Days</p>
                                    </div>
                                    <div className=" p-3 rounded-xl">
                                        <p className="text-xs uppercase text-gray-400 font-bold">Avg. Period Length</p>
                                        <p className="font-semibold text-xl text-gray-700">{insights?.avgPeriodLength || "--"} Days</p>
                                    </div>
                                    <div className=" p-3 rounded-xl">
                                        <p className="text-xs uppercase text-gray-400 font-bold">Avg. Cycle Length</p>
                                        <p className="font-semibold text-xl text-gray-700">{totalDays || "--"} Days</p>
                                    </div>

                                </div>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-2xl p-4 md:p-6 lg:col-span-7 lg:row-span-1">
                        <h3 className="font-semibold text-gray-500 mb-4">Periods History</h3>

                        <LineChart data={monthlyPeriodData} />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-2xl p-4 md:p-6 lg:col-span-7 lg:row-span-1">
                        <h3 className="font-semibold text-gray-500 mb-4">Flow Intensity</h3>

                        <FlowChart data={monthlyFlowData} />
                    </div>
                </div>

            </div>
        </div>
    );
}
