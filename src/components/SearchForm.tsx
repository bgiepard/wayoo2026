import { useState } from "react";
import { useRouter } from "next/router";
import RouteModal from "./RouteModal";
import DateTimeModal from "./DateTimeModal";
import PassengersModal from "./PassengersModal";
import OptionsModal from "./OptionsModal";
import type { SearchData, Options, Route, Place } from "@/models";
import { emptyRoute } from "@/models";

const mockPlaces: Place[] = [
  { address: "Warszawa, Polska", placeId: "mock-warszawa", lat: 52.2297, lng: 21.0122 },
  { address: "Krakow, Polska", placeId: "mock-krakow", lat: 50.0647, lng: 19.945 },
  { address: "Gdansk, Polska", placeId: "mock-gdansk", lat: 54.352, lng: 18.6466 },
  { address: "Wroclaw, Polska", placeId: "mock-wroclaw", lat: 51.1079, lng: 17.0385 },
  { address: "Poznan, Polska", placeId: "mock-poznan", lat: 52.4064, lng: 16.9252 },
  { address: "Lodz, Polska", placeId: "mock-lodz", lat: 51.7592, lng: 19.456 },
  { address: "Szczecin, Polska", placeId: "mock-szczecin", lat: 53.4285, lng: 14.5528 },
  { address: "Lublin, Polska", placeId: "mock-lublin", lat: 51.2465, lng: 22.5684 },
  { address: "Katowice, Polska", placeId: "mock-katowice", lat: 50.2649, lng: 19.0238 },
  { address: "Bialystok, Polska", placeId: "mock-bialystok", lat: 53.1325, lng: 23.1688 },
  { address: "Zakopane, Polska", placeId: "mock-zakopane", lat: 49.2992, lng: 19.9496 },
  { address: "Sopot, Polska", placeId: "mock-sopot", lat: 54.4418, lng: 18.5601 },
  { address: "Torun, Polska", placeId: "mock-torun", lat: 53.0138, lng: 18.5984 },
  { address: "Rzeszow, Polska", placeId: "mock-rzeszow", lat: 50.0412, lng: 21.999 },
  { address: "Olsztyn, Polska", placeId: "mock-olsztyn", lat: 53.778, lng: 20.4942 },
];

const getRandomPlace = (exclude: Place[] = []): Place => {
  const excludeIds = exclude.map((p) => p.placeId);
  const available = mockPlaces.filter((p) => !excludeIds.includes(p.placeId));
  return available[Math.floor(Math.random() * available.length)];
};

const getRandomDate = (): string => {
  const today = new Date();
  const daysAhead = Math.floor(Math.random() * 30) + 1;
  today.setDate(today.getDate() + daysAhead);
  return today.toISOString().split("T")[0];
};

const getRandomTime = (): string => {
  const hours = Math.floor(Math.random() * 14) + 6; // 06:00 - 20:00
  const minutes = Math.random() > 0.5 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const defaultOptions: Options = {
  wifi: false,
  wc: false,
  tv: false,
  airConditioning: false,
  powerOutlet: false,
};

export default function SearchForm() {
  const router = useRouter();
  const [data, setData] = useState<SearchData>({
    route: { ...emptyRoute },
    date: "",
    time: "",
    adults: 1,
    children: 0,
    options: defaultOptions,
  });

  const [activeModal, setActiveModal] = useState<"route" | "datetime" | "passengers" | "options" | null>(null);
  const [errors, setErrors] = useState<{ route?: boolean; datetime?: boolean }>({});

  const handleRouteChange = (route: Route) => {
    setData({ ...data, route });
    if (route.origin.address && route.destination.address) {
      setErrors((prev) => ({ ...prev, route: false }));
    }
  };

  const handleDateTimeChange = (date: string, time: string) => {
    setData({ ...data, date, time });
    if (date && time) setErrors((prev) => ({ ...prev, datetime: false }));
  };

  const handlePassengersChange = (adults: number, children: number) => {
    setData({ ...data, adults, children });
  };

  const handleOptionsChange = (options: Options) => {
    setData({ ...data, options });
  };

  const getSelectedOptionsCount = () => {
    return Object.values(data.options).filter(Boolean).length;
  };

  const handleTestRoute = () => {
    const origin = getRandomPlace();
    const destination = getRandomPlace([origin]);
    const waypointsCount = Math.floor(Math.random() * 3); // 0-2 przystanki
    const waypoints: Place[] = [];
    const usedPlaces = [origin, destination];
    for (let i = 0; i < waypointsCount; i++) {
      const wp = getRandomPlace(usedPlaces);
      waypoints.push(wp);
      usedPlaces.push(wp);
    }

    setData({
      route: { origin, destination, waypoints },
      date: getRandomDate(),
      time: getRandomTime(),
      adults: Math.floor(Math.random() * 4) + 1,
      children: Math.floor(Math.random() * 3),
      options: {
        wifi: Math.random() > 0.5,
        wc: Math.random() > 0.5,
        tv: Math.random() > 0.7,
        airConditioning: Math.random() > 0.5,
        powerOutlet: Math.random() > 0.6,
      },
    });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { route?: boolean; datetime?: boolean } = {};
    if (!data.route.origin.address || !data.route.destination.address) newErrors.route = true;
    if (!data.date || !data.time) newErrors.datetime = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    localStorage.setItem("draft_request", JSON.stringify(data));
    router.push("/request/draft/details");
  };

  const buttonBase = "bg-gray-50 hover:bg-gray-100 rounded-lg p-4 text-left text-sm transition-colors";
  const buttonError = "ring-2 ring-red-400";

  const hasRoute = data.route.origin.address && data.route.destination.address;
  const waypointsCount = data.route.waypoints.length;

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <button
          type="button"
          onClick={() => setActiveModal("route")}
          className={`${buttonBase} flex-1 ${errors.route ? buttonError : ""}`}
        >
          <span className="text-gray-400 text-xs block mb-1">Trasa</span>
          {hasRoute ? (
            <span className="truncate block">
              {data.route.origin.address.split(",")[0]}
              {waypointsCount > 0 && ` → ${waypointsCount} przyst.`}
              {" → "}
              {data.route.destination.address.split(",")[0]}
            </span>
          ) : (
            <span className="text-gray-400">Wybierz</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveModal("datetime")}
          className={`${buttonBase} flex-1 ${errors.datetime ? buttonError : ""}`}
        >
          <span className="text-gray-400 text-xs block mb-1">Kiedy</span>
          {data.date && data.time ? `${data.date} ${data.time}` : <span className="text-gray-400">Wybierz</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveModal("passengers")}
          className={`${buttonBase} flex-1`}
        >
          <span className="text-gray-400 text-xs block mb-1">Pasazerowie</span>
          {`${data.adults + data.children} os.`}
        </button>

        <button
          type="button"
          onClick={() => setActiveModal("options")}
          className={`${buttonBase} flex-1`}
        >
          <span className="text-gray-400 text-xs block mb-1">Opcje</span>
          {getSelectedOptionsCount() > 0 ? `${getSelectedOptionsCount()} wybrano` : <span className="text-gray-400">Brak</span>}
        </button>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 font-medium transition-colors"
        >
          Szukaj
        </button>
      </form>

      <button
        type="button"
        onClick={handleTestRoute}
        className="self-start text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
      >
        Testowa trasa
      </button>

      <RouteModal
        isOpen={activeModal === "route"}
        onClose={() => setActiveModal(null)}
        route={data.route}
        onSave={handleRouteChange}
        onNext={() => setActiveModal("datetime")}
      />
      <DateTimeModal
        isOpen={activeModal === "datetime"}
        onClose={() => setActiveModal(null)}
        date={data.date}
        time={data.time}
        onSave={handleDateTimeChange}
        onNext={() => setActiveModal("passengers")}
      />
      <PassengersModal
        isOpen={activeModal === "passengers"}
        onClose={() => setActiveModal(null)}
        adults={data.adults}
        children={data.children}
        onSave={handlePassengersChange}
        onNext={() => setActiveModal("options")}
      />
      <OptionsModal
        isOpen={activeModal === "options"}
        onClose={() => setActiveModal(null)}
        options={data.options}
        onSave={handleOptionsChange}
      />
    </div>
  );
}
