"use client";
import React, { useState, useEffect } from "react";
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
import { ChevronDown, Trash2, Save, Calendar as CalendarIcon, TrendingUp, Activity, Sparkles } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { type DateRange } from "react-day-picker";

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
    { value: 0, label: "None", color: "#FFFFFF", textColor: "#2A2A2A" },
    { value: 1, label: "Light", color: "#FCE7F3", textColor: "#2A2A2A" },
    { value: 2, label: "Medium", color: "#FBBBCE", textColor: "#2A2A2A" },
    { value: 3, label: "Heavy", color: "#FCA5AC", textColor: "#2A2A2A" },
];

export default function DashboardClient() {
    const [openFlowDate, setOpenFlowDate] = React.useState(false);
    const [flowDate, setFlowDate] = React.useState<Date | undefined>(undefined);
    const [flow, setFlow] = useState(1);

    // Period tracking state
    const [openStart, setOpenStart] = React.useState(false);
    const [openEnd, setOpenEnd] = React.useState(false);
    const [hasEnded, setHasEnded] = React.useState(false);
    const [dateRange, setDateRange] = React.useState<DateRange>({
        from: undefined,
        to: undefined,
    });

    const [periods, setPeriods] = React.useState<Period[]>([]);
    const [dailyFlows, setDailyFlows] = React.useState<DailyFlow[]>([]);
    const [historyMonth, setHistoryMonth] = React.useState<Date>(new Date());

    const today = React.useMemo(() => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return t;
    }, []);

    // Load data from storage
    useEffect(() => {
        const loadData = async () => {
            try {
                const periodsData = localStorage.getItem('periods');
                const flowsData = localStorage.getItem('dailyFlows');

                if (periodsData) {
                    const loadedPeriods = JSON.parse(periodsData);
                    setPeriods(loadedPeriods.map((p: any) => ({
                        ...p,
                        startDate: new Date(p.startDate),
                        endDate: p.endDate ? new Date(p.endDate) : undefined,
                    })));
                }

                if (flowsData) {
                    setDailyFlows(JSON.parse(flowsData));
                }
            } catch (error) {
                console.log('No saved data found');
            }
        };
        loadData();
    }, []);

    // Save data to storage
    const saveData = async (newPeriods: Period[], newFlows: DailyFlow[]) => {
        try {
            localStorage.setItem('periods', JSON.stringify(newPeriods));
            localStorage.setItem('dailyFlows', JSON.stringify(newFlows));
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    };

    // Calculate insights
    const insights = React.useMemo(() => {
        if (periods.length < 2) return null;

        const completedPeriods = periods
            .filter(p => p.endDate)
            .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        if (completedPeriods.length < 2) return null;

        // Average cycle length (time between periods)
        let cycleLengths: number[] = [];
        for (let i = 1; i < completedPeriods.length; i++) {
            const daysBetween = Math.round(
                (completedPeriods[i].startDate.getTime() - completedPeriods[i - 1].startDate.getTime())
                / (1000 * 60 * 60 * 24)
            );
            cycleLengths.push(daysBetween);
        }

        const avgCycle = cycleLengths.length > 0
            ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
            : null;

        // Average period length
        const periodLengths = completedPeriods.map(p => {
            const start = new Date(p.startDate);
            const end = new Date(p.endDate!);
            return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        });

        const avgPeriodLength = Math.round(
            periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
        );

        // Predict next period
        const lastPeriod = completedPeriods[completedPeriods.length - 1];
        const nextPredicted = avgCycle
            ? new Date(lastPeriod.startDate.getTime() + avgCycle * 24 * 60 * 60 * 1000)
            : null;

        return {
            avgCycle,
            avgPeriodLength,
            nextPredicted,
            totalPeriods: completedPeriods.length,
        };
    }, [periods, dailyFlows]);

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
    const handleLogFlow = () => {
        const dateStr = today.toISOString().split('T')[0];
        const existingIndex = dailyFlows.findIndex(f => f.date === dateStr);

        let newFlows;
        if (existingIndex >= 0) {
            newFlows = [...dailyFlows];
            newFlows[existingIndex] = { date: dateStr, intensity: flow };
        } else {
            newFlows = [...dailyFlows, { date: dateStr, intensity: flow }];
        }

        setDailyFlows(newFlows);
        saveData(periods, newFlows);

        setFlow(1);
    };

    // Handle period tracking
    const handleSavePeriod = () => {
        if (!dateRange.from) return;

        const periodFlows = dailyFlows.filter(f => {
            const flowDate = new Date(f.date);
            const isAfterStart = flowDate >= dateRange.from!;
            const isBeforeEnd = dateRange.to ? flowDate <= dateRange.to : true;
            return isAfterStart && isBeforeEnd;
        });

        const newPeriod: Period = {
            id: Date.now().toString(),
            startDate: dateRange.from,
            endDate: dateRange.to,
            dailyFlows: periodFlows,
        };

        const newPeriods = [...periods, newPeriod];
        setPeriods(newPeriods);
        saveData(newPeriods, dailyFlows);
        resetPeriodForm();
    };

    const resetPeriodForm = () => {
        setDateRange({ from: undefined, to: undefined });
        setHasEnded(false);
    };

    const deletePeriod = (id: string) => {
        const newPeriods = periods.filter(p => p.id !== id);
        setPeriods(newPeriods);
        saveData(newPeriods, dailyFlows);
    };

    return (
        <div className="min-h-screen">
            <div className="flex w-full max-w-5xl mx-auto flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="text-center space-y-2 pt-8 pb-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-base">
                        Track your cycle with ease & privacy
                    </p>
                </div>

                {/* Insights Card */}
                {insights && (
                    <Card className="bg-white/80 backdrop-blur-sm border-pink-100 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-pink-900">
                                <Sparkles className="h-5 w-5 text-pink-500" />
                                Your Cycle Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-linear-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200 shadow-sm">
                                    <p className="text-xs text-pink-700 mb-1 font-medium">Average Cycle Length</p>
                                    <p className="text-3xl font-bold text-pink-600">{insights.avgCycle}</p>
                                    <p className="text-xs text-pink-600 mt-1">days</p>
                                </div>
                                <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-sm">
                                    <p className="text-xs text-purple-700 mb-1 font-medium">Average Period Length</p>
                                    <p className="text-3xl font-bold text-purple-600">{insights.avgPeriodLength}</p>
                                    <p className="text-xs text-purple-600 mt-1">days</p>
                                </div>
                                <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm">
                                    <p className="text-xs text-blue-700 mb-1 font-medium">Total Periods Tracked</p>
                                    <p className="text-3xl font-bold text-blue-600">{insights.totalPeriods}</p>

                                </div>
                                <div className="bg-linear-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200 shadow-sm">
                                    <p className="text-xs text-indigo-700 mb-1 font-medium">Next Period Prediction</p>
                                    <p className="text-sm font-bold text-indigo-600 mt-2">
                                        {insights.nextPredicted ? formatDate(insights.nextPredicted) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Tabs */}
                <Tabs defaultValue="flow" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
                        <TabsTrigger value="flow" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-900">
                            Daily Flow
                        </TabsTrigger>
                        <TabsTrigger value="periods" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-900">
                            Track Period
                        </TabsTrigger>
                    </TabsList>

                    <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-pink-100 mt-4">
                        <TabsContents>
                            <TabsContent value="flow">
                                <CardContent>
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="text-center py-2">
                                                <p className="text-sm pt-2 text-muted-foreground">
                                                    Logging flow for
                                                </p>
                                                <p className=" text-muted-foreground mt-1">
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
                                                                    ? 'border-pink-400 shadow-md scale-105'
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
                                                className="w-full h-12 bg-linear-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg"
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
                                                    className="border-pink-400 data-[state=checked]:bg-pink-500"
                                                />
                                                <Label htmlFor="has-ended" className="text-sm font-medium cursor-pointer">
                                                    My period has ended
                                                </Label>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="start-date" className="text-sm font-medium">
                                                        Start Date
                                                    </Label>
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

                                                {hasEnded && (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="end-date" className="text-sm font-medium">
                                                            End Date
                                                        </Label>
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
                                                        <span className="font-semibold">Duration:</span> {periodLength} day{periodLength > 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                            )}

                                            <Button
                                                onClick={handleSavePeriod}
                                                disabled={!dateRange.from}
                                                className="w-full h-12 bg-linear-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg mb-4"
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
                <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-pink-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-pink-500" />
                            Cycle Dashboard
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {periods.length === 0 && dailyFlows.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
                                    <CalendarIcon className="h-10 w-10 text-pink-400" />
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
                                    modifiersClassNames={{
                                        period: "ring-2 ring-pink-400 ring-inset font-semibold",
                                        predicted: "ring-2 ring-purple-400 ring-inset ring-dashed",
                                    }}
                                    components={{
                                        Day: (props: any) => {
                                            const { day } = props;
                                            if (!day?.date) return <div />;

                                            const date = day.date;
                                            const dateStr = date.toISOString().split("T")[0];
                                            const flow = dailyFlows.find(f => f.date === dateStr);
                                            const flowState = flow ? FLOW_STATES[flow.intensity] : null;

                                            const isPredicted = insights?.nextPredicted &&
                                                date.toDateString() === insights.nextPredicted.toDateString();

                                            return (
                                                <div className="relative w-full h-full flex items-center justify-center group">
                                                    <div
                                                        className="w-[8vw] h-[8vw] flex items-center justify-center text-xs md:text-sm font-medium transition-all hover:scale-105 cursor-default border border-gray-primary/10 rounded-md"
                                                        style={{
                                                            backgroundColor: flowState ? `${flowState.color}` : undefined,
                                                            color: flowState ? flowState.textColor : undefined,
                                                            border: flowState ? '2px solid rgba(0,0,0,0.4)' : undefined,

                                                        }}
                                                    >
                                                        {date.getDate()}
                                                    </div>

                                                    {/* Tooltip */}
                                                    {(flowState || isPredicted) && (
                                                        <div className="absolute bottom-full mb-2 hidden group-hover:flex bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-10 shadow-lg">
                                                            {flowState ? `${flowState.label} Flow` : 'Predicted Period'}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        },
                                    }}
                                />

                                {/* Legend */}
                                <div className="bg-linear-to-r from-pink-50 to-purple-50 rounded-xl p-6 border-2 border-pink-100">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-2 font-medium">Flow Intensity</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {FLOW_STATES.map((state) => (
                                                    <div key={state.value} className="flex items-center gap-2">
                                                        <div
                                                            className="w-6 h-6 rounded-md border-2 border-gray-200 shadow-sm"
                                                            style={{ backgroundColor: state.color }}
                                                        />
                                                        <span className="text-xs font-medium" style={{ color: state.textColor }}>
                                                            {state.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-2 font-medium">Calendar Markers</p>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-md border-2 border-pink-400 bg-white" />
                                                    <span className="text-xs text-gray-700">Period Days</span>
                                                </div>
                                                {insights?.nextPredicted && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-md border-2 border-dashed border-purple-400 bg-white" />
                                                        <span className="text-xs text-gray-700">Predicted Start</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Period Records */}
                {periods.length > 0 && (
                    <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-pink-100 mb-24">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-pink-500" />
                                Period History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {periods
                                    .slice()
                                    .reverse()
                                    .map((period) => {
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
                                                    className="hover:bg-red-100 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
