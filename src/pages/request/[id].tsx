import { GetServerSideProps } from "next";
import { useState, useEffect, useCallback } from "react";
import { getRequestById, RequestData, OfferData } from "@/lib/airtable";

const optionLabels: Record<string, string> = {
  wifi: "WiFi",
  wc: "WC",
  tv: "Telewizor",
  airConditioning: "Klimatyzacja",
  powerOutlet: "Gniazdko elektryczne",
};

const steps = [
  { id: 1, label: "Szczegoly zapytania" },
  { id: 2, label: "Oczekiwanie na oferty" },
  { id: 3, label: "Oferty" },
];

interface Props {
  request: RequestData | null;
}

export default function RequestPage({ request: initialRequest }: Props) {
  const [request, setRequest] = useState(initialRequest);
  const [activeView, setActiveView] = useState(
    initialRequest?.status === 4 ? 3 : (initialRequest?.status || 2)
  );
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    if (!request) return;
    setLoadingOffers(true);
    try {
      const res = await fetch(`/api/offers?requestId=${request.id}`);
      if (res.ok) {
        const data = await res.json();
        setOffers(data);

        // Jeśli są oferty i status jest 2, przejdź do kroku 3
        if (data.length > 0 && request.status === 2) {
          setRequest({ ...request, status: 3 });
          setActiveView(3);
        }
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoadingOffers(false);
    }
  }, [request]);

  // Pobierz oferty przy pierwszym renderze
  useEffect(() => {
    if (request) {
      fetchOffers();
    }
  }, [request?.id]);

  // Auto-refresh co 5 sekund gdy czekamy na oferty (status 2)
  useEffect(() => {
    if (!request || request.status !== 2) return;

    const interval = setInterval(() => {
      fetchOffers();
    }, 5000);

    return () => clearInterval(interval);
  }, [request?.id, request?.status, fetchOffers]);

  const handleAcceptOffer = async (offerId: string) => {
    if (!request) return;
    setAcceptingOffer(offerId);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          offerId,
          requestId: request.id,
        }),
      });

      if (res.ok) {
        setRequest({ ...request, status: 4 });
        fetchOffers();
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
    } finally {
      setAcceptingOffer(null);
    }
  };

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
    const maxStep = request.status === 4 ? 3 : request.status;
    if (stepId <= maxStep) {
      setActiveView(stepId);
    }
  };

  const acceptedOffer = offers.find((o) => o.status === 2);
  const pendingOffers = offers.filter((o) => o.status === 1);

  const getStepStatus = (stepId: number) => {
    const effectiveStatus = request.status === 4 ? 3 : request.status;
    return effectiveStatus >= stepId;
  };

  return (
    <main className="p-4 max-w-[1250px] mx-auto">
      {/* Stepy */}
      <div className="flex justify-between mb-8 border border-gray-300 p-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex flex-col items-center ${
                getStepStatus(step.id) ? "cursor-pointer" : ""
              }`}
              onClick={() => handleStepClick(step.id)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  getStepStatus(step.id)
                    ? "bg-gray-800 text-white border-gray-800"
                    : "border-gray-300"
                } ${activeView === step.id ? "ring-2 ring-offset-2 ring-gray-800" : ""}`}
              >
                {step.id}
              </div>
              <span
                className={`text-sm mt-2 ${
                  getStepStatus(step.id) ? "font-medium" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-24 h-0.5 mx-4 ${
                  getStepStatus(step.id + 1) ? "bg-gray-800" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Zawartość w zależności od aktywnego widoku */}
      {activeView === 1 && (
        <div>
          <h1 className="text-2xl mb-6">Szczegoly zapytania</h1>
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
              <span className="font-medium">Pasazerowie:</span>
              <span>{request.adults} doroslych, {request.children} dzieci</span>
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
            Automatycznie sprawdzamy co 5 sekund
          </p>
        </div>
      )}

      {activeView === 3 && (
        <div>
          <h1 className="text-2xl mb-6">Oferty kierowcow</h1>

          {/* Zaakceptowana oferta */}
          {acceptedOffer && (
            <div className="border border-green-300 bg-green-50 p-4 mb-6">
              <p className="font-bold text-lg text-green-800 mb-4">
                Zaakceptowana oferta
              </p>
              <div className="flex flex-col gap-2">
                <p>
                  <span className="font-medium">Cena:</span> {acceptedOffer.price} PLN
                </p>
                <p>
                  <span className="font-medium">Kierowca:</span>{" "}
                  {acceptedOffer.driverName || "Nieznany"}
                </p>
                {acceptedOffer.driverEmail && (
                  <p>
                    <span className="font-medium">Email:</span> {acceptedOffer.driverEmail}
                  </p>
                )}
                {acceptedOffer.driverPhone && (
                  <p>
                    <span className="font-medium">Telefon:</span> {acceptedOffer.driverPhone}
                  </p>
                )}
                {acceptedOffer.message && (
                  <p>
                    <span className="font-medium">Wiadomosc:</span> {acceptedOffer.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Oczekujące oferty */}
          {loadingOffers ? (
            <p>Ladowanie ofert...</p>
          ) : pendingOffers.length === 0 && !acceptedOffer ? (
            <p className="text-gray-500">Brak ofert</p>
          ) : pendingOffers.length > 0 && (
            <>
              {acceptedOffer && (
                <h2 className="text-lg font-medium mb-4">Pozostale oferty</h2>
              )}
              <div className="flex flex-col gap-4">
                {pendingOffers.map((offer) => (
                  <div key={offer.id} className="border border-gray-300 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg">{offer.price} PLN</p>
                        <p className="text-gray-600">
                          Kierowca: {offer.driverName || "Nieznany"}
                        </p>
                        {offer.driverPhone && (
                          <p className="text-gray-600">Tel: {offer.driverPhone}</p>
                        )}
                        {offer.message && (
                          <p className="text-gray-600 mt-2">
                            Wiadomosc: {offer.message}
                          </p>
                        )}
                      </div>
                      {!acceptedOffer && (
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          disabled={acceptingOffer === offer.id}
                          className="border border-green-600 bg-green-600 text-white px-4 py-2 disabled:opacity-50"
                        >
                          {acceptingOffer === offer.id ? "Akceptowanie..." : "Akceptuj"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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
