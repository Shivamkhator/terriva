import { Period } from "@prisma/client";

export function calculateInsights(periods: Period[]) {
  const completed = periods
    .filter(p => p.endDate)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  if (completed.length < 2) return null;

  // Cycle lengths
  const cycleLengths: number[] = [];
  for (let i = 1; i < completed.length; i++) {
    const diff =
      (completed[i].startDate.getTime() -
        completed[i - 1].startDate.getTime()) /
      (1000 * 60 * 60 * 24);
    cycleLengths.push(Math.round(diff));
  }

  const avgCycleLength = Math.round(
    cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
  );

  // Period lengths
  const periodLengths = completed.map(p =>
    Math.round(
      (p.endDate!.getTime() - p.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );

  const avgPeriodLength = Math.round(
    periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
  );

  const mostRecent = completed[completed.length - 1];
  const nextPeriodDate = new Date(
    mostRecent.startDate.getTime() +
      avgCycleLength * 24 * 60 * 60 * 1000
  );

  return {
    avgCycleLength,
    avgPeriodLength,
    nextPeriodDate,
    totalPeriods: completed.length,
  };
}
