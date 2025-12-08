"use client";
import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
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

export default function Home() {
  const [openStart, setOpenStart] = React.useState(false);
  const [openEnd, setOpenEnd] = React.useState(false);
  const [hasEnded, setHasEnded] = React.useState(false);

  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  });

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

  // day after start
  const middleFrom = new Date(from);
  middleFrom.setDate(middleFrom.getDate() + 1);

  // day before end
  const middleTo = new Date(to);
  middleTo.setDate(middleTo.getDate() - 1);

  return {
    range_start: from,
    range_end: to,
    range_middle:
      middleFrom <= middleTo ? { from: middleFrom, to: middleTo } : undefined,
  };
}, [dateRange]);


  const today = React.useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground font-sans">
      <main className="flex flex-col items-center gap-6 py-32 px-6 w-full max-w-3xl">
        <div className="flex flex-col items-center justify-center gap-4 w-full max-w-sm">
          <Label className="px-1">Period dates</Label>

          <div className="flex items-center gap-2 px-1">
            <Checkbox
              id="has-ended"
              checked={hasEnded}
              onCheckedChange={(checked) => {
                const value = checked === true;
                setHasEnded(value);
                if (!value) {
                  // If period hasn't ended, clear end date
                  setDateRange((prev) => ({ from: prev.from, to: undefined }));
                }
              }}
            />
            <Label
              htmlFor="has-ended"
              className="text-sm font-normal cursor-pointer"
            >
              Has the period ended?
            </Label>
          </div>

          {/* Start date field */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="start-date" className="px-1 text-xs">
              Start date
            </Label>

            <Popover open={openStart} onOpenChange={setOpenStart}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="start-date"
                  className="w-[16rem] justify-between font-normal"
                >
                  <span className="text-sm">{startDate}</span>
                  <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-[16rem] overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  defaultMonth={dateRange.from ?? today}
                  captionLayout="dropdown"
                  className="rounded-lg border shadow-sm w-[16rem]"
                  modifiers={modifiers}
                  disabled={(date) => {
                    // No future dates for start
                    const d = new Date(date);
                    d.setHours(0, 0, 0, 0);
                    return d > today;
                  }}
                  onSelect={(date) => {
                    setDateRange((prev) => {
                      if (!date) {
                        return {
                          from: undefined,
                          to: hasEnded ? prev.to : undefined,
                        };
                      }

                      const d = new Date(date);
                      d.setHours(0, 0, 0, 0);

                      const safeTo =
                        prev.to && prev.to < d ? undefined : prev.to;

                      return {
                        from: d,
                        to: hasEnded ? safeTo : undefined,
                      };
                    });
                    if (date) setOpenStart(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End date field */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="end-date" className="px-1 text-xs">
              End date
            </Label>

            <Popover open={openEnd && hasEnded} onOpenChange={setOpenEnd}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="end-date"
                  className="w-[16rem] justify-between font-normal"
                  disabled={!hasEnded}
                >
                  <span className="text-sm">
                    {hasEnded
                      ? endDate
                      : "Select after ticking the checkbox"}
                  </span>
                  <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
                </Button>
              </PopoverTrigger>

            {hasEnded && (
              <PopoverContent
                className="w-[16rem] overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  defaultMonth={dateRange.to ?? dateRange.from ?? today}
                  captionLayout="dropdown"
                  className="rounded-lg border shadow-sm w-[16rem]"
                  modifiers={modifiers}
                  disabled={(date) => {
                    const d = new Date(date);
                    d.setHours(0, 0, 0, 0);

                    const isBeforeStart = dateRange.from
                      ? d < dateRange.from
                      : false;
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
                      return {
                        from: prev.from,
                        to: d,
                      };
                    });
                    if (date) setOpenEnd(false);
                  }}
                />
              </PopoverContent>
            )}
            </Popover>
          </div>

          {/* Period length helper */}
          {periodLength && dateRange.from && dateRange.to && (
            <p className="px-1 text-xs text-muted-foreground">
              Period length: {periodLength} day{periodLength > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
