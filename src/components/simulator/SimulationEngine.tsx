
import React, { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { updateSimulationTime, setLastUpdateTime } from '../../store/slices/simulationSlice';
import { updateBinFillLevels, updateBinSensorData, WasteBin } from '../../store/slices/binsSlice';
import { updateRouteProgress, emptyBin } from '../../store/slices/routesSlice';
import { addNotification } from '../../store/slices/notificationsSlice';

// Update frequency in ms
const UPDATE_INTERVAL = 1000;
// How often to check for critical bin levels
const BIN_CHECK_INTERVAL = 5000;
// Sensor update interval (15 minutes in simulation time)
const SENSOR_UPDATE_INTERVAL = 15 * 60 * 1000;

const SimulationEngine: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isRunning, speed, scenario, currentTime, lastUpdateTime } = useAppSelector(state => state.simulation);
  const bins = useAppSelector(state => state.bins.bins);
  const routes = useAppSelector(state => state.routes.routes);
  const activeRouteId = useAppSelector(state => state.routes.activeRouteId);
  
  // Refs to track last bin check and sensor update
  const lastBinCheckRef = useRef(Date.now());
  const lastSensorUpdateRef = useRef(Date.now());
  const routeProgressRef = useRef(0);
  
  // Main simulation effect
  useEffect(() => {
    if (!isRunning) return;
    
    console.log("Simulation running with speed:", speed);
    
    const timerRef = setInterval(() => {
      const now = Date.now();
      const realElapsed = now - new Date(lastUpdateTime).getTime();
      // Adjust elapsed time based on simulation speed
      const simulatedElapsed = realElapsed * speed;
      
      console.log(`Time update: real elapsed ${realElapsed}ms, simulated ${simulatedElapsed}ms, speed ${speed}x`);
      
      // Update simulation time
      const newTime = new Date(currentTime.getTime() + simulatedElapsed);
      dispatch(updateSimulationTime(newTime));
      dispatch(setLastUpdateTime(new Date(now)));
      
      // Update bin fill levels
      dispatch(updateBinFillLevels({
        time: newTime,
        scenario,
        elapsed: simulatedElapsed,
      }));
      
      // Check for critical bin levels periodically
      if (now - lastBinCheckRef.current > BIN_CHECK_INTERVAL) {
        checkCriticalBins(bins);
        lastBinCheckRef.current = now;
      }
      
      // Update sensor data periodically (simulating 15-minute transmission intervals)
      const simulatedSinceLastUpdate = now - lastSensorUpdateRef.current;
      if (simulatedSinceLastUpdate * speed > SENSOR_UPDATE_INTERVAL) {
        dispatch(updateBinSensorData());
        checkSensorIssues(bins);
        lastSensorUpdateRef.current = now;
      }
      
      // Update active route progress if any
      if (activeRouteId) {
        const activeRoute = routes.find(route => route.id === activeRouteId);
        if (activeRoute && !activeRoute.completed) {
          // Increase progress more noticeably for demo purposes
          const progressIncrease = 0.02 * speed;
          const newProgress = Math.min(1, routeProgressRef.current + progressIncrease);
          
          console.log(`Updating route progress: ${routeProgressRef.current} -> ${newProgress}`);
          
          // Update route progress
          dispatch(updateRouteProgress({ 
            routeId: activeRouteId, 
            progress: newProgress 
          }));
          
          // Check if we need to empty bins
          if (activeRoute) {
            const { points } = activeRoute;
            
            // Find the current route index based on progress
            const numSegments = points.length - 1;
            const progressAlongRoute = newProgress * numSegments;
            const currentIndex = Math.floor(progressAlongRoute);
            const nextIndex = currentIndex + 1;
            const currentProgress = progressAlongRoute - currentIndex;
            
            // If we're close to a bin point, empty that bin
            if (currentProgress > 0.8 && nextIndex < points.length) {
              const nextPoint = points[nextIndex];
              if (nextPoint.binId) {
                console.log(`Emptying bin: ${nextPoint.binId}`);
                dispatch(emptyBin(nextPoint.binId));
                
                // Add notification
                dispatch(addNotification({
                  title: 'Bin Collected',
                  message: `A bin has been emptied at ${nextPoint.location[0].toFixed(4)}, ${nextPoint.location[1].toFixed(4)}`,
                  type: 'success',
                  binId: nextPoint.binId,
                  priority: 'low',
                }));
              }
            }
          }
          
          routeProgressRef.current = newProgress;
          
          // If the route is complete, reset the progress
          if (newProgress >= 1) {
            routeProgressRef.current = 0;
            
            // Add notification for route completion
            dispatch(addNotification({
              title: 'Route Completed',
              message: `${activeRoute.name} has been completed successfully.`,
              type: 'success',
              priority: 'medium',
            }));
          }
        }
      }
    }, UPDATE_INTERVAL);
    
    return () => clearInterval(timerRef);
  }, [isRunning, speed, scenario, currentTime, lastUpdateTime, bins, activeRouteId, routes, dispatch]);
  
  // Reset route progress when active route changes
  useEffect(() => {
    routeProgressRef.current = 0;
  }, [activeRouteId]);
  
  // Function to check for critical bin levels
  const checkCriticalBins = (bins: WasteBin[]) => {
    bins.forEach(bin => {
      // Alert when bins reach critical levels
      if (bin.fillLevel >= 90) {
        dispatch(addNotification({
          title: 'Critical Fill Level',
          message: `${bin.name} is at ${Math.round(bin.fillLevel)}% capacity and requires immediate attention.`,
          type: 'alert',
          binId: bin.id,
          priority: 'high',
        }));
      } else if (bin.fillLevel >= 75 && bin.fillLevel < 80) {
        dispatch(addNotification({
          title: 'High Fill Level',
          message: `${bin.name} is at ${Math.round(bin.fillLevel)}% capacity.`,
          type: 'warning',
          binId: bin.id,
          priority: 'medium',
        }));
      }
    });
  };
  
  // Function to check for sensor issues
  const checkSensorIssues = (bins: WasteBin[]) => {
    bins.forEach(bin => {
      // Alert for low battery
      if (bin.sensorData.batteryLevel < 20) {
        dispatch(addNotification({
          title: 'Low Battery',
          message: `${bin.name} sensor battery is at ${Math.round(bin.sensorData.batteryLevel)}%. Maintenance required.`,
          type: 'warning',
          binId: bin.id,
          priority: 'low',
        }));
      }
      
      // Alert for connectivity issues
      if (bin.sensorData.connectivity !== 'online') {
        dispatch(addNotification({
          title: 'Connectivity Issue',
          message: `${bin.name} has ${bin.sensorData.connectivity} connectivity. Check sensor status.`,
          type: 'warning',
          binId: bin.id,
          priority: 'medium',
        }));
      }
    });
  };
  
  // This component doesn't render anything
  return null;
};

export default SimulationEngine;
