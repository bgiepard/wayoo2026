import { useState, useRef, useEffect, useCallback } from "react";

interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function PlaceAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  icon,
  disabled = false,
}: PlaceAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  // Initialize Google Places Autocomplete Service
  useEffect(() => {
    const initService = () => {
      if (typeof window !== "undefined" && window.google?.maps?.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        return true;
      }
      return false;
    };

    if (!initService()) {
      // Retry initialization if Google Maps not loaded yet
      const interval = setInterval(() => {
        if (initService()) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (!autocompleteServiceRef.current) {
      // Try to initialize again
      if (typeof window !== "undefined" && window.google?.maps?.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      } else {
        console.error("Google Places API not loaded");
        return;
      }
    }

    setIsLoading(true);
    try {
      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        componentRestrictions: { country: "pl" },
        language: "pl",
        types: ["geocode", "establishment"],
      };

      autocompleteServiceRef.current.getPlacePredictions(
        request,
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
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    setShowDropdown(true);

    // Debounce API calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);
  };

  const handleSelect = (prediction: PlacePrediction) => {
    const placeName = prediction.description;
    onChange(placeName);
    setSuggestions([]);
    setShowDropdown(false);
    if (onSelect) {
      onSelect(placeName);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 z-10">
            {icon}
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[250px] overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-blue-500 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  {suggestion.structured_formatting.secondary_text && (
                    <div className="text-sm text-gray-500 truncate">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-3 text-center text-gray-500 text-sm">
          Wyszukiwanie...
        </div>
      )}
    </div>
  );
}
