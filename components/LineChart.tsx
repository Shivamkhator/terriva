'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type PeriodData = {
  month: string;
  cycleDays: number;
};

interface Props {
  data: PeriodData[];
}

export default function LineChart({ data }: Props) {
  const labels = data.map(item => {
    const date = new Date(item.month + '-01');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  });

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[40vh]">
        <svg
          className="w-12 h-12 text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {/* Axes */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 19V5M4 19H20"
          />

          {/* Line chart */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6 15l4-4 4 3 4-6"
          />

          {/* Data points */}
          <circle cx="6" cy="15" r="0.75" fill="currentColor" />
          <circle cx="10" cy="11" r="0.75" fill="currentColor" />
          <circle cx="14" cy="14" r="0.75" fill="currentColor" />
          <circle cx="18" cy="8" r="0.75" fill="currentColor" />
        </svg>

        <p className="text-gray-500">No period data available.</p>
      </div>
    );
  }

  const values = data.map(d => d.cycleDays);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Period Duration (Days)',
        data: values,
        borderColor: '#EC4899',
        backgroundColor: 'rgba(236,72,153,0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,

    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
    },

    animations: {
      x: {
        type: 'number',
        easing: 'easeOutQuart',
        duration: 1200,
        from: NaN,
        delay(ctx) {
          if (ctx.type !== 'data' || (ctx as any).xStarted) return 0;
          (ctx as any).xStarted = true;
          return (ctx.dataIndex ?? 0) * 120;
        },
      },
      y: {
        type: 'number',
        easing: 'easeOutQuart',
        duration: 1200,
        from: (ctx) => {
          return ctx.chart.scales.y.getPixelForValue(0);
        },
        delay(ctx) {
          if (ctx.type !== 'data' || (ctx as any).yStarted) return 0;
          (ctx as any).yStarted = true;
          return (ctx.dataIndex ?? 0) * 120;
        },
      },
    },

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        padding: 10,
        animation: {
          duration: 200,
          easing: 'easeOutCubic',
        },
        callbacks: {
          label: ctx => `${ctx.parsed.y} days`,
        },
      },
    },

    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 8,
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0,0,0,0.06)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Calculate average for insight
  const avgDuration = values.length > 0
    ? (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)
    : 0;

  return (
    <div className="relative h-[40vh] ">
      <Line data={chartData} options={options} />
    </div>
  );
}