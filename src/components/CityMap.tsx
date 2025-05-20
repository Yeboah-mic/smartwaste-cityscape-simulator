
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppSelector } from '../hooks/useAppSelector';
import { ArrowRight, Truck, CircleAlert } from 'lucide-react';
import { WasteBin } from '../store/slices/binsSlice';
import { Toast } from '@/components/ui/toast';
import { toast } from '@/components/ui/use-toast';

// Fix for Leaflet default icon issue in production build
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom bin icon based on fill level
const getBinIcon = (fillLevel: number, batteryLevel: number, connectivity: string) => {
  let fillColor = 'green';
  if (fillLevel > 90) fillColor = 'red';
  else if (fillLevel > 75) fillColor = 'red';
  else if (fillLevel > 50) fillColor = 'yellow';

  const iconHtml = `
    <div class="flex flex-col items-center">
      <div 
        class="rounded-full w-8 h-8 flex items-center justify-center border-2 border-gray-700" 
        style="background-color: ${fillColor}; ${fillLevel > 90 ? 'animation: pulse 1s infinite;' : ''}"
      >
        <span class="text-xs font-bold text-white">${Math.round(fillLevel)}%</span>
      </div>
      ${connectivity !== 'online' ? 
        '<div class="text-red-500 mt-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>'
        : ''
      }
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-bin-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Truck icon for route visualization
const getTruckIcon = (status: string) => {
  return L.divIcon({
    html: `
      <div class="rounded-full w-10 h-10 flex items-center justify-center bg-blue-600 border-2 border-white shadow-lg">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 17h4V5H2v12h3"></path>
          <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"></path>
          <circle cx="7.5" cy="17.5" r="2.5"></circle>
          <circle cx="17.5" cy="17.5" r="2.5"></circle>
        </svg>
      </div>
    `,
    className: 'custom-truck-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Component to update map view when simulation changes
const MapUpdater: React.FC = () => {
  const map = useMap();
  const activeRoute = useAppSelector(state => {
    const activeRouteId = state.routes.activeRouteId;
    return activeRouteId ? state.routes.routes.find(route => route.id === activeRouteId) : null;
  });
  
  useEffect(() => {
    if (activeRoute && activeRoute.vehicle.status !== 'idle') {
      // Center the map on the vehicle position with smooth animation
      map.flyTo(activeRoute.vehicle.currentPosition, map.getZoom(), {
        animate: true,
        duration: 1
      });
    }
  }, [activeRoute?.vehicle.currentPosition, map]);
  
  return null;
};

interface CityMapProps {
  onBinClick: (bin: WasteBin) => void;
}

const CityMap: React.FC<CityMapProps> = ({ onBinClick }) => {
  const bins = useAppSelector(state => state.bins.bins);
  const routes = useAppSelector(state => state.routes.routes);
  const activeRouteId = useAppSelector(state => state.routes.activeRouteId);
  
  // New York City center coordinates (near Central Park)
  const nyc = [40.7831, -73.9712];
  
  // Prepare route polylines
  const getRoutePolyline = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (!route) return [];
    
    return route.points.map(point => point.location);
  };
  
  const getRouteColor = (routeType: 'traditional' | 'optimized') => {
    return routeType === 'traditional' ? '#ff6b6b' : '#4dabf7';
  };
  
  const activeVehicle = activeRouteId 
    ? routes.find(route => route.id === activeRouteId)?.vehicle 
    : null;
    
  // Handle bin click
  const handleBinMarkerClick = (bin: WasteBin) => {
    onBinClick(bin);
    
    // Show toast notification for critical bins
    if (bin.fillLevel > 90) {
      toast({
        title: 'Critical Fill Level',
        description: `${bin.name} is at ${Math.round(bin.fillLevel)}% capacity and requires immediate attention.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border shadow-md">
      <MapContainer 
        center={nyc} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Bin markers */}
        {bins.map(bin => (
          <Marker 
            key={bin.id}
            position={bin.location}
            icon={getBinIcon(bin.fillLevel, bin.sensorData.batteryLevel, bin.sensorData.connectivity)}
            eventHandlers={{
              click: () => handleBinMarkerClick(bin),
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold">{bin.name}</h3>
                <p className="text-sm">Fill Level: {Math.round(bin.fillLevel)}%</p>
                <p className="text-sm">Type: {bin.type}</p>
                <p className="text-sm">Battery: {Math.round(bin.sensorData.batteryLevel)}%</p>
                <p className="text-sm">Status: {bin.sensorData.connectivity}</p>
                <p className="text-sm">Neighborhood: {bin.neighborhood}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Route polylines */}
        {routes.map(route => (
          <Polyline
            key={route.id}
            positions={getRoutePolyline(route.id)}
            pathOptions={{ 
              color: getRouteColor(route.type),
              weight: route.id === activeRouteId ? 5 : 3,
              opacity: route.id === activeRouteId ? 1 : 0.6,
              dashArray: route.type === 'traditional' ? '10, 5' : undefined,
            }}
          />
        ))}
        
        {/* Vehicle marker */}
        {activeVehicle && (
          <Marker
            position={activeVehicle.currentPosition}
            icon={getTruckIcon(activeVehicle.status)}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold">Collection Vehicle</h3>
                <p className="text-sm">Status: {activeVehicle.status}</p>
                <p className="text-sm">Current Load: {Math.round(activeVehicle.currentLoad)} L</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        <MapUpdater />
      </MapContainer>
    </div>
  );
};

export default CityMap;
