
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { WasteBin, setManualFillLevel, emptyBin, removeBin } from '../../store/slices/binsSlice';
import { toast } from '@/components/ui/use-toast';
import { Trash, Truck } from 'lucide-react';

interface BinDetailsProps {
  selectedBin: WasteBin | null;
  onClose: () => void;
}

const BinDetails: React.FC<BinDetailsProps> = ({ selectedBin, onClose }) => {
  const dispatch = useAppDispatch();
  const [fillLevel, setFillLevel] = useState<number>(selectedBin?.fillLevel || 0);
  
  if (!selectedBin) return null;
  
  // Function to get color class based on fill level
  const getFillLevelColorClass = (level: number) => {
    if (level >= 90) return "bg-red-500";
    if (level >= 75) return "bg-red-400";
    if (level >= 50) return "bg-yellow-400";
    return "bg-green-500";
  };
  
  // Handle fill level change
  const handleFillLevelChange = (value: number[]) => {
    setFillLevel(value[0]);
  };
  
  // Apply fill level change
  const applyFillLevelChange = () => {
    dispatch(setManualFillLevel({
      id: selectedBin.id,
      fillLevel
    }));
    
    toast({
      title: "Fill Level Updated",
      description: `${selectedBin.name} fill level set to ${fillLevel.toFixed(0)}%.`,
    });
  };
  
  // Handle empty bin
  const handleEmptyBin = () => {
    dispatch(emptyBin(selectedBin.id));
    
    toast({
      title: "Bin Emptied",
      description: `${selectedBin.name} has been emptied.`,
    });
  };
  
  // Handle remove bin
  const handleRemoveBin = () => {
    dispatch(removeBin(selectedBin.id));
    onClose();
    
    toast({
      title: "Bin Removed",
      description: `${selectedBin.name} has been removed from the system.`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{selectedBin.name}</span>
          <div className={`h-3 w-3 rounded-full ${getFillLevelColorClass(selectedBin.fillLevel)}`}></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Location</Label>
            <p className="text-sm font-mono">
              {selectedBin.location[0].toFixed(4)}, {selectedBin.location[1].toFixed(4)}
            </p>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Neighborhood</Label>
            <p className="text-sm">{selectedBin.neighborhood}</p>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <p className="text-sm capitalize">{selectedBin.type}</p>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Capacity</Label>
            <p className="text-sm">{selectedBin.capacity} liters</p>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Base Fill Rate</Label>
            <p className="text-sm">{selectedBin.baseFillRate.toFixed(1)}% / hour</p>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Variability</Label>
            <p className="text-sm">±{(selectedBin.variabilityFactor * 100).toFixed(0)}%</p>
          </div>
        </div>
        
        <div className="border-t border-border pt-4">
          <Label className="text-xs text-muted-foreground mb-2 block">Sensor Data</Label>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-muted p-2 text-center">
              <p className="text-xs text-muted-foreground">Battery</p>
              <p className="font-medium">{selectedBin.sensorData.batteryLevel.toFixed(0)}%</p>
            </div>
            
            <div className="rounded-md bg-muted p-2 text-center">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{selectedBin.sensorData.connectivity}</p>
            </div>
            
            <div className="rounded-md bg-muted p-2 text-center">
              <p className="text-xs text-muted-foreground">Last Signal</p>
              <p className="font-medium text-xs">
                {new Date(selectedBin.sensorData.lastTransmission).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-4">
          <Label className="text-sm font-medium mb-2 block">Manual Fill Level Adjustment</Label>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Slider 
                value={[fillLevel]} 
                min={0} 
                max={100} 
                step={1} 
                onValueChange={handleFillLevelChange} 
                className="flex-1"
              />
              <span className="w-12 text-center font-mono">{fillLevel.toFixed(0)}%</span>
            </div>
            
            <Button onClick={applyFillLevelChange} className="w-full">
              Apply Changes
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline" onClick={handleEmptyBin} className="flex-1">
          <Truck className="mr-2 h-4 w-4" />
          Empty Bin
        </Button>
        <Button variant="destructive" onClick={handleRemoveBin} className="flex-1">
          <Trash className="mr-2 h-4 w-4" />
          Remove Bin
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BinDetails;
