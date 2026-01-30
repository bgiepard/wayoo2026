import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import PlaceAutocomplete from "./PlaceAutocomplete";
import type { Route, Place } from "@/models";
import { emptyPlace } from "@/models";

const MAX_STOPS = 3;

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route;
  onSave: (route: Route) => void;
}

export default function RouteModal({
  isOpen,
  onClose,
  route,
  onSave,
}: RouteModalProps) {
  const [localOrigin, setLocalOrigin] = useState<Place>(route.origin);
  const [localDestination, setLocalDestination] = useState<Place>(route.destination);
  const [localWaypoints, setLocalWaypoints] = useState<Place[]>(route.waypoints);

  useEffect(() => {
    setLocalOrigin(route.origin);
    setLocalDestination(route.destination);
    setLocalWaypoints(route.waypoints);
  }, [route]);

  const handleSave = () => {
    // Filter out empty waypoints
    const filteredWaypoints = localWaypoints.filter((wp) => wp.address.trim() !== "");
    onSave({
      origin: localOrigin,
      destination: localDestination,
      waypoints: filteredWaypoints,
    });
    onClose();
  };

  const handleAddWaypoint = () => {
    if (localWaypoints.length < MAX_STOPS) {
      setLocalWaypoints([...localWaypoints, { ...emptyPlace }]);
    }
  };

  const handleWaypointChange = (index: number, place: Place) => {
    const newWaypoints = [...localWaypoints];
    newWaypoints[index] = place;
    setLocalWaypoints(newWaypoints);
  };

  const handleRemoveWaypoint = (index: number) => {
    setLocalWaypoints(localWaypoints.filter((_, i) => i !== index));
  };

  const canAddWaypoint = localWaypoints.length < MAX_STOPS;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Trasa" width="w-96">
      <div className="flex flex-col gap-3">
        {/* Origin */}
        <PlaceAutocomplete
          value={localOrigin}
          onChange={setLocalOrigin}
          placeholder="Skad"
          showLocateButton
        />

        {/* Waypoints */}
        {localWaypoints.map((waypoint, index) => (
          <div key={index} className="relative">
            <PlaceAutocomplete
              value={waypoint}
              onChange={(place) => handleWaypointChange(index, place)}
              placeholder={`Przystanek ${index + 1}`}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <button
              type="button"
              onClick={() => handleRemoveWaypoint(index)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Usun przystanek"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add Waypoint Button */}
        {canAddWaypoint && (
          <button
            type="button"
            onClick={handleAddWaypoint}
            className="flex items-center justify-center gap-2 py-2 px-4 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-dashed border-blue-300 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Dodaj przystanek ({localWaypoints.length}/{MAX_STOPS})
          </button>
        )}

        {/* Destination */}
        <PlaceAutocomplete
          value={localDestination}
          onChange={setLocalDestination}
          placeholder="Dokad"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 text-sm font-medium mt-2 transition-colors"
        >
          Zapisz
        </button>
      </div>
    </Modal>
  );
}
