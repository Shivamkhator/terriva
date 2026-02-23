export type CyclePeriod = {
  startDate: Date;
  endDate?: Date | null;
};

export function calculateInsights(periods: CyclePeriod[]) {
  if (periods.length < 2) return null;

  const sorted = periods
    .slice()
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // ---------- Cycle Lengths (start → start) ----------
  const cycleLengths: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const diff =
      (sorted[i].startDate.getTime() - sorted[i - 1].startDate.getTime()) /
      (1000 * 60 * 60 * 24);

    cycleLengths.push(Math.round(diff));
  }

  const avgCycleLength =
    cycleLengths.length > 0
      ? Math.round(
          cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length,
        )
      : null;

  // ---------- Period Lengths (completed only) ----------
  const completed = sorted.filter((p) => p.endDate);

  const periodLengths = completed.map(
    (p) =>
      Math.round(
        (p.endDate!.getTime() - p.startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1,
  );

  const avgPeriodLength =
    periodLengths.length > 0
      ? Math.round(
          periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length,
        )
      : null;

  // ---------- Most Recent Period ----------
  const mostRecent = sorted[sorted.length - 1];

  // ---------- Next Period Prediction ----------
  const nextPeriodDate =
    avgCycleLength !== null
      ? new Date(
          mostRecent.startDate.getTime() + avgCycleLength * 24 * 60 * 60 * 1000,
        )
      : null;

  return {
    avgCycleLength,
    avgPeriodLength,
    nextPeriodDate,
    totalPeriods: sorted.length,
  };
}

// LAST PERIOD (most recent by start date)

export function getLastPeriod(periods: CyclePeriod[]): CyclePeriod | null {
  if (!periods.length) return null;

  return periods.reduce((latest, p) =>
    p.startDate > latest.startDate ? p : latest,
  );
}

// AVERAGE PERIOD LENGTH (start → end)
export function getAveragePeriodLength(periods: CyclePeriod[]): number | null {
  const completed = periods.filter((p) => p.endDate);

  if (!completed.length) return null;

  const lengths = completed.map(
    (p) =>
      Math.round(
        (p.endDate!.getTime() - p.startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1,
  );

  return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
}


// AVERAGE CYCLE LENGTH (start → next start)
export function getAverageCycleLength(periods: CyclePeriod[]): number | null {
  if (periods.length < 2) return null;

  const sorted = periods
    .slice()
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const cycles: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const diff =
      (sorted[i].startDate.getTime() - sorted[i - 1].startDate.getTime()) /
      (1000 * 60 * 60 * 24);

    cycles.push(Math.round(diff));
  }

  return Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
}

// NEXT PERIOD DATE
export function getNextPeriodDate(
  periods: CyclePeriod[],
  avgCycleLength: number | null,
): Date | null {
  if (!periods.length || avgCycleLength === null) return null;

  const last = getLastPeriod(periods);
  if (!last) return null;

  const next = new Date(last.startDate);
  next.setDate(next.getDate() + avgCycleLength);

  return next;
}

// DAYS UNTIL NEXT PERIOD 
export function getDaysUntilNextPeriod(
  nextPeriodDate: Date | null,
): number | null {
  if (!nextPeriodDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.floor(
    (nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}
