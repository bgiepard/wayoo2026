import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { Place } from "@/models";
import { MapPin } from "iconoir-react";

interface PlaceAutocompleteProps {
  value: Place;
  onChange: (place: Place) => void;
  placeholder: string;
  id?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  inputClassName?: string;
  types?: string[];
  onRawPlace?: (place: google.maps.places.PlaceResult) => void;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const emptyPlace: Place = {
  address: "",
  placeId: "",
  lat: 0,
  lng: 0,
};

export default function PlaceAutocomplete({
  value,
  onChange,
  placeholder,
  id,
  icon,
  disabled = false,
  inputClassName,
  types = ["geocode", "establishment"],
  onRawPlace,
}: PlaceAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value.address);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const dummyDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setInputValue(value.address);
  }, [value.address]);

  useEffect(() => {
    const initServices = () => {
      if (typeof window !== "undefined" && window.google?.maps?.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        if (!dummyDivRef.current) {
          dummyDivRef.current = document.createElement("div");
        }
        placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDivRef.current);
        return true;
      }
      return false;
    };

    if (!initServices()) {
      const interval = setInterval(() => {
        if (initServices()) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!dropdownRef.current?.contains(target) && !portalRef.current?.contains(target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      if (!autocompleteServiceRef.current) {
        if (typeof window !== "undefined" && window.google?.maps?.places) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        } else {
          return;
        }
      }

      setIsLoading(true);
      try {
        autocompleteServiceRef.current.getPlacePredictions(
          { input: query, componentRestrictions: { country: "pl" }, language: "pl", types },
          (predictions, status) => {
            setIsLoading(false);
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions as PlacePrediction[]);
            } else {
              setSuggestions([]);
            }
          }
        );
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [types]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowDropdown(true);
    if (value.placeId) onChange({ ...emptyPlace, address: newValue });

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => fetchSuggestions(newValue), 300);
  };

  const handleSelect = (prediction: PlacePrediction) => {
    setInputValue(prediction.description);
    setSuggestions([]);
    setShowDropdown(false);

    if (!placesServiceRef.current) {
      if (!dummyDivRef.current) dummyDivRef.current = document.createElement("div");
      placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDivRef.current);
    }

    placesServiceRef.current.getDetails(
      { placeId: prediction.place_id, fields: ["geometry", "formatted_address", "place_id", "address_components", "types"] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          onChange({
            address: place.formatted_address || prediction.description,
            placeId: place.place_id || prediction.place_id,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
          onRawPlace?.(place);
        } else {
          onChange({ address: prediction.description, placeId: prediction.place_id, lat: 0, lng: 0 });
        }
      }
    );
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const hasLeftContent = !!icon;

  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({ position: "fixed", top: rect.bottom + 8, left: rect.left, width: rect.width, zIndex: 9999 });
  }, []);

  useEffect(() => {
    if (showDropdown) updateDropdownPosition();
  }, [showDropdown, updateDropdownPosition]);

  const dropdownContent =
    (suggestions.length > 0 || isLoading) && showDropdown ? (
      <div
        ref={portalRef}
        data-cy="place-suggestions"
        style={{ ...dropdownStyle, boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)" }}
        className="bg-white rounded-[14px] border border-[#E8E9EC] overflow-hidden max-h-[300px] overflow-y-auto"
      >
        {isLoading && suggestions.length === 0 ? (
          <div className="px-4 py-4 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-[#D0D7F0] border-t-[#0B298F] animate-spin shrink-0" />
            <span className="text-[13px] text-tertiary">Szukam lokalizacji…</span>
          </div>
        ) : (
          <div className="py-1.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-3 py-2.5 hover:bg-[#F5F7FF] transition-colors group flex items-center gap-3 mx-0"
              >
                <div className="w-8 h-8 rounded-full bg-[#F4F5F7] group-hover:bg-accent-soft flex items-center justify-center shrink-0 transition-colors">
                  <MapPin width={14} height={14} color="#9B9DA3" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-[500] text-ink truncate leading-snug">
                    {suggestion.structured_formatting.main_text}
                  </p>
                  {suggestion.structured_formatting.secondary_text && (
                    <p className="text-[12px] text-tertiary truncate leading-snug mt-[1px]">
                      {suggestion.structured_formatting.secondary_text}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    ) : null;

  return (
    <div className="relative flex-1 min-w-0" ref={dropdownRef}>
      <div className="relative">
        {hasLeftContent && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center text-secondary">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInput}
          onFocus={() => { setShowDropdown(true); updateDropdownPosition(); }}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClassName || `w-full ${hasLeftContent ? "pl-10" : "pl-4"} pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
      </div>
      {typeof document !== "undefined" && dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  );
}
