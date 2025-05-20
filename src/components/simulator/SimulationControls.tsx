
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@radix-ui/react-label';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { 
  startSimulation, 
  pauseSimulation, 
  setSpeed, 
  setScenario,
  resetSimulation,
  SimulationSpeed,
  SimulationScenario
} from '../../store/slices/simulationSlice';
import { generateRoutes } from '../../store/slices/routesSlice';
import { resetBins } from '../../store/slices/binsSlice';
import { toast } from '@/components/ui/use-toast';
import { Play, Pause, RotateCcw, Route, Settings } from 'lucide-react';

const SimulationControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isRunning, speed, scenario } = useAppSelector(state => state.simulation);
  const bins = useAppSelector(state => state.bins.bins);

  // Handle simulation start/pause
  const toggleSimulation = () => {
    if (isRunning) {
      dispatch(pauseSimulation());
      toast({
        title: "Simulation Paused",
        description: "The simulation has been paused.",
      });
    } else {
      dispatch(startSimulation());
      toast({
        title: "Simulation Started",
        description: `Running simulation at ${speed}x speed with ${scenario} scenario.`,
      });
    }
  };

  // Handle speed change
  const handleSpeedChange = (value: number[]) => {
    const speedValue = value[0] as SimulationSpeed;
    dispatch(setSpeed(speedValue));
    
    if (isRunning) {
      toast({
        title: "Speed Changed",
        description: `Simulation speed set to ${speedValue}x.`,
      });
    }
  };

  // Handle scenario change
  const handleScenarioChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newScenario = event.target.value as SimulationScenario;
    dispatch(setScenario(newScenario));
    
    toast({
      title: "Scenario Changed",
      description: `Switched to ${newScenario} scenario.`,
    });
  };

  // Generate collection routes
  const handleGenerateRoutes = () => {
    // New York City Department of Sanitation HQ as depot
    const depot: [number, number] = [40.7157, -74.0047];
    
    dispatch(generateRoutes({
      bins,
      depot
    }));
    
    toast({
      title: "Routes Generated",
      description: "Collection routes have been optimized based on current bin status.",
    });
  };

  // Reset simulation
  const handleReset = () => {
    dispatch(resetSimulation());
    dispatch(resetBins());
    
    toast({
      title: "Simulation Reset",
      description: "All bins and simulation settings have been reset to initial state.",
    });
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Simulation Controls</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        
        {/* Play/Pause Button */}
        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={toggleSimulation}
            variant={isRunning ? "secondary" : "default"}
            className="w-full sm:w-auto"
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause Simulation
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Simulation
              </>
            )}
          </Button>
        </div>
        
        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm font-medium">Simulation Speed: {speed}x</Label>
          </div>
          <Slider
            defaultValue={[1]}
            min={1}
            max={8}
            step={1}
            value={[speed]}
            onValueChange={handleSpeedChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1x</span>
            <span>2x</span>
            <span>4x</span>
            <span>8x</span>
          </div>
        </div>
        
        {/* Scenario Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Scenario</Label>
          <select 
            className="w-full p-2 rounded-md border border-input bg-background"
            value={scenario}
            onChange={handleScenarioChange}
          >
            <option value="normal">Normal Weekday</option>
            <option value="weekend">Weekend</option>
            <option value="special-event">Special Event</option>
          </select>
        </div>
        
        {/* Route Generation */}
        <Button
          variant="outline"
          onClick={handleGenerateRoutes}
        >
          <Route className="mr-2 h-4 w-4" />
          Generate Routes
        </Button>
      </div>
    </div>
  );
};

export default SimulationControls;
