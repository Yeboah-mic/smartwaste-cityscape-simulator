
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { RouteMetrics } from '../../store/slices/routesSlice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RouteComparisonChartProps {
  traditionalMetrics: RouteMetrics | null;
  optimizedMetrics: RouteMetrics | null;
}

const RouteComparisonChart: React.FC<RouteComparisonChartProps> = ({ 
  traditionalMetrics, 
  optimizedMetrics 
}) => {
  // Prepare data for the chart
  const hasData = traditionalMetrics && optimizedMetrics;
  
  const labels = ['Distance (km)', 'Duration (min)', 'Fuel (L)', 'CO₂ Emissions (kg)'];
  
  const traditionalData = hasData ? [
    traditionalMetrics.totalDistance,
    traditionalMetrics.estimatedDuration,
    traditionalMetrics.fuelConsumption,
    traditionalMetrics.co2Emissions
  ] : [0, 0, 0, 0];
  
  const optimizedData = hasData ? [
    optimizedMetrics.totalDistance,
    optimizedMetrics.estimatedDuration,
    optimizedMetrics.fuelConsumption,
    optimizedMetrics.co2Emissions
  ] : [0, 0, 0, 0];
  
  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Traditional Route',
        data: traditionalData,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Smart Optimized Route',
        data: optimizedData,
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1);
              
              // Add units based on the metric
              if (context.dataIndex === 0) {
                label += ' km';
              } else if (context.dataIndex === 1) {
                label += ' min';
              } else if (context.dataIndex === 2) {
                label += ' L';
              } else if (context.dataIndex === 3) {
                label += ' kg';
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-full w-full">
      {hasData ? (
        <Bar data={data} options={options} />
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">No route data available. Generate routes to see comparison.</p>
        </div>
      )}
    </div>
  );
};

export default RouteComparisonChart;
