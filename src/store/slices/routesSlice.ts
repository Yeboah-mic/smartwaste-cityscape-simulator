import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { WasteBin } from './binsSlice';

export interface RoutePoint {
  id: string;
  location: [number, number];
  binId?: string;
  isDepot?: boolean;
}

export interface RouteVehicle {
  id: string;
  currentPosition: [number, number];
  currentRouteIndex: number;
  capacity: number;
  currentLoad: number;
  speed: number; // km/h
  status: 'idle' | 'en-route' | 'collecting' | 'returning';
}

export interface RouteMetrics {
  totalDistance: number; // km
  estimatedDuration: number; // minutes
  fuelConsumption: number; // liters
  co2Emissions: number; // kg
  binsCollected: number;
  totalWasteCollected: number; // liters
}

export interface Route {
  id: string;
  name: string;
  points: RoutePoint[];
  vehicle: RouteVehicle;
  metrics: RouteMetrics;
  type: 'traditional' | 'optimized';
  completed: boolean;
  inProgress: boolean;
}

interface RoutesState {
  routes: Route[];
  activeRouteId: string | null;
  routeComparison: {
    traditionalMetrics: RouteMetrics | null;
    optimizedMetrics: RouteMetrics | null;
  };
}

// Utility function to calculate rough distance in km between two points
const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
  const R = 6371; // Earth's radius in km
  const lat1 = point1[0] * Math.PI / 180;
  const lat2 = point2[0] * Math.PI / 180;
  const dLat = (point2[0] - point1[0]) * Math.PI / 180;
  const dLon = (point2[1] - point1[1]) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1) * Math.cos(lat2) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const initialState: RoutesState = {
  routes: [],
  activeRouteId: null,
  routeComparison: {
    traditionalMetrics: null,
    optimizedMetrics: null,
  },
};

export const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    generateRoutes: (state, action: PayloadAction<{ bins: WasteBin[], depot: [number, number] }>) => {
      const { bins, depot } = action.payload;
      
      // Clear existing routes
      state.routes = [];
      
      // Only consider bins that are at least 50% full for collection
      const binsNeedingCollection = bins.filter(bin => bin.fillLevel >= 50);
      
      if (binsNeedingCollection.length === 0) {
        return;
      }
      
      // Generate traditional route (fixed sequence based on bin IDs)
      const traditionalBins = [...binsNeedingCollection].sort((a, b) => a.id.localeCompare(b.id));
      const traditionalRoutePoints: RoutePoint[] = [
        { id: 'depot-start', location: depot, isDepot: true }
      ];
      
      let traditionalDistance = 0;
      let lastPoint = depot;
      
      // Add all bins to the traditional route
      traditionalBins.forEach(bin => {
        traditionalRoutePoints.push({
          id: `route-point-${bin.id}`,
          location: bin.location,
          binId: bin.id
        });
        
        // Calculate distance from last point
        traditionalDistance += calculateDistance(lastPoint, bin.location);
        lastPoint = bin.location;
      });
      
      // Return to depot
      traditionalRoutePoints.push({ id: 'depot-end', location: depot, isDepot: true });
      traditionalDistance += calculateDistance(lastPoint, depot);
      
      // Calculate metrics for traditional route
      const traditionalMetrics: RouteMetrics = {
        totalDistance: traditionalDistance,
        estimatedDuration: traditionalDistance / 25 * 60, // Assuming 25 km/h avg speed, convert to minutes
        fuelConsumption: traditionalDistance * 0.3, // Assuming 0.3L/km
        co2Emissions: traditionalDistance * 2.68, // kg CO2 per liter diesel * fuel consumption
        binsCollected: traditionalBins.length,
        totalWasteCollected: traditionalBins.reduce((sum, bin) => sum + (bin.capacity * bin.fillLevel / 100), 0)
      };
      
      // Generate optimized route (nearest neighbor algorithm)
      const optimizedRoutePoints: RoutePoint[] = [
        { id: 'depot-start', location: depot, isDepot: true }
      ];
      
      let optimizedDistance = 0;
      let remainingBins = [...binsNeedingCollection];
      let currentPoint = depot;
      
      // Build route by always going to the nearest bin next
      while (remainingBins.length > 0) {
        // Find nearest bin to current position
        let minDistance = Infinity;
        let nearestBinIndex = -1;
        
        remainingBins.forEach((bin, index) => {
          const distance = calculateDistance(currentPoint, bin.location);
          if (distance < minDistance) {
            minDistance = distance;
            nearestBinIndex = index;
          }
        });
        
        // Add nearest bin to route
        const nearestBin = remainingBins[nearestBinIndex];
        optimizedRoutePoints.push({
          id: `route-point-${nearestBin.id}`,
          location: nearestBin.location,
          binId: nearestBin.id
        });
        
        // Update metrics
        optimizedDistance += minDistance;
        currentPoint = nearestBin.location;
        
        // Remove bin from remaining bins
        remainingBins.splice(nearestBinIndex, 1);
      }
      
      // Return to depot
      optimizedRoutePoints.push({ id: 'depot-end', location: depot, isDepot: true });
      optimizedDistance += calculateDistance(currentPoint, depot);
      
      // Calculate metrics for optimized route
      const optimizedMetrics: RouteMetrics = {
        totalDistance: optimizedDistance,
        estimatedDuration: optimizedDistance / 25 * 60, // Assuming 25 km/h avg speed, convert to minutes
        fuelConsumption: optimizedDistance * 0.3, // Assuming 0.3L/km
        co2Emissions: optimizedDistance * 2.68, // kg CO2 per liter diesel * fuel consumption
        binsCollected: binsNeedingCollection.length,
        totalWasteCollected: binsNeedingCollection.reduce((sum, bin) => sum + (bin.capacity * bin.fillLevel / 100), 0)
      };
      
      // Create the route objects
      const traditionalRoute: Route = {
        id: 'traditional-route',
        name: 'Traditional Fixed Route',
        points: traditionalRoutePoints,
        vehicle: {
          id: 'vehicle-traditional',
          currentPosition: depot,
          currentRouteIndex: 0,
          capacity: 5000, // 5000 liters
          currentLoad: 0,
          speed: 25, // 25 km/h
          status: 'idle'
        },
        metrics: traditionalMetrics,
        type: 'traditional',
        completed: false,
        inProgress: false
      };
      
      const optimizedRoute: Route = {
        id: 'optimized-route',
        name: 'Smart Optimized Route',
        points: optimizedRoutePoints,
        vehicle: {
          id: 'vehicle-optimized',
          currentPosition: depot,
          currentRouteIndex: 0,
          capacity: 5000, // 5000 liters
          currentLoad: 0,
          speed: 25, // 25 km/h
          status: 'idle'
        },
        metrics: optimizedMetrics,
        type: 'optimized',
        completed: false,
        inProgress: false
      };
      
      // Add routes to state
      state.routes = [traditionalRoute, optimizedRoute];
      
      // Update route comparison metrics
      state.routeComparison = {
        traditionalMetrics,
        optimizedMetrics
      };
    },
    
    startRoute: (state, action: PayloadAction<string>) => {
      const routeId = action.payload;
      const route = state.routes.find(r => r.id === routeId);
      
      if (route) {
        route.inProgress = true;
        route.vehicle.status = 'en-route';
        state.activeRouteId = routeId;
      }
    },
    
    updateRouteProgress: (state, action: PayloadAction<{ routeId: string, progress: number }>) => {
      const { routeId, progress } = action.payload;
      const route = state.routes.find(r => r.id === routeId);
      
      if (route && route.inProgress) {
        const totalPoints = route.points.length;
        const exactIndex = progress * (totalPoints - 1);
        const currentIndex = Math.floor(exactIndex);
        const fraction = exactIndex - currentIndex;
        
        if (currentIndex >= totalPoints - 1) {
          // Route is complete
          route.vehicle.currentPosition = route.points[totalPoints - 1].location;
          route.vehicle.currentRouteIndex = totalPoints - 1;
          route.completed = true;
          route.inProgress = false;
          route.vehicle.status = 'idle';
          state.activeRouteId = null;
        } else {
          // Interpolate position between current and next point
          const currentPoint = route.points[currentIndex].location;
          const nextPoint = route.points[currentIndex + 1].location;
          
          const lat = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * fraction;
          const lng = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * fraction;
          
          route.vehicle.currentPosition = [lat, lng];
          route.vehicle.currentRouteIndex = currentIndex;
          
          // If very close to a bin point, mark as collecting
          if (fraction > 0.9 && route.points[currentIndex + 1].binId) {
            route.vehicle.status = 'collecting';
          } else {
            route.vehicle.status = 'en-route';
          }
        }
      }
    },
    
    resetRoutes: (state) => {
      state.routes = [];
      state.activeRouteId = null;
      state.routeComparison = {
        traditionalMetrics: null,
        optimizedMetrics: null,
      };
    },
    
    emptyBin: (state, action: PayloadAction<string>) => {
      // This action is needed for SimulationEngine
      // It will be handled in the bins reducer, but we need to export it here for SimulationEngine
      // Implementation is in binsSlice.ts
    }
  }
});

export const {
  generateRoutes,
  startRoute,
  updateRouteProgress,
  resetRoutes,
  emptyBin,  // Add the export for emptyBin
} = routesSlice.actions;

export default routesSlice.reducer;
