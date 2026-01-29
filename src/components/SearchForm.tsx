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

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <button
          type="button"
          onClick={() => setActiveModal("route")}
          className={`border p-2 flex-1 text-left ${errors.route ? "border-red-500" : "border-gray-300"}`}
        >
          {data.from && data.to ? `${data.from} → ${data.to}` : "Trasa"}
        </button>

        <button
          type="button"
          onClick={() => setActiveModal("datetime")}
          className={`border p-2 flex-1 text-left ${errors.datetime ? "border-red-500" : "border-gray-300"}`}
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
          {getSelectedOptionsCount() > 0 ? `Opcje (${getSelectedOptionsCount()})` : "Dodatkowe opcje"}
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
