import { useEffect, useRef, useState } from "react";
import type { Route } from "@/models";
import { MapIcon } from "./icons";

interface RouteMapProps {
  route: Route;
  height?: string;
  lightTheme?: boolean;
}

const LIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9c9c9" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];

export default function RouteMap({ route, height = "350px", lightTheme = false }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!route.origin.lat || !route.destination.lat) return;

    const initMap = () => {
      if (!window.google?.maps || !mapRef.current) {
        return false;
      }

      // Initialize map centered on Poland
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: 6,
          center: { lat: 52.0, lng: 19.5 },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          ...(lightTheme && { styles: LIGHT_MAP_STYLES }),
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

      // Build waypoints from route waypoints using coordinates
      const waypoints: google.maps.DirectionsWaypoint[] = route.waypoints
        .filter((wp) => wp.lat && wp.lng)
        .map((wp) => ({
          location: new google.maps.LatLng(wp.lat, wp.lng),
          stopover: true,
        }));

      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(route.origin.lat, route.origin.lng),
        destination: new google.maps.LatLng(route.destination.lat, route.destination.lng),
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

    // Reset state
    setIsLoading(true);
    setError(null);
    setDistance(null);

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
  }, [route]);

  // Don't render if no valid coordinates
  if (!route.origin.lat || !route.destination.lat) {
    return (
      <div className="w-full rounded-lg bg-gray-100 flex items-center justify-center" style={{ height }}>
        <span className="text-gray-500 text-sm">Wybierz trase, aby zobaczyc mape</span>
      </div>
    );
  }

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
        className="w-full rounded-lg"
        style={{ height, opacity: isLoading ? 0 : 1 }}
      />

      {/* Distance */}
      {distance && !isLoading && (
        <div className="mt-3 flex items-center justify-center gap-2 text-gray-700">
          <MapIcon className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Dystans: {distance}</span>
        </div>
      )}
    </div>
  );
}
