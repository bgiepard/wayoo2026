import { useEffect, useRef, useState } from "react";

interface RouteMapProps {
  from: string;
  to: string;
  stops?: string[];
}

export default function RouteMap({ from, to, stops = [] }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!from || !to) return;

    const initMap = () => {
      if (!window.google?.maps || !mapRef.current) {
        return false;
      }

      // Initialize map centered on Poland
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: 7,
          center: { lat: 52.0, lng: 19.0 },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#2563eb",
            strokeWeight: 5,
          },
        });

        directionsRendererRef.current.setMap(mapInstanceRef.current);
      }

      return true;
    };

    const calculateRoute = () => {
      if (!mapInstanceRef.current || !directionsRendererRef.current) return;

      const directionsService = new window.google.maps.DirectionsService();

      // Build waypoints from stops
      const waypoints: google.maps.DirectionsWaypoint[] = stops.map((stop) => ({
        location: stop,
        stopover: true,
      }));

      const request: google.maps.DirectionsRequest = {
        origin: from,
        destination: to,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        region: "pl",
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current?.setDirections(result);

          // Calculate total distance
          let totalDistance = 0;
          const legs = result.routes[0]?.legs || [];
          legs.forEach((leg) => {
            totalDistance += leg.distance?.value || 0;
          });

          // Convert to km and format
          const distanceKm = (totalDistance / 1000).toFixed(1);
          setDistance(`${distanceKm} km`);
          setIsLoading(false);
          setError(null);
        } else {
          setError("Nie udalo sie obliczyc trasy");
          setIsLoading(false);
        }
      });
    };

    // Wait for Google Maps to load
    const checkAndInit = () => {
      if (initMap()) {
        calculateRoute();
        return true;
      }
      return false;
    };

    if (!checkAndInit()) {
      const interval = setInterval(() => {
        if (checkAndInit()) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [from, to, stops]);

  return (
    <div className="relative">
      {/* Loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500 text-sm">Ladowanie trasy...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="absolute inset-0 bg-red-50 rounded-lg flex items-center justify-center z-10">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full h-[350px] rounded-lg"
        style={{ opacity: isLoading ? 0 : 1 }}
      />

      {/* Distance */}
      {distance && !isLoading && (
        <div className="mt-3 flex items-center justify-center gap-2 text-gray-700">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span className="font-medium">Dystans: {distance}</span>
        </div>
      )}
    </div>
  );
}
