'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

type MonthlyFlowData = {
  month: string;
  light: number;
  medium: number;
  heavy: number;
};

interface Props {
  data: MonthlyFlowData[];
}

export default function FlowChart({ data }: Props) {

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[40svh]">
        <svg
          className="w-12 h-12 text-gray-400 mb-3"
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
        <p className="text-gray-500">No flow data available.</p>
      </div>
    );
  }

  const labels = data.map(item => {
    const date = new Date(item.month + '-01');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Light',
        data: data.map(d => d.light),
        backgroundColor: '#FBCFE8', // soft pink
        borderRadius: 6,
        stack: 'flow',
      },
      {
        label: 'Medium',
        data: data.map(d => d.medium),
        backgroundColor: '#F472B6', // rose
        borderRadius: 6,
        stack: 'flow',
      },
      {
        label: 'Heavy',
        data: data.map(d => d.heavy),
        backgroundColor: '#BE185D', // deep pink
        borderRadius: 6,
        stack: 'flow',
      },
    ],
  };

const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,

  animation: {
    duration: 1200,
    easing: 'easeOutQuart',
    delay: (context) => {
      // stagger bars nicely
      return context.dataIndex * 120 + context.datasetIndex * 80;
    },
  },

  transitions: {
    active: {
      animation: {
        duration: 300,
        easing: 'easeOutCubic',
      },
    },
  },

  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        font: {
          size: 13,
          weight: 'bold',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.85)',
      padding: 12,
      animation: {
        duration: 200,
        easing: 'easeOutCubic',
      },
      callbacks: {
        label: ctx =>
          `${ctx.dataset.label}: ${ctx.parsed.y} days`,
      },
    },
  },

  scales: {
    x: {
      stacked: true,
      grid: {
        display: false,
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
      grid: {
        color: 'rgba(0,0,0,0.05)',
      },
    },
  },
};


  return (
      <div className="relative h-[40svh]">
        <Bar data={chartData} options={options} />
      </div>
  );
}
