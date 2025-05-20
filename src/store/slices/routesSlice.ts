
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define route point type
export interface RoutePoint {
  location: [number, number]; // [lat, lng]
  binId?: string; // Optional bin ID if this point has a bin
}

// Define metrics type for routes
export interface RouteMetrics {
  totalDistance: number; // kilometers
  estimatedDuration: number; // minutes
  binsCollected: number; // count
  fuelConsumption: number; // liters
  co2Emissions: number; // kg
}

// Define route type
export interface Route {
  id: string;
  name: string;
  type: 'traditional' | 'optimized';
  points: RoutePoint[];
  inProgress: boolean;
  completed: boolean;
  progress: number; // 0-1 for animation
  metrics: RouteMetrics;
}

// Define the state type
interface RoutesState {
  routes: Route[];
  activeRouteId: string | null;
  traditionalMetrics: RouteMetrics | null;
  optimizedMetrics: RouteMetrics | null;
}

// Initial state
const initialState: RoutesState = {
  routes: [],
  activeRouteId: null,
  traditionalMetrics: null,
  optimizedMetrics: null,
};

// Helper to calculate route metrics
const calculateRouteMetrics = (points: RoutePoint[]) => {
  // In a real app, we'd do proper distance calculations
  // For demo purposes, we'll use simplified calculations
  let distance = 0;
  const binsCount = points.filter(p => p.binId).length;
  
  // Calculate rough distance
  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currPoint = points[i];
    // Very simplified distance calculation (not accurate)
    distance += Math.sqrt(
      Math.pow(currPoint.location[0] - prevPoint.location[0], 2) +
      Math.pow(currPoint.location[1] - prevPoint.location[1], 2)
    ) * 111; // Rough conversion to km
  }
  
  // Estimate duration (assume 30 km/h average speed + 2 min per bin)
  const drivingMinutes = (distance / 30) * 60;
  const collectionMinutes = binsCount * 2;
  
  // Calculate fuel consumption and CO2 emissions
  const fuelConsumption = distance * 0.3; // 0.3L per km
  const co2Emissions = fuelConsumption * 2.68; // 2.68kg CO2 per liter of diesel
  
  return {
    totalDistance: distance,
    estimatedDuration: drivingMinutes + collectionMinutes,
    binsCollected: binsCount,
    fuelConsumption: fuelConsumption,
    co2Emissions: co2Emissions
  };
};

// Create slice
export const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    // Generate routes based on bin data
    generateRoutes: (state, action: PayloadAction<{ 
      bins: any[]; 
      depot: [number, number]; 
    }>) => {
      const { bins, depot } = action.payload;
      
      // Create traditional route (sequential collection)
      const traditionalPoints: RoutePoint[] = [
        { location: depot }, // Start at depot
      ];
      
      // Add bins in simple sequential order
      bins.forEach(bin => {
        traditionalPoints.push({
          location: bin.location,
          binId: bin.id
        });
      });
      
      traditionalPoints.push({ location: depot }); // Return to depot
      
      // Create optimized route (sorted by fill level)
      const sortedBins = [...bins].sort((a, b) => b.fillLevel - a.fillLevel);
      
      const optimizedPoints: RoutePoint[] = [
        { location: depot }, // Start at depot
      ];
      
      // Add bins sorted by fill level
      sortedBins.forEach(bin => {
        // Only add bins that need collection (above 50% full)
        if (bin.fillLevel > 50) {
          optimizedPoints.push({
            location: bin.location,
            binId: bin.id
          });
        }
      });
      
      optimizedPoints.push({ location: depot }); // Return to depot
      
      // Calculate metrics for both routes
      const traditionalMetrics = calculateRouteMetrics(traditionalPoints);
      const optimizedMetrics = calculateRouteMetrics(optimizedPoints);
      
      // Save metrics to state
      state.traditionalMetrics = traditionalMetrics;
      state.optimizedMetrics = optimizedMetrics;
      
      // Create route objects
      state.routes = [
        {
          id: 'traditional',
          name: 'Traditional Collection Route',
          type: 'traditional',
          points: traditionalPoints,
          inProgress: false,
          completed: false,
          progress: 0,
          metrics: traditionalMetrics,
        },
        {
          id: 'optimized',
          name: 'Smart Optimized Collection Route',
          type: 'optimized',
          points: optimizedPoints,
          inProgress: false,
          completed: false,
          progress: 0,
          metrics: optimizedMetrics,
        }
      ];
    },
    
    // Start a route
    startRoute: (state, action: PayloadAction<string>) => {
      const routeId = action.payload;
      state.activeRouteId = routeId;
      
      const route = state.routes.find(r => r.id === routeId);
      if (route) {
        route.inProgress = true;
        route.completed = false;
        route.progress = 0;
      }
    },
    
    // Update route progress
    updateRouteProgress: (state, action: PayloadAction<{
      routeId: string;
      progress: number;
    }>) => {
      const { routeId, progress } = action.payload;
      const route = state.routes.find(r => r.id === routeId);
      
      if (route) {
        route.progress = progress;
        
        if (progress >= 1) {
          route.inProgress = false;
          route.completed = true;
          state.activeRouteId = null;
        }
      }
    },

    // Empty a bin from a route
    emptyBin: (state, action: PayloadAction<string>) => {
      // This action is handled by the bins slice
      // This is a placeholder to satisfy action imports
    },
    
    // Reset routes
    resetRoutes: (state) => {
      state.routes = [];
      state.activeRouteId = null;
      state.traditionalMetrics = null;
      state.optimizedMetrics = null;
    }
  },
});

export const { 
  generateRoutes, 
  startRoute, 
  updateRouteProgress, 
  emptyBin,
  resetRoutes 
} = routesSlice.actions;

export default routesSlice.reducer;
