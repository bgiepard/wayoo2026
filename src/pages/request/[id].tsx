import { GetServerSideProps } from "next";
import { useState } from "react";
import { getRequestById, RequestData } from "@/lib/airtable";

const optionLabels: Record<string, string> = {
  wifi: "WiFi",
  wc: "WC",
  tv: "Telewizor",
  airConditioning: "Klimatyzacja",
  powerOutlet: "Gniazdko elektryczne",
};

const steps = [
  { id: 1, label: "Szczegóły zapytania" },
  { id: 2, label: "Oczekiwanie na oferty" },
  { id: 3, label: "Wybierz i ruszaj w drogę" },
];

interface Props {
  request: RequestData | null;
}

export default function RequestPage({ request }: Props) {
  // Domyślnie pokazujemy aktualny status, ale user może kliknąć na step 1
  const [activeView, setActiveView] = useState(request?.status || 2);

  if (!request) {
    return (
      <main className="p-4 max-w-[1250px] mx-auto">
        <p>Nie znaleziono zapytania</p>
      </main>
    );
  }

  const options = JSON.parse(request.options || "{}");
  const selectedOptions = Object.entries(options)
    .filter(([, value]) => value)
    .map(([key]) => optionLabels[key] || key);

  const handleStepClick = (stepId: number) => {
    // Można kliknąć tylko na ukończone kroki lub aktualny
    if (stepId <= request.status) {
      setActiveView(stepId);
    }
  };

  return (
    <main className="p-4 max-w-[1250px] mx-auto">
      {/* Stepy */}
      <div className="flex justify-between mb-8 border border-gray-300 p-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex flex-col items-center ${
                step.id <= request.status ? "cursor-pointer" : ""
              }`}
              onClick={() => handleStepClick(step.id)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  request.status >= step.id
                    ? "bg-gray-800 text-white border-gray-800"
                    : "border-gray-300"
                } ${activeView === step.id ? "ring-2 ring-offset-2 ring-gray-800" : ""}`}
              >
                {step.id}
              </div>
              <span
                className={`text-sm mt-2 ${
                  request.status >= step.id ? "font-medium" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-24 h-0.5 mx-4 ${
                  request.status > step.id ? "bg-gray-800" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Zawartość w zależności od aktywnego widoku */}
      {activeView === 1 && (
        <div>
          <h1 className="text-2xl mb-6">Szczegóły zapytania</h1>
          <p className="text-sm text-gray-500 mb-4">ID: {request.id}</p>

          <div className="border border-gray-300 p-4 flex flex-col gap-4">
            <div className="flex gap-2">
              <span className="font-medium">Trasa:</span>
              <span>{request.from} → {request.to}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium">Data i godzina:</span>
              <span>{request.date} {request.time}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium">Pasażerowie:</span>
              <span>{request.adults} dorosłych, {request.children} dzieci</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium">Dodatkowe opcje:</span>
              <span>{selectedOptions.length > 0 ? selectedOptions.join(", ") : "Brak"}</span>
            </div>
          </div>
        </div>
      )}

      {activeView === 2 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-4" />
          <p className="text-lg">Oczekiwanie na oferty...</p>
          <p className="text-sm text-gray-500 mt-2">
            Powiadomimy Cię gdy pojawią się oferty
          </p>
        </div>
      )}

      {activeView === 3 && (
        <div>
          <h1 className="text-2xl mb-6">Wybierz i ruszaj w drogę</h1>
          <p className="text-gray-500">Lista ofert pojawi się tutaj...</p>
        </div>
      )}
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const id = params?.id as string;

  const request = await getRequestById(id);

  return {
    props: {
      request,
    },
  };
};
