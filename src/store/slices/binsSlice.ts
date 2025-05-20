
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BinSensorData {
  batteryLevel: number; // 0-100%
  connectivity: 'online' | 'offline' | 'intermittent';
  lastTransmission: Date;
}

export interface WasteBin {
  id: string;
  location: [number, number]; // [latitude, longitude]
  name: string;
  fillLevel: number; // 0-100%
  capacity: number; // in liters
  baseFillRate: number; // base rate at which the bin fills (% per hour)
  variabilityFactor: number; // random fluctuation factor (0-1)
  sensorData: BinSensorData;
  lastCollectionTime: Date;
  neighborhood: string;
  type: 'general' | 'recycling' | 'organic';
}

interface BinsState {
  bins: WasteBin[];
}

const generateInitialBins = (): WasteBin[] => {
  // Accra, Ghana coordinates
  const centerLat = 5.6037;
  const centerLng = -0.1870;
  
  // Generate 40 bins with random distribution around the city
  return Array.from({ length: 40 }, (_, i) => {
    // Create random offsets (roughly within Accra area)
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.05;
    
    // Determine neighborhood based on location (Accra neighborhoods)
    const neighborhoods = ['Airport Residential', 'Cantonments', 'Osu', 'Labone', 'Adabraka'];
    const neighborhoodIndex = Math.floor(Math.random() * neighborhoods.length);
    
    // Determine bin type
    const types = ['general', 'recycling', 'organic'] as const;
    const typeIndex = Math.floor(Math.random() * types.length);
    
    // Make fill rates higher to make changes more noticeable in demo
    const baseFillRate = 2 + Math.random() * 3; // 2-5% per hour, much faster for demo purposes
    
    return {
      id: `bin-${i + 1}`,
      location: [centerLat + latOffset, centerLng + lngOffset],
      name: `Bin ${i + 1}`,
      fillLevel: 20 + Math.random() * 40, // Start with varied fill levels (20-60%)
      capacity: 100 + Math.floor(Math.random() * 100), // 100-199 liters
      baseFillRate: baseFillRate,
      variabilityFactor: Math.random() * 0.3, // 0-0.3 randomness factor
      sensorData: {
        batteryLevel: 70 + Math.floor(Math.random() * 30), // 70-99%
        connectivity: 'online',
        lastTransmission: new Date(),
      },
      lastCollectionTime: new Date(Date.now() - Math.random() * 86400000 * 7), // Last 7 days
      neighborhood: neighborhoods[neighborhoodIndex],
      type: types[typeIndex],
    };
  });
};

const initialState: BinsState = {
  bins: generateInitialBins(),
};

export const binsSlice = createSlice({
  name: 'bins',
  initialState,
  reducers: {
    updateBinFillLevels: (state, action: PayloadAction<{ time: Date, scenario: string, elapsed: number }>) => {
      const { elapsed, scenario } = action.payload;
      
      // Update each bin's fill level based on its parameters and the scenario
      state.bins = state.bins.map(bin => {
        // Convert elapsed time from ms to hours
        const elapsedHours = elapsed / 3600000;
        
        // Base fill rate adjusted by scenario
        let scenarioMultiplier = 1;
        if (scenario === 'weekend' && bin.neighborhood === 'Cantonments') {
          scenarioMultiplier = 0.7; // Reduced activity in business districts
        } else if (scenario === 'weekend' && (bin.neighborhood === 'Osu' || bin.neighborhood === 'Labone')) {
          scenarioMultiplier = 1.2; // Increased activity in residential areas
        } else if (scenario === 'special-event') {
          scenarioMultiplier = 2.0; // Much higher activity during special events
        }
        
        // Calculate the fill increment
        const baseIncrement = bin.baseFillRate * elapsedHours * scenarioMultiplier;
        
        // Add random variability
        const randomFactor = 1 + (Math.random() * 2 - 1) * bin.variabilityFactor;
        const fillIncrement = baseIncrement * randomFactor;
        
        // Calculate new fill level capped at 100%
        const newFillLevel = Math.min(100, bin.fillLevel + fillIncrement);
        
        return {
          ...bin,
          fillLevel: newFillLevel,
        };
      });
    },
    
    emptyBin: (state, action: PayloadAction<string>) => {
      const binIndex = state.bins.findIndex(bin => bin.id === action.payload);
      if (binIndex !== -1) {
        state.bins[binIndex].fillLevel = 0;
        state.bins[binIndex].lastCollectionTime = new Date();
      }
    },
    
    updateBinSensorData: (state) => {
      // Update sensor data (battery levels decrease slightly, connectivity might change)
      state.bins = state.bins.map(bin => {
        // 0.5% chance of connectivity issues
        const connectivityRoll = Math.random();
        let connectivity = bin.sensorData.connectivity;
        if (connectivityRoll < 0.005) {
          connectivity = 'offline';
        } else if (connectivityRoll < 0.01) {
          connectivity = 'intermittent';
        } else {
          connectivity = 'online';
        }
        
        // Battery decreases by 0.01-0.05% per simulated hour
        const batteryDecrease = Math.random() * 0.04 + 0.01;
        const newBatteryLevel = Math.max(0, bin.sensorData.batteryLevel - batteryDecrease);
        
        return {
          ...bin,
          sensorData: {
            ...bin.sensorData,
            batteryLevel: newBatteryLevel,
            connectivity: connectivity,
            lastTransmission: new Date(),
          }
        };
      });
    },
    
    addBin: (state, action: PayloadAction<WasteBin>) => {
      state.bins.push(action.payload);
    },
    
    removeBin: (state, action: PayloadAction<string>) => {
      state.bins = state.bins.filter(bin => bin.id !== action.payload);
    },
    
    setManualFillLevel: (state, action: PayloadAction<{ id: string, fillLevel: number }>) => {
      const { id, fillLevel } = action.payload;
      const binIndex = state.bins.findIndex(bin => bin.id === id);
      if (binIndex !== -1) {
        state.bins[binIndex].fillLevel = Math.max(0, Math.min(100, fillLevel));
      }
    },
    
    resetBins: (state) => {
      state.bins = generateInitialBins();
    },
  },
});

export const {
  updateBinFillLevels,
  emptyBin,
  updateBinSensorData,
  addBin,
  removeBin,
  setManualFillLevel,
  resetBins,
} = binsSlice.actions;

export default binsSlice.reducer;
