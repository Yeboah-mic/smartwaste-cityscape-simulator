
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-4xl font-bold mb-6 tracking-tight">Smart Waste Management Simulator</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Experience how IoT technology transforms urban waste collection with real-time monitoring,
          route optimization and data analytics.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg">
            <Link to="/simulator">Launch Simulator</Link>
          </Button>
          
          <Button variant="outline" size="lg" asChild>
            <a href="#features">Learn More</a>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12" id="features">
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Interactive City Map</h3>
            <p className="text-muted-foreground text-center">
              Visualize waste bins across the city with real-time fill levels and monitor collection routes.
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Real-time Simulation</h3>
            <p className="text-muted-foreground text-center">
              Configure bin parameters and watch as fill levels change based on time and location factors.
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Smart Analytics</h3>
            <p className="text-muted-foreground text-center">
              Compare traditional vs. optimized routes with detailed metrics on savings and efficiency.
            </p>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Why SmartWaste Matters</h2>
          <p className="text-muted-foreground mb-6">
            Urban waste management is a critical challenge for modern cities. With SmartWaste technology,
            municipalities can reduce collection costs by up to 30%, decrease carbon emissions,
            and provide better service to residents.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">30%</p>
              <p className="text-sm text-muted-foreground">Cost Reduction</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">25%</p>
              <p className="text-sm text-muted-foreground">Fewer Truck Rolls</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">20%</p>
              <p className="text-sm text-muted-foreground">CO₂ Reduction</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">40%</p>
              <p className="text-sm text-muted-foreground">Overflow Prevention</p>
            </div>
          </div>
          
          <Button asChild className="mx-auto block">
            <Link to="/simulator">Start Simulating Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
