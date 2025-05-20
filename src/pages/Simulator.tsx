
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from 'lucide-react';
import CityMap from '../components/CityMap';
import SimulationControls from '../components/simulator/SimulationControls';
import SimulationEngine from '../components/simulator/SimulationEngine';
import BinDetails from '../components/simulator/BinDetails';
import AddBinForm from '../components/simulator/AddBinForm';
import RouteControls from '../components/simulator/RouteControls';
import NotificationsPanel from '../components/simulator/NotificationsPanel';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import { WasteBin } from '../store/slices/binsSlice';
import { Provider } from 'react-redux';
import { store } from '../store';

const Simulator = () => {
  const [selectedBin, setSelectedBin] = useState<WasteBin | null>(null);
  const [showAddBinForm, setShowAddBinForm] = useState(false);
  
  // Handle bin selection
  const handleSelectBin = (bin: WasteBin) => {
    setSelectedBin(bin);
  };
  
  // Close bin details modal
  const handleCloseBinDetails = () => {
    setSelectedBin(null);
  };
  
  // Toggle add bin form
  const handleToggleAddBinForm = () => {
    setShowAddBinForm(!showAddBinForm);
  };

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-4">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-center">SmartWaste Simulator</h1>
            <p className="text-muted-foreground text-center mt-2">
              IoT-based waste management system simulation
            </p>
          </header>
          
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="map">Map & Controls</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="map" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Map Area */}
                <div className="lg:col-span-2 h-[600px]">
                  <CityMap onBinClick={handleSelectBin} />
                </div>
                
                {/* Controls Sidebar */}
                <div className="space-y-6">
                  <SimulationControls />
                  
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Bin Management</h2>
                    <Button size="sm" variant="outline" onClick={handleToggleAddBinForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bin
                    </Button>
                  </div>
                  
                  <RouteControls />
                  
                  <NotificationsPanel />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Bin Details Dialog */}
        <Dialog open={!!selectedBin} onOpenChange={handleCloseBinDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bin Details</DialogTitle>
            </DialogHeader>
            <BinDetails selectedBin={selectedBin} onClose={handleCloseBinDetails} />
          </DialogContent>
        </Dialog>
        
        {/* Add Bin Dialog */}
        <Dialog open={showAddBinForm} onOpenChange={setShowAddBinForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bin</DialogTitle>
            </DialogHeader>
            <AddBinForm onClose={() => setShowAddBinForm(false)} />
          </DialogContent>
        </Dialog>
        
        {/* Simulation Engine (non-visual component) */}
        <SimulationEngine />
      </div>
    </Provider>
  );
};

export default Simulator;
