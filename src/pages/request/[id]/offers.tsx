import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback, useRef } from "react";
import { getRequestById, getOffersByRequest, RequestData, OfferData } from "@/lib/airtable";
import { useNotifications } from "@/context/NotificationsContext";
import RequestSteps from "@/components/RequestSteps";

interface Props {
  request: RequestData;
  initialOffers: OfferData[];
}

export default function RequestOffersPage({ request, initialOffers }: Props) {
  const router = useRouter();
  const [offers, setOffers] = useState<OfferData[]>(initialOffers);
  const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null);
  const { addNotification } = useNotifications();
  const prevOffersRef = useRef<Set<string>>(new Set(initialOffers.map((o) => o.id)));

  // Logika oparta na statusie REQUESTU, nie ofert
  const isRequestAccepted = ["accepted", "paid", "completed"].includes(request.status);
  const acceptedOffer = isRequestAccepted ? offers.find((o) => o.status === 2) : null;
  const pendingOffers = offers.filter((o) => o.status === 1);

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch(`/api/offers?requestId=${request.id}`);
      if (res.ok) {
        const data: OfferData[] = await res.json();

        const newOffers = data.filter((o) => !prevOffersRef.current.has(o.id));

        if (newOffers.length > 0) {
          newOffers.forEach((offer) => {
            addNotification({
              type: "new_offer",
              title: "Nowa oferta!",
              message: `${offer.driverName || "Kierowca"} zlozyl oferte: ${offer.price} PLN`,
              link: `/request/${request.id}/offers`,
            });
          });
        }

        prevOffersRef.current = new Set(data.map((o) => o.id));
        setOffers(data);
      }
    } catch {
      // Ignore errors silently
    }
  }, [request.id, addNotification]);

  // Auto-refresh co 5 sekund gdy czekamy na oferty (tylko dla published)
  useEffect(() => {
    if (isRequestAccepted) return;

    const interval = setInterval(() => {
      fetchOffers();
    }, 5000);

    return () => clearInterval(interval);
  }, [isRequestAccepted, fetchOffers]);

  const handleAcceptOffer = async (offerId: string) => {
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
        router.push(`/request/${request.id}/payment`);
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
    } finally {
      setAcceptingOffer(null);
    }
  };

  return (
    <main className="p-4 max-w-[1250px] mx-auto">
      <RequestSteps
        requestId={request.id}
        activeStep={2}
        hasAcceptedOffer={isRequestAccepted}
      />

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

      {/* Oczekiwanie na oferty */}
      {!acceptedOffer && offers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-4" />
          <p className="text-lg">Oczekiwanie na oferty...</p>
          <p className="text-sm text-gray-500 mt-2">
            Automatycznie sprawdzamy co 5 sekund
          </p>
        </div>
      )}

      {/* Lista ofert do wyboru */}
      {!acceptedOffer && pendingOffers.length > 0 && (
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
                <button
                  onClick={() => handleAcceptOffer(offer.id)}
                  disabled={acceptingOffer === offer.id}
                  className="border border-green-600 bg-green-600 text-white px-4 py-2 disabled:opacity-50"
                >
                  {acceptingOffer === offer.id ? "Akceptowanie..." : "Akceptuj"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const id = params?.id as string;

  const request = await getRequestById(id);

  if (!request) {
    return { notFound: true };
  }

  const initialOffers = await getOffersByRequest(id);

  return {
    props: {
      request,
      initialOffers,
    },
  };
};
