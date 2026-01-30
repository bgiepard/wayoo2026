import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import PlaceAutocomplete from "./PlaceAutocomplete";

const MAX_STOPS = 3;

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  from: string;
  to: string;
  stops?: string[];
  onSave: (from: string, to: string, stops: string[]) => void;
}

export default function RouteModal({
  isOpen,
  onClose,
  from,
  to,
  stops = [],
  onSave,
}: RouteModalProps) {
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);
  const [localStops, setLocalStops] = useState<string[]>(stops);

  useEffect(() => {
    setLocalFrom(from);
    setLocalTo(to);
    setLocalStops(stops);
  }, [from, to, stops]);

  const handleSave = () => {
    // Filter out empty stops
    const filteredStops = localStops.filter((stop) => stop.trim() !== "");
    onSave(localFrom, localTo, filteredStops);
    onClose();
  };

  const handleAddStop = () => {
    if (localStops.length < MAX_STOPS) {
      setLocalStops([...localStops, ""]);
    }
  };

  const handleStopChange = (index: number, value: string) => {
    const newStops = [...localStops];
    newStops[index] = value;
    setLocalStops(newStops);
  };

  const handleRemoveStop = (index: number) => {
    setLocalStops(localStops.filter((_, i) => i !== index));
  };

  const canAddStop = localStops.length < MAX_STOPS;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Trasa" width="w-96">
      <div className="flex flex-col gap-3">
        {/* From */}
        <PlaceAutocomplete
          value={localFrom}
          onChange={setLocalFrom}
          placeholder="Skad"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeWidth={2} d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          }
        />

        {/* Stops */}
        {localStops.map((stop, index) => (
          <div key={index} className="relative">
            <PlaceAutocomplete
              value={stop}
              onChange={(value) => handleStopChange(index, value)}
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
              onClick={() => handleRemoveStop(index)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Usun przystanek"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add Stop Button */}
        {canAddStop && (
          <button
            type="button"
            onClick={handleAddStop}
            className="flex items-center justify-center gap-2 py-2 px-4 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-dashed border-blue-300 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Dodaj przystanek ({localStops.length}/{MAX_STOPS})
          </button>
        )}

        {/* To */}
        <PlaceAutocomplete
          value={localTo}
          onChange={setLocalTo}
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
