
import React from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { WasteBin } from '../../store/slices/binsSlice';

ChartJS.register(ArcElement, Tooltip, Legend);

interface FillLevelChartProps {
  bins: WasteBin[];
}

const FileLevelChart: React.FC<FillLevelChartProps> = ({ bins }) => {
  // Calculate bin counts by fill level category
  const lowBins = bins.filter(bin => bin.fillLevel < 50).length;
  const mediumBins = bins.filter(bin => bin.fillLevel >= 50 && bin.fillLevel < 75).length;
  const highBins = bins.filter(bin => bin.fillLevel >= 75 && bin.fillLevel < 90).length;
  const criticalBins = bins.filter(bin => bin.fillLevel >= 90).length;

  const data: ChartData<'doughnut'> = {
    labels: ['Low (<50%)', 'Medium (50-75%)', 'High (75-90%)', 'Critical (>90%)'],
    datasets: [
      {
        data: [lowBins, mediumBins, highBins, criticalBins],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)', // Green for low
          'rgba(255, 206, 86, 0.7)',  // Yellow for medium
          'rgba(255, 159, 64, 0.7)',  // Orange for high
          'rgba(255, 99, 132, 0.7)',  // Red for critical
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.formattedValue;
            const total = context.dataset.data.reduce((acc: number, data: number) => acc + data, 0);
            const percentage = Math.round((context.raw as number) / total * 100);
            return `${label}: ${value} bins (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };

  return (
    <div className="h-[300px] relative">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-2xl font-bold">{bins.length}</span>
        <span className="text-sm text-muted-foreground">Total Bins</span>
      </div>
    </div>
  );
};

export default FileLevelChart;
