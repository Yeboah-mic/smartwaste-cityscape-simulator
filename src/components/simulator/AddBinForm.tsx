
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addBin, WasteBin } from '../../store/slices/binsSlice';
import { toast } from '@/components/ui/use-toast';

interface AddBinFormProps {
  onClose: () => void;
}

const AddBinForm: React.FC<AddBinFormProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  
  // Form state
  const [name, setName] = useState('New Bin');
  const [lat, setLat] = useState('40.7831');
  const [lng, setLng] = useState('-73.9712');
  const [capacity, setCapacity] = useState('150');
  const [baseFillRate, setBaseFillRate] = useState('1.0');
  const [neighborhood, setNeighborhood] = useState('Manhattan');
  const [type, setType] = useState<'general' | 'recycling' | 'organic'>('general');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create unique ID
    const id = `bin-${Date.now()}`;
    
    // Create new bin object
    const newBin: WasteBin = {
      id,
      name,
      location: [parseFloat(lat), parseFloat(lng)],
      fillLevel: 0, // Start empty
      capacity: parseInt(capacity),
      baseFillRate: parseFloat(baseFillRate),
      variabilityFactor: Math.random() * 0.3, // Random variability
      sensorData: {
        batteryLevel: 100, // New battery
        connectivity: 'online',
        lastTransmission: new Date(),
      },
      lastCollectionTime: new Date(),
      neighborhood,
      type,
    };
    
    // Add bin to state
    dispatch(addBin(newBin));
    
    // Show toast
    toast({
      title: "Bin Added",
      description: `${name} has been added to the map.`,
    });
    
    // Close form
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">Bin Name</label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="lat" className="text-sm font-medium">Latitude</label>
          <Input
            id="lat"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required
            type="number"
            step="0.0001"
          />
        </div>
        
        <div>
          <label htmlFor="lng" className="text-sm font-medium">Longitude</label>
          <Input
            id="lng"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            required
            type="number"
            step="0.0001"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="capacity" className="text-sm font-medium">Capacity (liters)</label>
          <Input
            id="capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
            type="number"
            min="50"
            max="500"
          />
        </div>
        
        <div>
          <label htmlFor="fillRate" className="text-sm font-medium">Fill Rate (%/hour)</label>
          <Input
            id="fillRate"
            value={baseFillRate}
            onChange={(e) => setBaseFillRate(e.target.value)}
            required
            type="number"
            min="0.1"
            max="5"
            step="0.1"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="neighborhood" className="text-sm font-medium">Neighborhood</label>
          <select
            id="neighborhood"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
          >
            <option value="Manhattan">Manhattan</option>
            <option value="Brooklyn">Brooklyn</option>
            <option value="Queens">Queens</option>
            <option value="Bronx">Bronx</option>
            <option value="Staten Island">Staten Island</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="type" className="text-sm font-medium">Bin Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'general' | 'recycling' | 'organic')}
            className="w-full p-2 rounded-md border border-input bg-background"
          >
            <option value="general">General Waste</option>
            <option value="recycling">Recycling</option>
            <option value="organic">Organic</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Add Bin
        </Button>
      </div>
    </form>
  );
};

export default AddBinForm;
