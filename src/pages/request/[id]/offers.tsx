import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { getRequestById, getOffersByRequest } from "@/services";
import type { RequestData, OfferData } from "@/models";
import RequestSteps from "@/components/RequestSteps";
import { getPusherClient, type NewOfferEvent } from "@/lib/pusher-client";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/icons";

// Funkcja do zakropkowania imienia i nazwiska
function maskName(name?: string): string {
  if (!name) return "Kierowca";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    // Tylko imię
    const firstName = parts[0];
    if (firstName.length <= 2) return firstName + "***";
    return firstName[0] + firstName[1] + "***";
  }
  // Imię i nazwisko
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const maskedFirst = firstName.length > 2 ? firstName[0] + firstName[1] + "***" : firstName + "***";
  const maskedLast = lastName.length > 1 ? lastName[0] + "***" : "***";
  return `${maskedFirst} ${maskedLast}`;
}

const vehicleTypeLabels: Record<string, string> = {
  bus: "Autobus",
  minibus: "Minibus",
  van: "Van",
  car: "Samochód",
};

interface Props {
  request: RequestData;
  initialOffers: OfferData[];
}

export default function RequestOffersPage({ request, initialOffers }: Props) {
  const router = useRouter();
  const [offers, setOffers] = useState<OfferData[]>(initialOffers);
  const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);

  const openLightbox = (photos: string[], index: number) => {
    setLightbox({ photos, index });
  };

  const closeLightbox = () => {
    setLightbox(null);
  };

  const lightboxPrev = () => {
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      index: (lightbox.index - 1 + lightbox.photos.length) % lightbox.photos.length,
    });
  };

  const lightboxNext = () => {
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      index: (lightbox.index + 1) % lightbox.photos.length,
    });
  };

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

          {/* Pojazd */}
          {acceptedOffer.vehicle && (
            <div className="mb-4 p-4 bg-white rounded-lg">
              <div className="flex gap-3">
                {acceptedOffer.vehicle.photos && acceptedOffer.vehicle.photos.length > 0 && (
                  <div className="flex gap-1.5">
                    {acceptedOffer.vehicle.photos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => openLightbox(acceptedOffer.vehicle!.photos, idx)}
                        className="w-12 h-12 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={photo}
                          alt={acceptedOffer.vehicle?.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{acceptedOffer.vehicle.name}</p>
                  <p className="text-sm text-gray-600">
                    {acceptedOffer.vehicle.brand} {acceptedOffer.vehicle.model} • {vehicleTypeLabels[acceptedOffer.vehicle.type] || acceptedOffer.vehicle.type}
                  </p>
                  <p className="text-sm text-gray-500">{acceptedOffer.vehicle.seats} miejsc</p>
                  <div className="flex gap-2 mt-2">
                    {acceptedOffer.vehicle.hasWifi && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">WiFi</span>}
                    {acceptedOffer.vehicle.hasWC && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">WC</span>}
                    {acceptedOffer.vehicle.hasTV && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">TV</span>}
                    {acceptedOffer.vehicle.hasAirConditioning && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Klimatyzacja</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

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
        <div className="flex flex-col gap-4">
          {pendingOffers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-lg p-5">
              {/* Pojazd */}
              {offer.vehicle && (
                <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
                  {offer.vehicle.photos && offer.vehicle.photos.length > 0 && (
                    <div className="flex gap-1.5">
                      {offer.vehicle.photos.map((photo, idx) => (
                        <button
                          key={idx}
                          onClick={() => openLightbox(offer.vehicle!.photos, idx)}
                          className="w-10 h-10 rounded-lg overflow-hidden hover:opacity-80 transition-opacity flex-shrink-0"
                        >
                          <img
                            src={photo}
                            alt={offer.vehicle?.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{offer.vehicle.name}</p>
                    <p className="text-sm text-gray-600">
                      {offer.vehicle.brand} {offer.vehicle.model} • {vehicleTypeLabels[offer.vehicle.type] || offer.vehicle.type}
                    </p>
                    <p className="text-sm text-gray-500">{offer.vehicle.seats} miejsc</p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {offer.vehicle.hasWifi && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">WiFi</span>}
                      {offer.vehicle.hasWC && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">WC</span>}
                      {offer.vehicle.hasTV && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">TV</span>}
                      {offer.vehicle.hasAirConditioning && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">Klima</span>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xl font-semibold text-gray-900">{offer.price} PLN</p>
                  <p className="text-gray-600 mt-1">{maskName(offer.driverName)}</p>
                  {offer.message && (
                    <p className="text-sm text-gray-500 mt-2 italic">&quot;{offer.message}&quot;</p>
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
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <CloseIcon className="w-8 h-8" />
          </button>

          {/* Previous button */}
          {lightbox.photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                lightboxPrev();
              }}
              className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeftIcon className="w-10 h-10" />
            </button>
          )}

          {/* Image */}
          <img
            src={lightbox.photos[lightbox.index]}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next button */}
          {lightbox.photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                lightboxNext();
              }}
              className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRightIcon className="w-10 h-10" />
            </button>
          )}

          {/* Counter */}
          {lightbox.photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {lightbox.index + 1} / {lightbox.photos.length}
            </div>
          )}
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
  const initialOffers = offers.map((offer) => {
    const baseOffer = {
      id: offer.id,
      requestId: offer.requestId,
      driverId: offer.driverId,
      price: offer.price,
      status: offer.status,
      message: offer.message || "",
      driverName: offer.driverName || "",
      driverEmail: offer.driverEmail || "",
      driverPhone: offer.driverPhone || "",
    };

    if (offer.vehicle) {
      return {
        ...baseOffer,
        vehicle: {
          id: offer.vehicle.id,
          name: offer.vehicle.name || "",
          type: offer.vehicle.type || "",
          brand: offer.vehicle.brand || "",
          model: offer.vehicle.model || "",
          year: offer.vehicle.year || 0,
          seats: offer.vehicle.seats || 0,
          photos: offer.vehicle.photos || [],
          hasWifi: offer.vehicle.hasWifi ?? false,
          hasWC: offer.vehicle.hasWC ?? false,
          hasTV: offer.vehicle.hasTV ?? false,
          hasAirConditioning: offer.vehicle.hasAirConditioning ?? false,
        },
      };
    }

    return baseOffer;
  });

  return {
    props: {
      request,
      initialOffers,
    },
  };
};
