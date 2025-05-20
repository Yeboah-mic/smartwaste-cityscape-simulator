
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SimulationSpeed = 1 | 2 | 4 | 8;
export type SimulationScenario = 'normal' | 'weekend' | 'special-event';

interface SimulationState {
  isRunning: boolean;
  speed: SimulationSpeed;
  scenario: SimulationScenario;
  currentTime: Date;
  lastUpdateTime: Date;
}

const initialState: SimulationState = {
  isRunning: false,
  speed: 1,
  scenario: 'normal',
  currentTime: new Date(),
  lastUpdateTime: new Date(),
};

export const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    startSimulation: (state) => {
      state.isRunning = true;
    },
    pauseSimulation: (state) => {
      state.isRunning = false;
    },
    setSpeed: (state, action: PayloadAction<SimulationSpeed>) => {
      state.speed = action.payload;
    },
    setScenario: (state, action: PayloadAction<SimulationScenario>) => {
      state.scenario = action.payload;
    },
    updateSimulationTime: (state, action: PayloadAction<Date>) => {
      state.currentTime = action.payload;
    },
    setLastUpdateTime: (state, action: PayloadAction<Date>) => {
      state.lastUpdateTime = action.payload;
    },
    resetSimulation: (state) => {
      state.isRunning = false;
      state.currentTime = new Date();
      state.lastUpdateTime = new Date();
    },
  },
});

export const {
  startSimulation,
  pauseSimulation,
  setSpeed,
  setScenario,
  updateSimulationTime,
  setLastUpdateTime,
  resetSimulation,
} = simulationSlice.actions;

export default simulationSlice.reducer;
