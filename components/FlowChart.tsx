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
      <div className="relative h-[40vh]">
        <Bar data={chartData} options={options} />
      </div>
  );
}
