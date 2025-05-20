
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { startRoute } from '../../store/slices/routesSlice';
import { toast } from '@/components/ui/use-toast';
import { Truck, RotateCcw } from 'lucide-react';

const RouteControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const routes = useAppSelector(state => state.routes.routes);
  const activeRouteId = useAppSelector(state => state.routes.activeRouteId);
  
  const traditionalRoute = routes.find(route => route.type === 'traditional');
  const optimizedRoute = routes.find(route => route.type === 'optimized');
  
  // Start a route simulation
  const handleStartRoute = (routeId: string, routeName: string) => {
    dispatch(startRoute(routeId));
    
    toast({
      title: "Route Started",
      description: `${routeName} collection vehicle has been dispatched.`,
    });
  };
  
  // Check if we can start routes
  const canStartTraditional = traditionalRoute && !traditionalRoute.inProgress && !activeRouteId;
  const canStartOptimized = optimizedRoute && !optimizedRoute.inProgress && !activeRouteId;
  
  // Return early if no routes have been generated
  if (routes.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            No routes available. Generate routes first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Route Execution</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 p-4">
        {/* Traditional Route */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Traditional Route</h3>
            <div className="text-xs text-muted-foreground">
              {traditionalRoute?.metrics.binsCollected} bins • {traditionalRoute?.metrics.totalDistance.toFixed(1)} km
            </div>
          </div>
          
          <Button
            size="sm"
            variant={traditionalRoute?.inProgress ? "secondary" : "default"}
            className="w-full"
            onClick={() => handleStartRoute(traditionalRoute!.id, traditionalRoute!.name)}
            disabled={!canStartTraditional}
          >
            <Truck className="mr-2 h-4 w-4" />
            {traditionalRoute?.inProgress ? "In Progress..." : "Start Route"}
          </Button>
        </div>
        
        {/* Optimized Route */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Smart Optimized Route</h3>
            <div className="text-xs text-muted-foreground">
              {optimizedRoute?.metrics.binsCollected} bins • {optimizedRoute?.metrics.totalDistance.toFixed(1)} km
            </div>
          </div>
          
          <Button
            size="sm"
            variant={optimizedRoute?.inProgress ? "secondary" : "outline"}
            className="w-full"
            onClick={() => handleStartRoute(optimizedRoute!.id, optimizedRoute!.name)}
            disabled={!canStartOptimized}
          >
            <Truck className="mr-2 h-4 w-4" />
            {optimizedRoute?.inProgress ? "In Progress..." : "Start Route"}
          </Button>
        </div>
        
        {/* Route comparison highlight */}
        {traditionalRoute && optimizedRoute && (
          <div className="bg-muted rounded-md p-2 text-sm">
            <p className="text-center">
              Smart route saves{' '}
              <span className="font-medium text-green-600">
                {(traditionalRoute.metrics.totalDistance - optimizedRoute.metrics.totalDistance).toFixed(1)} km
              </span>
              {' '}and{' '}
              <span className="font-medium text-green-600">
                {Math.floor(traditionalRoute.metrics.estimatedDuration - optimizedRoute.metrics.estimatedDuration)} min
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteControls;
