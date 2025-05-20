
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppSelector } from '../../hooks/useAppSelector';
import FileLevelChart from './FillLevelChart';
import RouteComparisonChart from './RouteComparisonChart';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CircleAlert, Truck, CircleCheck } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const bins = useAppSelector(state => state.bins.bins);
  const routeComparison = useAppSelector(state => state.routes.routeComparison);
  
  // Calculate key metrics
  const averageFillLevel = bins.reduce((sum, bin) => sum + bin.fillLevel, 0) / bins.length;
  const criticalBins = bins.filter(bin => bin.fillLevel > 75);
  const binsByFillLevel = {
    low: bins.filter(bin => bin.fillLevel < 50).length,
    medium: bins.filter(bin => bin.fillLevel >= 50 && bin.fillLevel < 75).length,
    high: bins.filter(bin => bin.fillLevel >= 75 && bin.fillLevel < 90).length,
    critical: bins.filter(bin => bin.fillLevel >= 90).length,
  };
  
  // Calculate savings (if route comparison data is available)
  const savings = {
    distance: 0,
    fuel: 0,
    co2: 0,
    time: 0,
  };
  
  if (routeComparison.traditionalMetrics && routeComparison.optimizedMetrics) {
    const { traditionalMetrics, optimizedMetrics } = routeComparison;
    savings.distance = traditionalMetrics.totalDistance - optimizedMetrics.totalDistance;
    savings.fuel = traditionalMetrics.fuelConsumption - optimizedMetrics.fuelConsumption;
    savings.co2 = traditionalMetrics.co2Emissions - optimizedMetrics.co2Emissions;
    savings.time = traditionalMetrics.estimatedDuration - optimizedMetrics.estimatedDuration;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {/* Summary Card */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Current waste collection system status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center p-4 bg-background rounded-lg shadow">
              <div className="rounded-full p-2 bg-blue-100">
                <CircleCheck className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Average Fill Level</p>
                <p className="text-2xl font-semibold">{averageFillLevel.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-background rounded-lg shadow">
              <div className="rounded-full p-2 bg-amber-100">
                <CircleAlert className="h-6 w-6 text-amber-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Critical Bins</p>
                <p className="text-2xl font-semibold">{criticalBins.length}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-background rounded-lg shadow">
              <div className="rounded-full p-2 bg-green-100">
                <Truck className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Distance Saved</p>
                <p className="text-2xl font-semibold">
                  {savings.distance.toFixed(1)} km
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-background rounded-lg shadow">
              <div className="rounded-full p-2 bg-purple-100">
                <Truck className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">CO₂ Reduction</p>
                <p className="text-2xl font-semibold">
                  {savings.co2.toFixed(1)} kg
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fill Level Distribution */}
      <Card className="col-span-1 md:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle>Fill Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <FileLevelChart bins={bins} />
        </CardContent>
      </Card>

      {/* Route Comparison */}
      <Card className="col-span-1 md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Route Comparison</CardTitle>
          <CardDescription>Traditional vs. Smart Routes</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <RouteComparisonChart 
            traditionalMetrics={routeComparison.traditionalMetrics} 
            optimizedMetrics={routeComparison.optimizedMetrics}
          />
        </CardContent>
      </Card>

      {/* Estimated Savings */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Estimated Savings</CardTitle>
          <CardDescription>Smart waste management benefits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Distance Reduction</p>
              <p className="text-2xl font-bold mb-1">{savings.distance.toFixed(1)} km</p>
              <p className="text-xs text-muted-foreground">
                {((savings.distance / (routeComparison.traditionalMetrics?.totalDistance || 1)) * 100).toFixed(1)}% less travel distance
              </p>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Fuel Savings</p>
              <p className="text-2xl font-bold mb-1">{savings.fuel.toFixed(1)} L</p>
              <p className="text-xs text-muted-foreground">
                Approx. ${(savings.fuel * 1.5).toFixed(2)} cost reduction
              </p>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium mb-1">CO₂ Emission Reduction</p>
              <p className="text-2xl font-bold mb-1">{savings.co2.toFixed(1)} kg</p>
              <p className="text-xs text-muted-foreground">
                Equivalent to planting {Math.floor(savings.co2 / 20)} trees
              </p>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Time Saved</p>
              <p className="text-2xl font-bold mb-1">{Math.floor(savings.time)} min</p>
              <p className="text-xs text-muted-foreground">
                {((savings.time / (routeComparison.traditionalMetrics?.estimatedDuration || 1)) * 100).toFixed(1)}% reduction in collection time
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Alert>
            <CircleAlert className="h-4 w-4" />
            <AlertTitle>Optimization Impact</AlertTitle>
            <AlertDescription>
              Smart waste management could reduce operational costs by up to 30% annually while decreasing carbon emissions.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
