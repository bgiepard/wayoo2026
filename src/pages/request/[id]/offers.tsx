import {GetServerSideProps} from "next";
import {useRouter} from "next/router";
import {useState, useEffect, useCallback} from "react";
import {getRequestById, getOffersByRequest} from "@/services";
import type {RequestData, OfferData} from "@/models";
import RequestSteps from "@/components/RequestSteps";
import {getPusherClient, type NewOfferEvent} from "@/lib/pusher-client";
import {ChevronLeftIcon, ChevronRightIcon, CloseIcon} from "@/components/icons";

function maskName(name?: string): string {
    if (!name) return "Kierowca";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
        const firstName = parts[0];
        if (firstName.length <= 2) return firstName + "***";
        return firstName[0] + firstName[1] + "***";
    }
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

const featureBadge = "text-[12px] bg-[#EEF2FF] text-[#0B298F] px-2 py-0.5 rounded-[4px] font-[500]";
const card = "bg-white rounded-[8px] border border-[#D9DADC]";

interface Props {
    request: RequestData;
    initialOffers: OfferData[];
}

export default function RequestOffersPage({request, initialOffers}: Props) {
    const router = useRouter();
    const [offers, setOffers] = useState<OfferData[]>(initialOffers);
    const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null);
    const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);

    const openLightbox = (photos: string[], index: number) => setLightbox({photos, index});
    const closeLightbox = () => setLightbox(null);

    const lightboxPrev = () => {
        if (!lightbox) return;
        setLightbox({...lightbox, index: (lightbox.index - 1 + lightbox.photos.length) % lightbox.photos.length});
    };

    const lightboxNext = () => {
        if (!lightbox) return;
        setLightbox({...lightbox, index: (lightbox.index + 1) % lightbox.photos.length});
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

    // Pusher real-time + polling jako fallback
    useEffect(() => {
        if (isRequestAccepted) return;

        const pusher = getPusherClient();
        const channel = pusher.subscribe(`request-${request.id}`);

        const handler = (_data: NewOfferEvent) => {
            fetchOffers();
        };

        channel.bind("new-offer", handler);

        // Polling co 15s jako fallback gdyby Pusher nie dostarczyl eventu
        const interval = setInterval(fetchOffers, 15000);

        return () => {
            channel.unbind("new-offer", handler);
            clearInterval(interval);
        };
    }, [request.id, isRequestAccepted, fetchOffers]);

    const handleAcceptOffer = async (offerId: string) => {
        setAcceptingOffer(offerId);
        try {
            const res = await fetch("/api/offers", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({action: "accept", offerId, requestId: request.id}),
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
        <main className="pb-12 px-4 max-w-[1250px] mx-auto">
            <RequestSteps
                requestId={request.id}
                activeStep={2}
                hasAcceptedOffer={isRequestAccepted}
            />

            {acceptedOffer ? (
                <>
                    <h1 className="text-center text-[#0B298F] text-[26px] font-[400] mb-3">
                        Oferta została zaakceptowana
                    </h1>
                    <h2 className="text-center text-[#5B5E68] text-[16px] font-[400] mb-12">
                        Przejdź do płatności, aby potwierdzić rezerwację.
                    </h2>
                </>
            ) : pendingOffers.length > 0 ? (
                <>
                    <h1 className="text-center text-[#0B298F] text-[26px] font-[400] mb-3">
                        Oferty przewoźników
                    </h1>
                    <h2 className="text-center text-[#5B5E68] text-[16px] font-[400] mb-12">
                        Przeglądaj oferty i wybierz najlepszą dla siebie.
                    </h2>
                </>
            ) : (
                <div className="mb-12" />
            )}

            {/* Zaakceptowana oferta */}
            {acceptedOffer && (
                <div className="bg-[#E6F6EC] rounded-[8px] p-8 border border-[#01A83D]">
                    {/* Pojazd */}
                    {acceptedOffer.vehicle && (
                        <div className="flex gap-5 mb-6 pb-6 border-b border-[#01A83D]/20">
                            {acceptedOffer.vehicle.photos && acceptedOffer.vehicle.photos.length > 0 && (
                                <div className="flex gap-2 shrink-0">
                                    {acceptedOffer.vehicle.photos.slice(0, 3).map((photo, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => openLightbox(acceptedOffer.vehicle!.photos, idx)}
                                            className="w-[80px] h-[80px] rounded-[8px] overflow-hidden hover:opacity-80 transition-opacity"
                                        >
                                            <img src={photo} alt={acceptedOffer.vehicle?.name} className="w-full h-full object-cover"/>
                                        </button>
                                    ))}
                                    {acceptedOffer.vehicle.photos.length > 3 && (
                                        <button
                                            onClick={() => openLightbox(acceptedOffer.vehicle!.photos, 3)}
                                            className="w-[80px] h-[80px] rounded-[8px] bg-white flex items-center justify-center text-[#5B5E68] text-[14px] font-[500] hover:bg-[#F5F5F5] transition-colors"
                                        >
                                            +{acceptedOffer.vehicle.photos.length - 3}
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="text-[#010101] text-[18px] font-[600]">{acceptedOffer.vehicle.name}</p>
                                <p className="text-[#5B5E68] text-[14px] mt-1">
                                    {acceptedOffer.vehicle.brand} {acceptedOffer.vehicle.model} · {vehicleTypeLabels[acceptedOffer.vehicle.type] || acceptedOffer.vehicle.type} · {acceptedOffer.vehicle.seats} miejsc
                                </p>
                                <div className="flex gap-2 mt-3 flex-wrap">
                                    {acceptedOffer.vehicle.hasWifi && <span className={featureBadge}>WiFi</span>}
                                    {acceptedOffer.vehicle.hasWC && <span className={featureBadge}>WC</span>}
                                    {acceptedOffer.vehicle.hasTV && <span className={featureBadge}>TV</span>}
                                    {acceptedOffer.vehicle.hasAirConditioning && <span className={featureBadge}>Klimatyzacja</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Kierowca + cena */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="#01A83D"/>
                                    <path d="M12 14C7.58 14 4 16.01 4 18.5V20H20V18.5C20 16.01 16.42 14 12 14Z" fill="#01A83D"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-[#010101] text-[16px] font-[600]">{acceptedOffer.driverName || "Nieznany"}</p>
                                {acceptedOffer.driverPhone && (
                                    <p className="text-[#5B5E68] text-[14px] mt-0.5">{acceptedOffer.driverPhone}</p>
                                )}
                            </div>
                        </div>
                        <p className="text-[#010101] text-[28px] font-[600] leading-tight shrink-0">{acceptedOffer.price} PLN</p>
                    </div>

                    {/* Wiadomość kierowcy */}
                    {acceptedOffer.message && (
                        <div className="mt-4 bg-white/60 rounded-[6px] px-4 py-3">
                            <p className="text-[#5B5E68] text-[14px] italic">&quot;{acceptedOffer.message}&quot;</p>
                        </div>
                    )}
                </div>
            )}

            {/* Oczekiwanie na oferty */}
            {!acceptedOffer && offers.length === 0 && (
                <div className={`${card} p-16 text-center`}>
                    <div className="w-12 h-12 border-[3px] border-[#D9DADC] border-t-[#0B298F] rounded-full animate-spin mx-auto mb-6"/>
                    <p className="text-[#010101] text-[20px] font-[500]">Oczekiwanie na oferty...</p>
                    <p className="text-[#5B5E68] text-[14px] mt-2 max-w-[400px] mx-auto">
                        Przewoźnicy przeglądają Twoje zapytanie. Powiadomienie pojawi się automatycznie.
                    </p>
                </div>
            )}

            {/* Lista ofert do wyboru */}
            {!acceptedOffer && pendingOffers.length > 0 && (
                <div>
                    <p className="text-[#5B5E68] text-[14px] mb-4">
                        {pendingOffers.length} {pendingOffers.length === 1 ? "oferta" : pendingOffers.length <= 4 ? "oferty" : "ofert"}
                    </p>
                    <div className="flex flex-col gap-6">
                        {pendingOffers.map((offer) => (
                            <div key={offer.id} className={`${card} p-8`}>
                                {/* Pojazd + opcje */}
                                {offer.vehicle && (
                                    <div className="flex gap-5 mb-6 pb-6 border-b border-[#D9DADC]">
                                        {offer.vehicle.photos && offer.vehicle.photos.length > 0 && (
                                            <div className="flex gap-2 shrink-0">
                                                {offer.vehicle.photos.slice(0, 3).map((photo, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => openLightbox(offer.vehicle!.photos, idx)}
                                                        className="w-[80px] h-[80px] rounded-[8px] overflow-hidden hover:opacity-80 transition-opacity"
                                                    >
                                                        <img src={photo} alt={offer.vehicle?.name} className="w-full h-full object-cover"/>
                                                    </button>
                                                ))}
                                                {offer.vehicle.photos.length > 3 && (
                                                    <button
                                                        onClick={() => openLightbox(offer.vehicle!.photos, 3)}
                                                        className="w-[80px] h-[80px] rounded-[8px] bg-[#F5F5F5] flex items-center justify-center text-[#5B5E68] text-[14px] font-[500] hover:bg-[#EBEBEB] transition-colors"
                                                    >
                                                        +{offer.vehicle.photos.length - 3}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[#010101] text-[18px] font-[600]">{offer.vehicle.name}</p>
                                            <p className="text-[#5B5E68] text-[14px] mt-1">
                                                {offer.vehicle.brand} {offer.vehicle.model} · {vehicleTypeLabels[offer.vehicle.type] || offer.vehicle.type} · {offer.vehicle.seats} miejsc
                                            </p>
                                            <div className="flex gap-2 mt-3 flex-wrap">
                                                {offer.vehicle.hasWifi && <span className={featureBadge}>WiFi</span>}
                                                {offer.vehicle.hasWC && <span className={featureBadge}>WC</span>}
                                                {offer.vehicle.hasTV && <span className={featureBadge}>TV</span>}
                                                {offer.vehicle.hasAirConditioning && <span className={featureBadge}>Klimatyzacja</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Kierowca + cena */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-[48px] h-[48px] rounded-full bg-[#F0F1F3] flex items-center justify-center shrink-0">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="#9B9DA3"/>
                                                <path d="M12 14C7.58 14 4 16.01 4 18.5V20H20V18.5C20 16.01 16.42 14 12 14Z" fill="#9B9DA3"/>
                                            </svg>
                                        </div>
                                        <p className="text-[#010101] text-[16px] font-[600]">{maskName(offer.driverName)}</p>
                                    </div>
                                    <div className="flex items-center gap-6 shrink-0">
                                        <p className="text-[#0B298F] text-[28px] font-[600] leading-tight">{offer.price} PLN</p>
                                        <button
                                            onClick={() => handleAcceptOffer(offer.id)}
                                            disabled={acceptingOffer === offer.id}
                                            className="bg-[#0B298F] hover:bg-[#091F6B] text-white px-8 py-3 rounded-xl font-[500] text-[16px] transition-colors disabled:opacity-50"
                                        >
                                            {acceptingOffer === offer.id ? "Akceptowanie..." : "Akceptuj ofertę"}
                                        </button>
                                    </div>
                                </div>

                                {/* Wiadomość kierowcy */}
                                {offer.message && (
                                    <div className="mt-4 bg-[#E6F6EC] rounded-[6px] px-4 py-3">
                                        <p className="text-[#5B5E68] text-[14px] italic">&quot;{offer.message}&quot;</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Loader - oczekiwanie na kolejne oferty */}
                    <div className="mt-8 flex flex-col items-center gap-3 text-center">
                        <div className="w-8 h-8 border-[2px] border-[#D9DADC] border-t-[#0B298F] rounded-full animate-spin"/>
                        <p className="text-[#5B5E68] text-[14px]">
                            Czekamy na kolejne oferty od przewoźników...
                        </p>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightbox && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]" onClick={closeLightbox}>
                    <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors">
                        <CloseIcon className="w-8 h-8"/>
                    </button>

                    {lightbox.photos.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); lightboxPrev(); }} className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors">
                            <ChevronLeftIcon className="w-10 h-10"/>
                        </button>
                    )}

                    <img src={lightbox.photos[lightbox.index]} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()}/>

                    {lightbox.photos.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); lightboxNext(); }} className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors">
                            <ChevronRightIcon className="w-10 h-10"/>
                        </button>
                    )}

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

export const getServerSideProps: GetServerSideProps<Props> = async ({params}) => {
    const id = params?.id as string;
    const request = await getRequestById(id);

    if (!request) {
        return {notFound: true};
    }

    const offers = await getOffersByRequest(id);

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
