import { useState, useEffect } from "react";
import { CloseIcon } from "./icons";
import PlaceAutocomplete from "./PlaceAutocomplete";
import type { Route, Place } from "@/models";
import { emptyPlace } from "@/models";
import { MapPin, TriangleFlag } from "iconoir-react";

const MAX_STOPS = 10;

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route;
  onSave: (route: Route) => void;
  onNext?: () => void;
  confirmLabel?: string;
}

const inputCls =
  "w-full px-4 py-[13px] text-[14px] text-[#010101] bg-white border border-[#E5E7EB] rounded-[10px] " +
  "focus:border-[#0B298F] focus:ring-2 focus:ring-[#0B298F]/10 outline-none transition-all placeholder:text-[#9B9DA3]";

// Linia łącząca — paddingLeft centruje ją dokładnie pod ikonką (w-9 = 36px → center 18px, line w-[2px] → center 1px → PL = 17px)
const Connector = () => (
  <div style={{ paddingLeft: "17px" }}>
    <div className="w-[2px] h-5 bg-[#E8EBF5] rounded-full" />
  </div>
);

export default function RouteModal({
  isOpen,
  onClose,
  route,
  onSave,
  onNext,
  confirmLabel,
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
    onSave({ origin: localOrigin, destination: localDestination, waypoints: filteredWaypoints });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
      <div className="bg-white shadow-2xl flex flex-col w-full h-full md:h-auto md:rounded-[20px] md:w-full md:max-w-[520px] overflow-hidden">

        {/* Nagłówek */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-[#F0F1F3]">
          <div>
            <h2 className="text-[#010101] text-[18px] font-[600]">Punkty trasy</h2>
            <p className="text-[#9B9DA3] text-[13px] mt-0.5">Wybierz skąd i dokąd jedziesz</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9B9DA3] hover:text-[#5B5E68] p-1.5 rounded-full hover:bg-[#F0F1F3] transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Treść — timeline trasy */}
        <div className="flex-1 overflow-y-auto px-7 py-6">

          {/* Punkt startowy */}
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-[#0B298F] flex items-center justify-center shrink-0 shadow-sm shadow-[#0B298F]/30">
              <MapPin width={16} height={16} color="white" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <PlaceAutocomplete
                id="route-origin"
                value={localOrigin}
                onChange={setLocalOrigin}
                placeholder="Skąd jedziesz?"
                inputClassName={inputCls}
              />
            </div>
          </div>

          <Connector />

          {/* Przystanki */}
          {localWaypoints.map((waypoint, index) => (
            <div key={index}>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-[#F0F4FF] border border-[#D0D9F5] flex items-center justify-center shrink-0">
                  <MapPin width={14} height={14} color="#6B7FD4" strokeWidth={2} />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <PlaceAutocomplete
                    id={`route-waypoint-${index}`}
                    value={waypoint}
                    onChange={(place) => handleWaypointChange(index, place)}
                    placeholder={`Przystanek ${index + 1}`}
                    inputClassName={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveWaypoint(index)}
                    className="w-9 h-9 flex items-center justify-center text-[#C0C1C5] hover:text-red-400 hover:bg-red-50 rounded-full transition-colors shrink-0"
                    title="Usuń przystanek"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <Connector />
            </div>
          ))}

          {/* Punkt końcowy */}
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-[#0B298F] flex items-center justify-center shrink-0 shadow-sm shadow-[#0B298F]/30">
              <TriangleFlag width={16} height={16} color="white" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <PlaceAutocomplete
                id="route-destination"
                value={localDestination}
                onChange={setLocalDestination}
                placeholder="Dokąd jedziesz?"
                inputClassName={inputCls}
              />
            </div>
          </div>

        </div>

        {/* Stopka */}
        <div className="px-7 pb-6 pt-4 border-t border-[#F0F1F3]">
          {canAddWaypoint && (
            <button
              type="button"
              data-cy="btn-add-waypoint"
              onClick={handleAddWaypoint}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 mb-3
                         text-[#0B298F] text-[14px] font-[500]
                         hover:bg-[#F0F4FF] rounded-[8px] transition-colors
                         border border-dashed border-[#C7D2F6]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Dodaj przystanek
            </button>
          )}
          <button
            data-cy="btn-modal-confirm"
            onClick={handleSave}
            disabled={!isValid}
            className="w-full py-3 rounded-[10px] text-white text-[15px] font-[600] transition-all"
            style={{ backgroundColor: isValid ? "#0B298F" : "#D9DADC" }}
          >
            {confirmLabel || "Potwierdź"}
          </button>
        </div>

      </div>
    </div>
  );
}
