import React, { useEffect, useState } from 'react';
import { speak } from './VoiceCommandCenter';

interface NavigationMapProps {
  destination: string | null;
  onInstructionUpdate: (instruction: string) => void;
}

const NavigationMap: React.FC<NavigationMapProps> = ({ destination, onInstructionUpdate }) => {
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation(position);
          // Proactive logic: Check distance to destination
          if (destination) {
            console.log(`Tracking movement towards ${destination}...`);
          }
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [destination]);

  useEffect(() => {
    if (destination) {
      const msg = `Finding best walking route to ${destination}. Starting navigation now. Walk forward for 50 meters.`;
      onInstructionUpdate(msg);
      speak(msg);
    }
  }, [destination]);

  return (
    <div className="nav-map-container">
      {/* Mapbox GL JS would be initialized here with userLocation */}
    </div>
  );
};

export default NavigationMap;
