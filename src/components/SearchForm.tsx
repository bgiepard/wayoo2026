import { useState } from "react";
import { useRouter } from "next/router";
import RouteModal from "./RouteModal";
import DateTimeModal from "./DateTimeModal";
import PassengersModal from "./PassengersModal";
import OptionsModal from "./OptionsModal";
import type { SearchData, Options } from "@/models";

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
    from: "",
    to: "",
    date: "",
    time: "",
    adults: 1,
    children: 0,
    options: defaultOptions,
  });

  const [activeModal, setActiveModal] = useState<"route" | "datetime" | "passengers" | "options" | null>(null);
  const [errors, setErrors] = useState<{ route?: boolean; datetime?: boolean }>({});

  const handleRouteChange = (from: string, to: string) => {
    setData({ ...data, from, to });
    if (from && to) setErrors((prev) => ({ ...prev, route: false }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { route?: boolean; datetime?: boolean } = {};
    if (!data.from || !data.to) newErrors.route = true;
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

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <button
          type="button"
          onClick={() => setActiveModal("route")}
          className={`${buttonBase} flex-1 ${errors.route ? buttonError : ""}`}
        >
          <span className="text-gray-400 text-xs block mb-1">Trasa</span>
          {data.from && data.to ? `${data.from} → ${data.to}` : <span className="text-gray-400">Wybierz</span>}
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
