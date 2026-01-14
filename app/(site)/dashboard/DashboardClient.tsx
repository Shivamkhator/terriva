"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
    Tabs,
    TabsContent,
    TabsContents,
    TabsList,
    TabsTrigger,
} from '@/components/animate-ui/components/radix/tabs';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronRightIcon, Trash2, Save, Calendar as CalendarIcon, TrendingUp, Activity } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { type DateRange } from "react-day-picker";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";

type DashboardClientProps = {
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

interface DailyFlow {
    date: string;
    intensity: number;
}

interface Period {
    id: string;
    startDate: Date;
    endDate?: Date;
    dailyFlows: DailyFlow[];
}

const FLOW_STATES = [
    { value: 0, label: "None", color: "#", textColor: "#2A2A2A" },
    { value: 1, label: "Light", color: "#E9D5E1", textColor: "#2A2A2A" },
    { value: 2, label: "Medium", color: "#FBBBCE", textColor: "#2A2A2A" },
    { value: 3, label: "Heavy", color: "#FCA5AC", textColor: "#2A2A2A" },
];

export default function DashboardClient({ user }: DashboardClientProps) {
    const [insights, setInsights] = React.useState<any | null>(null);
    const [loadingInsights, setLoadingInsights] = React.useState(true);
    const [emailEnabled, setEmailEnabled] = React.useState(false);
    const [savingEmailPref, setSavingEmailPref] = React.useState(false);
    const [flowDate, setFlowDate] = React.useState<Date | undefined>(undefined);
    const [flow, setFlow] = useState(1);

    const router = useRouter();

    // Period tracking state
    const [openStart, setOpenStart] = React.useState(false);
    const [openEnd, setOpenEnd] =
        React.useState(false);
    const [hasEnded, setHasEnded] = React.useState(false);
    const [dateRange, setDateRange] = React.useState<DateRange>({
        from: undefined,
        to: undefined,
    });

    const [periods, setPeriods] = React.useState<Period[]>([]);
    const [loadingPeriods, setLoadingPeriods] = React.useState(true);
    const [dailyFlows, setDailyFlows] = React.useState<DailyFlow[]>([]);
    const [historyMonth, setHistoryMonth] = React.useState<Date>(new Date());

    const greeting = useMemo(
        () => (Math.random() > 0.5 ? "Namaste" : "Konnichiwa"),
        []
    );


    const today = React.useMemo(() => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return t;
    }, []);

    useEffect(() => {
        setLoadingPeriods(true);
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
        loadData().finally(() => setLoadingPeriods(false));
    }, []);
    // Sort periods by actual start date (most recent first) for display
    const sortedPeriods = React.useMemo(() => {
        return [...periods].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    }, [periods]);

    useEffect(() => {
        if (!user?.email) return;

        fetch("/api/user/me")
            .then(res => res.json())
            .then(data => {
                setEmailEnabled(data.emailNotifications);
            });
    }, [user]);


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
    }, [periods.length, flowDate]);

    const startDate = dateRange?.from ? formatDate(dateRange.from) : "Start date";
    const endDate = dateRange?.to ? formatDate(dateRange.to) : "End date";

    const periodLength =
        dateRange.from && dateRange.to
            ? Math.round(
                (dateRange.to.getTime() - dateRange.from.getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1
            : null;

    const modifiers = React.useMemo(() => {
        const from = dateRange.from;
        const to = dateRange.to;

        if (!from || !to) {
            return {
                range_start: from,
                range_end: to,
                range_middle: undefined,
            };
        }

        const middleFrom = new Date(from);
        middleFrom.setDate(middleFrom.getDate() + 1);

        const middleTo = new Date(to);
        middleTo.setDate(middleTo.getDate() - 1);

        return {
            range_start: from,
            range_end: to,
            range_middle:
                middleFrom <= middleTo ? { from: middleFrom, to: middleTo } : undefined,
        };
    }, [dateRange]);

    // Handle flow logging
    const handleLogFlow = async () => {
        const dateStr = today.toISOString().split('T')[0];

        try {
            const response = await fetch('/api/flows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateStr, intensity: flow }),
            });

            if (response.ok) {
                const existingIndex = dailyFlows.findIndex(f => f.date === dateStr);
                let newFlows;
                if (existingIndex >= 0) {
                    newFlows = [...dailyFlows];
                    newFlows[existingIndex] = { date: dateStr, intensity: flow };
                } else {
                    newFlows = [...dailyFlows, { date: dateStr, intensity: flow }];
                }
                setDailyFlows(newFlows);
                setFlow(1);
            } else {
                console.error('Failed to save flow');
            }
        } catch (error) {
            console.error('Error saving flow:', error);
        }
    };

    // Handle period tracking
    const handleSavePeriod = async () => {
        if (!dateRange.from) return;

        try {
            const response = await fetch('/api/periods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: dateRange.from.toISOString(),
                    endDate: dateRange.to ? dateRange.to.toISOString() : null,
                }),
            });

            if (response.ok) {
                const newPeriod = await response.json();
                const periodFlows = dailyFlows.filter(f => {
                    const flowDate = new Date(f.date);
                    const isAfterStart = flowDate >= dateRange.from!;
                    const isBeforeEnd = dateRange.to ? flowDate <= dateRange.to : true;
                    return isAfterStart && isBeforeEnd;
                });

                setPeriods([...periods, {
                    id: newPeriod.id,
                    startDate: new Date(newPeriod.startDate),
                    endDate: newPeriod.endDate ? new Date(newPeriod.endDate) : undefined,
                    dailyFlows: periodFlows,
                }]);
                resetPeriodForm();
            } else {
                console.error('Failed to save period');
            }
        } catch (error) {
            console.error('Error saving period:', error);
        }
    };

    const resetPeriodForm = () => {
        setDateRange({ from: undefined, to: undefined });
        setHasEnded(false);
    };

    const deletePeriod = async (id: string) => {
        try {
            const response = await fetch(`/api/periods/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const newPeriods = periods.filter(p => p.id !== id);
                setPeriods(newPeriods);
            } else {
                console.error('Failed to delete period');
            }
        } catch (error) {
            console.error('Error deleting period:', error);
        }
    };

    function calculateNextPeriodDays() {
        if (!insights?.nextPeriodDate) return null;
        const today = new Date();
        const nextPeriod = new Date(insights.nextPeriodDate);
        return daysBetween(today, nextPeriod);
    }

    function daysBetween(start: Date, end: Date) {
    return Math.floor(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
}


    return (
        <div className="min-h-screen">
            <div className="flex w-full max-w-5xl mx-auto flex-col gap-2 p-4 md:p-8">

                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-white">

                    <div className="pointer-events-none absolute -top-1/2 -right-[10%] h-[200px] w-[300px] rounded-full bg-white/10"></div>
                    <div className="pointer-events-none absolute -bottom-[30%] -left-[5%] h-[200px] w-[200px] rounded-full bg-white/10"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <div className="mb-2 text-2xl md:text-3xl font-semibold">
                                    <span className="items-center gap-2">
                                        {greeting}, {user.name?.split(" ")[0] || "User"}!
                                    </span>
                                </div>
                                <p className="opacity-70 text-sm flex items-center gap-1">
                                    {insights ? (<span>Your next periods are in <span className="font-bold italic">{calculateNextPeriodDays()} Days</span></span>) : ("Track more cycles to unlock personalized insights")}
                                </p>
                            </div>

                            <div className="text-left md:text-right">

                                {insights ? (<Button onClick={() => router.push("/insights")} className="bg-white/20 hover:bg-white/30 text-white font-medium h-10 flex items-center gap-2">
                                    View Insights
                                    <ChevronRightIcon className=" hidden md:block h-4 w-4" />
                                </Button>) : (<Button className="bg-white/20 text-white font-medium h-10 flex items-center gap-2" disabled>
                                    Yet to Unlock
                                </Button>)}

                            </div>

                        </div>
                    </div>
                </div>
                <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-primary">
                            Email reminders
                        </p>
                        <p className="text-xs text-gray-primary">
                            Get notified before your period starts
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            const next = !emailEnabled;
                            setEmailEnabled(next);
                            setSavingEmailPref(true);

                            try {
                                const res = await fetch("/api/user/email-preference", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ enabled: next }),
                                });

                                if (!res.ok) {
                                    // rollback on failure
                                    setEmailEnabled(!next);
                                }
                            } catch {
                                setEmailEnabled(!next);
                            } finally {
                                setSavingEmailPref(false);
                            }
                        }}
                        disabled={savingEmailPref}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition
    ${emailEnabled ? "bg-primary" : "bg-gray-primary opacity-30"}
    ${savingEmailPref ? "cursor-not-allowed" : ""}
  `}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition
      ${emailEnabled ? "translate-x-6" : "translate-x-1"}
    `}
                        />
                    </button>

                </div>


                {/* Main Tabs */}
                <Tabs defaultValue="flow" className="w-full">
                    <TabsList className="w-full bg-white/80 backdrop-blur-sm">
                        <TabsTrigger value="flow" className="text-gray-primary data-[state=active]:text-primary rounded-2xl">
                            Daily Flow
                        </TabsTrigger>
                        <TabsTrigger value="periods" className="text-gray-primary data-[state=active]:text-primary rounded-2xl">
                            Track Period
                        </TabsTrigger>
                    </TabsList>

                    <Card className="bg-white/80 backdrop-blur-sm border-pink-100">
                        <TabsContents>
                            <TabsContent value="flow">
                                <CardContent>
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="text-center py-2">
                                                <p className="text-sm pt-2 text-muted-foreground">
                                                    Logging flow for
                                                </p>
                                                <p className=" text-muted-foreground mt-1 italic font-semibold">
                                                    {formatDate(today)}
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="bg-linear-to-r from-pink-50 to-purple-50 rounded-xl p-6 border-2 border-pink-100">
                                                    <Slider
                                                        value={[flow]}
                                                        min={0}
                                                        max={3}
                                                        step={1}
                                                        onValueChange={([v]) => v != null && setFlow(v)}
                                                        className="cursor-pointer mb-6"
                                                    />
                                                    <div className="flex justify-between mt-2">
                                                        {FLOW_STATES.map((f) => (
                                                            <button
                                                                key={f.value}
                                                                onClick={() => setFlow(f.value)}
                                                                className={`p-2 px-[2.5vw] md:px-[5vw] rounded-lg border-2 transition-all duration-200 ${flow === f.value
                                                                    ? 'border-pink-400 scale-105'
                                                                    : 'border-gray-200 hover:border-pink-200'
                                                                    }`}
                                                                style={{
                                                                    backgroundColor: f.color,
                                                                }}
                                                            >
                                                                <span
                                                                    className="text-xs md:text-sm font-semibold"
                                                                    style={{ color: f.textColor }}
                                                                >
                                                                    {f.label}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleLogFlow}
                                                className="w-full h-12 bg-primary text-white"
                                            >
                                                <Save className="h-4 w-4 mr-2" /> Save Today's Flow
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </TabsContent>

                            <TabsContent value="periods">
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-3 mt-6">
                                                <div className="space-y-2">
                                                    <Popover open={openStart} onOpenChange={setOpenStart}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                id="start-date"
                                                                className="w-full justify-between font-normal h-12 border-2 hover:border-pink-300"
                                                            >
                                                                <span className="text-sm">{startDate}</span>
                                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-pink-500" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={dateRange.from}
                                                                defaultMonth={dateRange.from ?? today}
                                                                captionLayout="dropdown"
                                                                className="rounded-lg border-0 w-[16rem]"
                                                                modifiers={modifiers}
                                                                disabled={(date) => {
                                                                    const d = new Date(date);
                                                                    d.setHours(0, 0, 0, 0);
                                                                    return d > today;
                                                                }}
                                                                onSelect={(date) => {
                                                                    if (!date) {
                                                                        setDateRange({ from: undefined, to: undefined });
                                                                        return;
                                                                    }
                                                                    const d = new Date(date);
                                                                    d.setHours(0, 0, 0, 0);
                                                                    setDateRange({
                                                                        from: d,
                                                                        to: hasEnded ? dateRange.to : undefined,
                                                                    });
                                                                    setOpenStart(false);
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                <div className="flex items-center gap-3 p-4 mt-6 bg-pink-50 rounded-lg border border-pink-200">
                                                    <Checkbox
                                                        id="has-ended"
                                                        checked={hasEnded}
                                                        onCheckedChange={(checked) => {
                                                            const value = checked === true;
                                                            setHasEnded(value);
                                                            if (!value) {
                                                                setDateRange((prev) => ({ from: prev.from, to: undefined }));
                                                            }
                                                        }}
                                                        className="border-pink-400 data-[state=checked]:bg-primary"
                                                    />
                                                    <Label htmlFor="has-ended" className="text-sm font-medium cursor-pointer">
                                                        My period has ended
                                                    </Label>
                                                </div>

                                                {hasEnded && (
                                                    <div className="space-y-2">
                                                        <Popover open={openEnd} onOpenChange={setOpenEnd}>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    id="end-date"
                                                                    className="w-full justify-between font-normal h-12 border-2 hover:border-pink-300"
                                                                    disabled={!hasEnded || !dateRange.from}
                                                                >
                                                                    <span className="text-sm">{endDate}</span>
                                                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-pink-500" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={dateRange.to}
                                                                    defaultMonth={dateRange.to ?? dateRange.from ?? today}
                                                                    captionLayout="dropdown"
                                                                    className="rounded-lg border-0 w-[16rem]"
                                                                    modifiers={modifiers}
                                                                    disabled={(date) => {
                                                                        const d = new Date(date);
                                                                        d.setHours(0, 0, 0, 0);
                                                                        const isBeforeStart = dateRange.from ? d < dateRange.from : false;
                                                                        const isInFuture = d > today;
                                                                        return isBeforeStart || isInFuture;
                                                                    }}
                                                                    onSelect={(date) => {
                                                                        setDateRange((prev) => {
                                                                            if (!date) {
                                                                                return { from: prev.from, to: undefined };
                                                                            }
                                                                            const d = new Date(date);
                                                                            d.setHours(0, 0, 0, 0);
                                                                            return { from: prev.from, to: d };
                                                                        });
                                                                        if (date) setOpenEnd(false);
                                                                    }}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                )}
                                            </div>

                                            {periodLength && dateRange.from && dateRange.to && (
                                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                    <p className="text-sm text-purple-700">
                                                        {periodLength < 1 ? <span className="text-red-600"> End date cannot be before start date</span> : (<>

                                                            <span className="font-semibold">Duration:</span> {periodLength} day{periodLength > 1 ? "s" : ""}</>)}
                                                    </p>
                                                </div>
                                            )}

                                            <Button
                                                onClick={handleSavePeriod}
                                                disabled={!dateRange.from || (hasEnded && !dateRange.to) || (hasEnded && dateRange.to! < dateRange.from!)}
                                                className="w-full h-12 bg-primary text-white mb-4"
                                            >
                                                <CalendarIcon className="h-4 w-4 mr-2" /> Save Period
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </TabsContent>
                        </TabsContents>
                    </Card>
                </Tabs>

                {/* History Calendar */}
                <Card className="bg-white/80 backdrop-blur-sm border-pink-100">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Activity className="h-5 w-5 text-pink-500" />
                            Cycle History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {periods.length === 0 && dailyFlows.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                    <CalendarIcon className="h-16 w-16 text-pink-400" />
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">No tracking data yet</p>
                                <p className="text-xs text-muted-foreground">Start logging your periods and daily flow above!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <Calendar
                                    mode="single"
                                    month={historyMonth}
                                    onMonthChange={setHistoryMonth}
                                    className="bg-linear-to-br from-white to-pink-50/30 w-full rounded-xl border-2 border-pink-100 p-4"
                                    captionLayout="dropdown"
                                    modifiers={{
                                        period: periods.flatMap(period => {
                                            const start = new Date(period.startDate);
                                            const end = period.endDate ? new Date(period.endDate) : start;
                                            const dates: Date[] = [];
                                            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                                                dates.push(new Date(d));
                                            }
                                            return dates;
                                        }),
                                        predicted: insights?.nextPredicted ? [insights.nextPredicted] : [],
                                    }}
                                    components={{
                                        Day: (props: any) => {
                                            const { day } = props;
                                            if (!day) return <div />;

                                            const date = day.date;
                                            const dateStr = date.toISOString().split("T")[0];
                                            const flow = dailyFlows.find(f => f.date === dateStr);
                                            const flowState = flow ? FLOW_STATES[flow.intensity] : null;

                                            let isPeriodDay = false;
                                            let periodDayNumber = 0;

                                            for (const period of periods) {
                                                const start = new Date(period.startDate);
                                                start.setHours(0, 0, 0, 0);
                                                const end = period.endDate ? new Date(period.endDate) : start;
                                                end.setHours(0, 0, 0, 0);
                                                const checkDate = new Date(date);
                                                checkDate.setHours(0, 0, 0, 0);

                                                if (checkDate >= start && checkDate <= end) {
                                                    isPeriodDay = true;
                                                    periodDayNumber = Math.floor((checkDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                                    break;
                                                }
                                            }


                                            return (
                                                <div className="relative w-full h-full flex items-center justify-center group">
                                                    <div
                                                        className="w-[8vw] h-[8vw] flex items-center justify-center text-xs md:text-sm font-medium transition-all hover:scale-105 cursor-default border border-gray-primary/10 rounded-md"
                                                        style={{
                                                            backgroundColor: flowState ? `${flowState.color}` : undefined,
                                                            color: flowState ? flowState.textColor : undefined,
                                                            border: (flowState || isPeriodDay) ? '2px solid rgba(0,0,0,0.3)' : undefined,

                                                        }}
                                                    >
                                                        {date.getDate()}
                                                    </div>

                                                    {/* Tooltip */}
                                                    {(flowState || isPeriodDay) && (
                                                        <div className="absolute bottom-full mb-2 hidden group-hover:flex bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-10">
                                                            {(flowState && isPeriodDay) ? `Day ${periodDayNumber} with ${flowState.label} Flow` : isPeriodDay ? `Day ${periodDayNumber}` : flowState ? `${flowState.label} Flow` : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        },
                                    }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Period Records */}
                {periods.length > 0 && (
                    <Card className="bg-white/80 backdrop-blur-sm border-pink-100 mb-24">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center gap-2">
                                <TrendingUp className="h-5 w-5 text-pink-500" />
                                Past Periods
                            </CardTitle>
                        </CardHeader>
                        <CardContent>

                            {loadingPeriods ? (
                                <div className="flex items-center justify-center py-8">
                                    <video src="/Loader.webm" className="mx-auto w-12 h-12" autoPlay loop muted />
                                </div>
                            ) : (
                            <div className="space-y-3">
                                {sortedPeriods.map((period) => {
                                    const start = new Date(period.startDate);
                                    const end = period.endDate ? new Date(period.endDate) : start;
                                    const length = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                                    return (
                                        <div
                                            key={period.id}
                                            className="flex justify-between items-center p-4 bg-linear-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-pink-100 hover:shadow-md transition-all group"
                                        >
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800">
                                                    {formatDate(period.startDate)} → {period.endDate ? formatDate(period.endDate) : "Ongoing"}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Duration: <span className="font-medium text-pink-600">{length} day{length > 1 ? "s" : ""}</span>
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deletePeriod(period.id)}
                                                className="transition-colors opacity-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
