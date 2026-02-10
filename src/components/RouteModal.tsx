import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import { labelBase, inputBase } from "./ui/modalStyles";
import PlaceAutocomplete from "./PlaceAutocomplete";
import type { Route, Place } from "@/models";
import { emptyPlace } from "@/models";
import { AddIcon, RemoveRouteStopIcon, RouteStartIcon, RouteStopIcon, RouteEndIcon } from "./icons";

const MAX_STOPS = 10;

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route;
  onSave: (route: Route) => void;
  onNext?: () => void;
}

export default function RouteModal({
  isOpen,
  onClose,
  route,
  onSave,
  onNext,
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
    const filteredWaypoints = localWaypoints.filter((wp) => wp.address.trim() !== "");
    onSave({
      origin: localOrigin,
      destination: localDestination,
      waypoints: filteredWaypoints,
    });
    if (onNext) {
      onNext();
    } else {
      onClose();
    }
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
  const isValid = localOrigin.address.trim() !== "" && localDestination.address.trim() !== "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wybierz punkty na trasie"
      width="w-96"
      onConfirm={handleSave}
      confirmDisabled={!isValid}
    >
      <div className="flex flex-col">
        {/* Origin */}
        <div className="mb-6">
          <label htmlFor="route-origin" className={labelBase}>Miejsce wyjazdu</label>
          <PlaceAutocomplete
            id="route-origin"
            value={localOrigin}
            onChange={setLocalOrigin}
            placeholder="Wprowadź adres miejsca wyjazdu"
            icon={<RouteStartIcon className="" />}
            inputClassName={inputBase}
          />
        </div>

        {/* Waypoints */}
        {localWaypoints.map((waypoint, index) => (
          <div key={index} className="mb-6">
            <label htmlFor={`route-waypoint-${index}`} className={labelBase}>Przystanek #{index + 1}</label>
            <div className="flex items-center gap-3">
              <PlaceAutocomplete
                id={`route-waypoint-${index}`}
                value={waypoint}
                onChange={(place) => handleWaypointChange(index, place)}
                placeholder={`Przystanek ${index + 1}`}
                icon={<RouteStopIcon className="" />}
                inputClassName={inputBase}
              />
              <button
                type="button"
                onClick={() => handleRemoveWaypoint(index)}
                className="p-3 rounded-lg text-[#5B5E68] hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                title="Usuń przystanek"
              >
                <RemoveRouteStopIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Add Waypoint Button */}
        {canAddWaypoint && (
          <button
            type="button"
            onClick={handleAddWaypoint}
            className="flex items-center gap-2 px-4 py-3 mb-6 text-[#0B298F] font-[600] hover:bg-gray-50 rounded-lg transition-colors"
          >
            <AddIcon className="w-5 h-5" />
            Dodaj przystanek
          </button>
        )}

        {/* Destination */}
        <div>
          <label htmlFor="route-destination" className={labelBase}>Lokalizacja końcowa</label>
          <PlaceAutocomplete
            id="route-destination"
            value={localDestination}
            onChange={setLocalDestination}
            placeholder="Wprowadź adres lokalizacji końcowej"
            icon={<RouteEndIcon className="w-5 h-5" />}
            inputClassName={inputBase}
          />
        </div>
      </div>
    </Modal>
  );
}
