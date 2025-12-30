"use client";
import React, { useState } from 'react';
import { cn } from "@/lib/utils"

interface AnimatedCircularProgressBarProps {
  max?: number
  min?: number
  value: number
  gaugePrimaryColor: string
  gaugeSecondaryColor: string
  className?: string
  children?: React.ReactNode
}

function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  className,
  children,
}: AnimatedCircularProgressBarProps) {
  const circumference = 2 * Math.PI * 45
  const percentPx = circumference / 100
  const currentPercent = Math.round(((value - min) / (max - min)) * 100)

  return (
    <div
      className={cn("relative size-32 text-lg font-semibold", className)}
      style={
        {
          "--circle-size": "100px",
          "--circumference": circumference,
          "--percent-to-px": `${percentPx}px`,
          "--gap-percent": "5",
          "--offset-factor": "0",
          "--transition-length": "1s",
          "--transition-step": "200ms",
          "--delay": "0s",
          "--percent-to-deg": "3.6deg",
          transform: "translateZ(0)",
        } as React.CSSProperties
      }
    >
      <svg
        fill="none"
        className="size-full"
        strokeWidth="1"
        viewBox="0 0 100 100"
      >
        {currentPercent >= 0 && (
          <circle
            cx="50"
            cy="50"
            r="45"
            strokeWidth="4"
            strokeDashoffset="0"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-100"
            style={
              {
                stroke: gaugeSecondaryColor,
                "--stroke-percent": 90 - currentPercent,
                "--offset-factor-secondary": "calc(1 - var(--offset-factor))",
                strokeDasharray:
                  "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",
                transform:
                  "rotate(calc(1turn - 90deg - (var(--gap-percent) * var(--percent-to-deg) * var(--offset-factor-secondary)))) scaleY(-1)",
                transition: "all var(--transition-length) ease var(--delay)",
                transformOrigin:
                  "calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)",
              } as React.CSSProperties
            }
          />
        )}
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="5"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-100"
          style={
            {
              stroke: gaugePrimaryColor,
              "--stroke-percent": currentPercent,
              strokeDasharray:
                "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",
              transition:
                "var(--transition-length) ease var(--delay),stroke var(--transition-length) ease var(--delay)",
              transitionProperty: "stroke-dasharray,transform",
              transform:
                "rotate(calc(-90deg + var(--gap-percent) * var(--offset-factor) * var(--percent-to-deg)))",
              transformOrigin:
                "calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)",
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}



export default function CircularProgressBar({ currentDay, periodLength, cycleLength }: {
  currentDay: number; periodLength: number; cycleLength: number;
}) {

  const mensesEnd = periodLength;
  const ovulationDay = cycleLength - 14;
  const ovulationStart = ovulationDay - 1;
  const ovulationEnd = ovulationDay + 1;
  const follicularLength = Math.max(ovulationStart - mensesEnd, 0);


  const cyclePhases = [
    { name: "Menses", days: Array.from({ length: periodLength }, (_, i) => i + 1), color: "rgb(239 68 68)" },
    { name: "Follicular", days: Array.from({ length: follicularLength}, (_, i) => i + 1 + mensesEnd), color: "rgb(236 72 153)" },
    { name: "Ovulation", days: [ovulationStart, ovulationDay, ovulationEnd], color: "rgb(168 85 247)" },
    { name: "Luteal", days: Array.from({ length: cycleLength - ovulationEnd }, (_, i) => i + 1 + ovulationEnd), color: "rgb(79 70 229)" },
  ];

  function getPhaseInfo(day: number) {
    const phase = cyclePhases.find(p => p.days.includes(day));
    return phase || cyclePhases[0];
  }

  const cycleDay = currentDay <= cycleLength ? currentDay : cycleLength;
  const daysLate = currentDay > cycleLength ? currentDay - cycleLength : 0;
  const phaseInfo = getPhaseInfo(cycleDay);
  const isLate = currentDay > cycleLength;

  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full">

        <div className="flex justify-center mb-8">
          <AnimatedCircularProgressBar
            max={cycleLength}
            value={cycleDay}
            gaugePrimaryColor={isLate ? "rgb(239 68 68)" : phaseInfo.color}
            gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
            className="size-50"
          >
            <div className="text-center">
              {isLate ? (
                <>
                  <div className="text-sm font-bold text-red-500">
                    Expected Period
                  </div>
                  <div className="text-4xl font-bold text-gray-800 mt-2">
                    Day {daysLate}
                  </div>
                </>
              ) : (
                <>

                  <div className="text-lg font-medium mt-2" style={{ color: phaseInfo.color }}>
                    {phaseInfo.name} Phase
                  </div>
                  <div className="text-4xl font-bold text-gray-800">
                    Day {currentDay}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    of {cycleLength} days
                  </div>
                </>
              )}
            </div>
          </AnimatedCircularProgressBar>
        </div>

      </div>
    </div>
  );
}