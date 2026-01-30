import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { getRequestById, getOffersByRequest } from "@/services";
import type { RequestData, OfferData } from "@/models";
import RequestSteps from "@/components/RequestSteps";
import { getPusherClient, type NewOfferEvent } from "@/lib/pusher-client";

interface Props {
  request: RequestData;
  initialOffers: OfferData[];
}

export default function RequestOffersPage({ request, initialOffers }: Props) {
  const router = useRouter();
  const [offers, setOffers] = useState<OfferData[]>(initialOffers);
  const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null);

  const isRequestAccepted = ["accepted", "paid", "completed"].includes(request.status);
  const acceptedOffer = isRequestAccepted ? offers.find((o) => o.status === "accepted" || o.status === "paid") : null;
  const pendingOffers = offers.filter((o) => o.status === "new");

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch(`/api/offers?requestId=${request.id}`);
      if (res.ok) {
        const data: OfferData[] = await res.json();
        setOffers(data);
      }
    } catch {
      // Ignore errors silently
    }
  }, [request.id]);

  // Pusher - odśwież listę ofert gdy przyjdzie nowa (powiadomienie obsługuje PusherContext globalnie)
  useEffect(() => {
    if (isRequestAccepted) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`request-${request.id}`);

    channel.bind("new-offer", (_data: NewOfferEvent) => {
      // Odśwież listę ofert z serwera (żeby mieć pełne dane)
      fetchOffers();
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`request-${request.id}`);
    };
  }, [request.id, isRequestAccepted, fetchOffers]);

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
    <main className="py-8 px-4 max-w-[1250px] mx-auto">
      <RequestSteps
        requestId={request.id}
        activeStep={2}
        hasAcceptedOffer={isRequestAccepted}
      />

      <h1 className="text-2xl font-semibold mb-6">Oferty kierowcow</h1>

      {/* Zaakceptowana oferta */}
      {acceptedOffer && (
        <div className="bg-green-50 rounded-lg p-6 mb-6">
          <p className="font-semibold text-green-800 mb-4">Zaakceptowana oferta</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Cena</span>
              <p className="font-semibold text-lg">{acceptedOffer.price} PLN</p>
            </div>
            <div>
              <span className="text-gray-500">Kierowca</span>
              <p className="font-medium">{acceptedOffer.driverName || "Nieznany"}</p>
            </div>
            {acceptedOffer.driverPhone && (
              <div>
                <span className="text-gray-500">Telefon</span>
                <p>{acceptedOffer.driverPhone}</p>
              </div>
            )}
            {acceptedOffer.message && (
              <div className="col-span-2">
                <span className="text-gray-500">Wiadomosc</span>
                <p>{acceptedOffer.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Oczekiwanie na oferty */}
      {!acceptedOffer && offers.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-900 font-medium">Oczekiwanie na oferty...</p>
          <p className="text-sm text-gray-500 mt-1">Powiadomienie pojawi sie automatycznie</p>
        </div>
      )}

      {/* Lista ofert do wyboru */}
      {!acceptedOffer && pendingOffers.length > 0 && (
        <div className="flex flex-col gap-3">
          {pendingOffers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-lg p-5 flex justify-between items-start">
              <div>
                <p className="text-xl font-semibold text-gray-900">{offer.price} PLN</p>
                <p className="text-gray-600 mt-1">{offer.driverName || "Nieznany kierowca"}</p>
                {offer.driverPhone && (
                  <p className="text-sm text-gray-500">Tel: {offer.driverPhone}</p>
                )}
                {offer.message && (
                  <p className="text-sm text-gray-500 mt-2">{offer.message}</p>
                )}
              </div>
              <button
                onClick={() => handleAcceptOffer(offer.id)}
                disabled={acceptingOffer === offer.id}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {acceptingOffer === offer.id ? "Akceptowanie..." : "Akceptuj"}
              </button>
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

  const offers = await getOffersByRequest(id);

  // Upewnij się, że wszystkie wartości są serializowalne (brak undefined)
  const initialOffers = offers.map((offer) => ({
    ...offer,
    message: offer.message || "",
    driverName: offer.driverName || "",
    driverEmail: offer.driverEmail || "",
    driverPhone: offer.driverPhone || "",
  }));

  return {
    props: {
      request,
      initialOffers,
    },
  };
};
