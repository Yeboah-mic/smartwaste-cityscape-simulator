
import { configureStore } from '@reduxjs/toolkit';
import simulationReducer from './slices/simulationSlice';
import binsReducer from './slices/binsSlice';
import routesReducer from './slices/routesSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    simulation: simulationReducer,
    bins: binsReducer,
    routes: routesReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
