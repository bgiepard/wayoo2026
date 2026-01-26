import { useState } from "react";
import RouteModal from "./RouteModal";
import DateTimeModal from "./DateTimeModal";
import PassengersModal from "./PassengersModal";
import OptionsModal, { Options } from "./OptionsModal";

export interface SearchData {
  from: string;
  to: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  options: Options;
}

export default function SearchForm() {
  const [data, setData] = useState<SearchData>({
    from: "",
    to: "",
    date: "",
    time: "",
    adults: 1,
    children: 0,
    options: {
      wifi: false,
      wc: false,
      tv: false,
      airConditioning: false,
      powerOutlet: false,
    },
  });

  const [activeModal, setActiveModal] = useState<"route" | "datetime" | "passengers" | "options" | null>(null);

  const handleRouteChange = (from: string, to: string) => {
    setData({ ...data, from, to });
  };

  const handleDateTimeChange = (date: string, time: string) => {
    setData({ ...data, date, time });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search data:", data);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <button
          type="button"
          onClick={() => setActiveModal("route")}
          className="border border-gray-300 p-2 flex-1 text-left"
        >
          {data.from && data.to ? `${data.from} → ${data.to}` : "Trasa"}
        </button>

        <button
          type="button"
          onClick={() => setActiveModal("datetime")}
          className="border border-gray-300 p-2 flex-1 text-left"
        >
          {data.date && data.time ? `${data.date} ${data.time}` : "Data i godzina"}
        </button>

        <button
          type="button"
          onClick={() => setActiveModal("passengers")}
          className="border border-gray-300 p-2 flex-1 text-left"
        >
          {`${data.adults} dorosłych, ${data.children} dzieci`}
        </button>

        <button
          type="button"
          onClick={() => setActiveModal("options")}
          className="border border-gray-300 p-2 flex-1 text-left"
        >
          {getSelectedOptionsCount() > 0
            ? `Opcje (${getSelectedOptionsCount()})`
            : "Dodatkowe opcje"}
        </button>

        <button type="submit" className="border border-gray-300 p-2">
          Szukaj
        </button>
      </form>

      <RouteModal
        isOpen={activeModal === "route"}
        onClose={() => setActiveModal(null)}
        from={data.from}
        to={data.to}
        onSave={handleRouteChange}
      />

      <DateTimeModal
        isOpen={activeModal === "datetime"}
        onClose={() => setActiveModal(null)}
        date={data.date}
        time={data.time}
        onSave={handleDateTimeChange}
      />

      <PassengersModal
        isOpen={activeModal === "passengers"}
        onClose={() => setActiveModal(null)}
        adults={data.adults}
        children={data.children}
        onSave={handlePassengersChange}
      />

      <OptionsModal
        isOpen={activeModal === "options"}
        onClose={() => setActiveModal(null)}
        options={data.options}
        onSave={handleOptionsChange}
      />
    </>
  );
}
