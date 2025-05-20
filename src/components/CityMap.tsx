
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppSelector } from '../hooks/useAppSelector';
import { WasteBin } from '../store/slices/binsSlice';

// Define custom bin icons based on fill level
const createBinIcon = (fillLevel: number) => {
  // Color based on fill level
  let color = '#4ade80'; // green-400
  if (fillLevel >= 90) color = '#ef4444'; // red-500
  else if (fillLevel >= 75) color = '#f97316'; // orange-500 
  else if (fillLevel >= 50) color = '#facc15'; // yellow-400

  // SVG for bin icon
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
      <path d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
      <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0117.25 3v1.5h.75a3 3 0 013 3v13.5a3 3 0 01-3 3H6a3 3 0 01-3-3V7.5a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v8.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-8.25z" clip-rule="evenodd" />
    </svg>
  `;

  return L.divIcon({
    className: 'custom-bin-icon',
    html: svgIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Define truck icon for routes
const truckIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

// MapController component to set initial view
const MapController = () => {
  const map = useMap();
  
  useEffect(() => {
    // Set initial view to Accra, Ghana
    map.setView([5.6037, -0.1870], 13);
  }, [map]);
  
  return null;
};

interface CityMapProps {
  onBinClick: (bin: WasteBin) => void;
}

const CityMap: React.FC<CityMapProps> = ({ onBinClick }) => {
  // Get bins and active route from Redux state
  const bins = useAppSelector(state => state.bins.bins);
  const routes = useAppSelector(state => state.routes.routes);
  const activeRouteId = useAppSelector(state => state.routes.activeRouteId);
  const isRunning = useAppSelector(state => state.simulation.isRunning);
  
  // State for the truck position
  const [truckPosition, setTruckPosition] = useState<[number, number] | null>(null);

  // Accra, Ghana center coordinates
  const accraCenter: [number, number] = [5.6037, -0.1870];
  
  // Calculate truck position based on active route progress
  useEffect(() => {
    if (!activeRouteId) {
      setTruckPosition(null);
      return;
    }

    const activeRoute = routes.find(r => r.id === activeRouteId);
    if (!activeRoute) return;

    const { points, progress } = activeRoute;
    if (points.length < 2) return;
    
    console.log(`Route progress: ${progress}, points: ${points.length}`);
    
    // Calculate which segment we're on
    const numSegments = points.length - 1;
    const progressAlongRoute = progress * numSegments;
    const currentSegmentIndex = Math.min(Math.floor(progressAlongRoute), numSegments - 1);
    const progressInSegment = progressAlongRoute - currentSegmentIndex;
    
    // Get points for current segment
    const start = points[currentSegmentIndex].location;
    const end = points[currentSegmentIndex + 1].location;
    
    // Interpolate position
    const lat = start[0] + (end[0] - start[0]) * progressInSegment;
    const lng = start[1] + (end[1] - start[1]) * progressInSegment;
    
    console.log(`Truck position updated: [${lat}, ${lng}]`);
    setTruckPosition([lat, lng]);
  }, [activeRouteId, routes]);

  return (
    <MapContainer 
      center={accraCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <MapController />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Display all bins */}
      {bins.map(bin => (
        <Marker 
          key={bin.id} 
          position={bin.location as [number, number]} 
          icon={createBinIcon(bin.fillLevel)}
          eventHandlers={{
            click: () => onBinClick(bin)
          }}
        >
          <Popup>
            <div className="font-semibold">{bin.name}</div>
            <div className="text-sm">Fill Level: {Math.round(bin.fillLevel)}%</div>
            <div className="text-xs text-muted-foreground">{bin.neighborhood}</div>
          </Popup>
        </Marker>
      ))}
      
      {/* Display active route */}
      {activeRouteId && (
        <React.Fragment>
          {routes
            .filter(route => route.id === activeRouteId)
            .map(route => (
              <Polyline
                key={route.id}
                positions={route.points.map(point => point.location)}
                color={route.type === 'traditional' ? '#1d4ed8' : '#059669'}
                weight={3}
                opacity={0.8}
              />
            ))}
        </React.Fragment>
      )}
      
      {/* Display truck icon for active route */}
      {truckPosition && (
        <Marker 
          position={truckPosition} 
          icon={truckIcon}
        >
          <Popup>Collection Vehicle</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default CityMap;
