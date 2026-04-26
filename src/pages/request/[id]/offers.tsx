import {GetServerSideProps} from "next";
import {useRouter} from "next/router";
import {useState, useEffect, useCallback} from "react";
import {getRequestById, getOffersByRequest} from "@/services";
import type {RequestData, OfferData} from "@/models";
import RequestSteps from "@/components/RequestSteps";
import {getPusherClient, type NewOfferEvent} from "@/lib/pusher-client";
import {ChevronLeftIcon, ChevronRightIcon, CloseIcon} from "@/components/icons";

const vehicleTypeLabels: Record<string, string> = {
    bus: "Autobus",
    minibus: "Minibus",
    van: "Van",
    car: "Samochód",
};

const featureBadge = "text-[12px] bg-[#EEF2FF] text-[#0B298F] px-2 py-0.5 rounded-[4px] font-[500]";

interface DriverContact {
    name: string | null;
    phone: string | null;
    email: string | null;
}

interface Props {
    request: RequestData;
    initialOffers: OfferData[];
}

export default function RequestOffersPage({request, initialOffers}: Props) {
    const router = useRouter();
    const [offers, setOffers] = useState<OfferData[]>(initialOffers);
    const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");
    const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);
    const [acceptError, setAcceptError] = useState("");
    const [driverContact, setDriverContact] = useState<DriverContact | null>(null);

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

    const isRequestAccepted = ["accepted", "completed"].includes(request.status);
    const acceptedOffer = isRequestAccepted ? offers.find((o) => o.status === "accepted") : null;
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

    useEffect(() => {
        if (isRequestAccepted) return;

        const pusher = getPusherClient();
        const channel = pusher.subscribe(`request-${request.id}`);

        const handler = (_data: NewOfferEvent) => {
            fetchOffers();
        };

        channel.bind("new-offer", handler);

        const interval = setInterval(fetchOffers, 15000);

        return () => {
            channel.unbind("new-offer", handler);
            clearInterval(interval);
        };
    }, [request.id, isRequestAccepted, fetchOffers]);

    const route = (() => { try { return JSON.parse(request.route); } catch { return null; } })();

    const handleCancelRequest = async () => {
        setIsCancelling(true);
        setCancelError("");
        try {
            const res = await fetch(`/api/requests/${request.id}/status`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({status: "canceled"}),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setCancelError(data.detail || data.error || "Nie udało się anulować zapytania.");
                setIsCancelling(false);
                return;
            }
            router.push("/my-requests?tab=completed");
        } catch {
            setCancelError("Błąd sieci. Spróbuj ponownie.");
            setIsCancelling(false);
        }
    };

    const handleAcceptOffer = async (offerId: string) => {
        setAcceptingOfferId(offerId);
        setAcceptError("");
        try {
            const res = await fetch(`/api/requests/${request.id}/accept-offer`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({offerId}),
            });
            const data = await res.json();
            if (!res.ok) {
                setAcceptError(data.error || "Nie udało się wybrać oferty.");
                setAcceptingOfferId(null);
                return;
            }
            await router.push(`/request/${request.id}/transport`);
        } catch {
            setAcceptError("Błąd sieci. Spróbuj ponownie.");
        } finally {
            setAcceptingOfferId(null);
        }
    };

    return (
        <main className="pb-12 px-4 max-w-[1250px] mx-auto">
            <RequestSteps
                requestId={request.id}
                activeStep={2}
                hasAcceptedOffer={isRequestAccepted}
            />

            {isRequestAccepted ? (
                <>
                    <h1 className="text-center text-[#0B298F] text-[26px] font-[400] mb-3">
                        Oferta wybrana
                    </h1>
                    <h2 className="text-center text-[#5B5E68] text-[16px] font-[400] mb-6">
                        Skontaktuj się bezpośrednio z kierowcą.
                    </h2>
                </>
            ) : pendingOffers.length > 0 ? (
                <>
                    <h1 className="text-center text-[#0B298F] text-[26px] font-[400] mb-3">
                        Wybierz najlepszą ofertę!
                    </h1>
                    <h2 className="text-center text-[#5B5E68] text-[16px] font-[400] mb-6">
                        {pendingOffers.length} {pendingOffers.length === 1 ? "oferta dostępna" : pendingOffers.length <= 4 ? "oferty dostępne" : "ofert dostępnych"}
                    </h2>
                </>
            ) : (
                <div className="mb-6" />
            )}

            {/* Szczegóły trasy */}
            <div className="bg-[#E7EAF4] rounded-[8px] border border-[#D9DADC] p-6 my-16 grid grid-cols-1 sm:grid-cols-4 gap-6">
                {route && (
                    <div className="flex items-start gap-3 sm:col-span-2">
                        <div className="shrink-0 mt-0.5">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="5" r="2" stroke="#0B298F" strokeWidth="2"/>
                                <path d="M12 7V17" stroke="#0B298F" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2"/>
                                <circle cx="12" cy="19" r="2" stroke="#0B298F" strokeWidth="2"/>
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[12px] text-[#5B5E68] mb-1">Trasa</p>
                            <p className="text-[14px] font-[500] text-[#010101] break-words">
                                {route.origin?.address?.split(",")[0]}
                                {route.waypoints?.length > 0 && route.waypoints.map((wp: {address: string}, i: number) => (
                                    <span key={i}> → {wp.address?.split(",")[0]}</span>
                                ))}
                                {" → "}{route.destination?.address?.split(",")[0]}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0B298F" strokeWidth="2"/>
                            <path d="M16 2V6M8 2V6M3 10H21" stroke="#0B298F" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-[12px] text-[#5B5E68] mb-0.5">Data i godzina</p>
                        <p className="text-[14px] font-[500] text-[#010101]">{request.date}, {request.time}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#0B298F" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="9" cy="7" r="4" stroke="#0B298F" strokeWidth="2"/>
                            <path d="M23 21V19C22.9986 18.1137 22.7068 17.2528 22.1694 16.5523C21.6321 15.8519 20.8799 15.3516 20.03 15.13" stroke="#0B298F" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#0B298F" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-[12px] text-[#5B5E68] mb-0.5">Pasażerowie</p>
                        <p className="text-[14px] font-[500] text-[#010101]">
                            {request.adults + request.children} os.{" "}
                            <span className="text-[13px] text-[#5B5E68] font-[400]">
                                ({request.adults} dorosłych{request.children > 0 ? `, ${request.children} dzieci` : ""})
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Zaakceptowana oferta */}
            {acceptedOffer && (
                <div className="bg-[#E6F6EC] rounded-[8px] p-8 border border-[#01A83D]">
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

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="#01A83D"/>
                                    <path d="M12 14C7.58 14 4 16.01 4 18.5V20H20V18.5C20 16.01 16.42 14 12 14Z" fill="#01A83D"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-[#010101] text-[16px] font-[600]">{acceptedOffer.driverName || "Nieznany"}</p>
                            </div>
                        </div>
                        <p className="text-[#010101] text-[28px] font-[600] leading-tight shrink-0">{acceptedOffer.price} PLN</p>
                    </div>

                    {/* Dane kontaktowe kierowcy */}
                    {driverContact && (
                        <div className="bg-white rounded-[8px] p-4 border border-[#01A83D]/30 mt-2">
                            <p className="text-[12px] text-[#5B5E68] font-[500] uppercase tracking-wide mb-3">Dane kontaktowe kierowcy</p>
                            <div className="flex flex-col gap-2">
                                {driverContact.name && (
                                    <p className="text-[15px] font-[600] text-[#010101]">{driverContact.name}</p>
                                )}
                                {driverContact.phone && (
                                    <a href={`tel:${driverContact.phone}`} className="flex items-center gap-2 text-[#0B298F] text-[15px] font-[500] hover:underline">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.86 10.82 19.79 19.79 0 01.77 2.18 2 2 0 012.75 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l1.28-1.28a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" stroke="#0B298F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        {driverContact.phone}
                                    </a>
                                )}
                                {driverContact.email && (
                                    <a href={`mailto:${driverContact.email}`} className="flex items-center gap-2 text-[#0B298F] text-[15px] font-[500] hover:underline">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#0B298F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <polyline points="22,6 12,13 2,6" stroke="#0B298F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        {driverContact.email}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {acceptedOffer.message && (
                        <div className="mt-4 bg-white/60 rounded-[6px] px-4 py-3">
                            <p className="text-[#5B5E68] text-[14px] italic">&quot;{acceptedOffer.message}&quot;</p>
                        </div>
                    )}
                </div>
            )}

            {/* Oczekiwanie na oferty */}
            {!acceptedOffer && offers.length === 0 && (
                <div className="p-16 text-center">
                    <div className="w-12 h-12 border-[3px] border-[#D9DADC] border-t-[#0B298F] rounded-full animate-spin mx-auto mb-6"/>
                    <p className="text-[#010101] text-[20px] font-[500]">Oczekiwanie na oferty...</p>
                    <p className="text-[#5B5E68] text-[14px] mt-2 max-w-[400px] mx-auto">
                        Przewoźnicy przeglądają Twoje zapytanie. Powiadomienie pojawi się automatycznie.
                    </p>
                </div>
            )}

            {/* Lista ofert do wyboru */}
            {!isRequestAccepted && pendingOffers.length > 0 && (
                <div>
                    {acceptError && (
                        <p className="text-red-600 text-[13px] text-center mb-4">{acceptError}</p>
                    )}
                    <div className="flex flex-col gap-6">
                        {pendingOffers.map((offer) => (
                            <div key={offer.id} className="rounded-[8px] border border-[#D9DADC] overflow-hidden">
                                {/* Górna sekcja: pojazd + zdjęcia */}
                                {offer.vehicle && (
                                    <div className="bg-white p-6 flex gap-6 items-start">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                                                    <path d="M2.5 9.16663H3.37123M3.37123 9.16663H16.6288M3.37123 9.16663C3.38051 9.12374 3.39147 9.08122 3.40413 9.03922C3.43435 8.93898 3.47702 8.84258 3.56283 8.64952L4.85138 5.75028C5.10614 5.17707 5.23373 4.89029 5.43508 4.68014C5.61306 4.49437 5.83136 4.35246 6.0734 4.26527C6.34723 4.16663 6.66113 4.16663 7.28841 4.16663H12.7113C13.3386 4.16663 13.6528 4.16663 13.9266 4.26527C14.1687 4.35246 14.3866 4.49437 14.5646 4.68014C14.7658 4.89015 14.8932 5.17669 15.1476 5.74913L16.4413 8.66007C16.524 8.84613 16.5661 8.94082 16.5958 9.03922C16.6085 9.08122 16.6195 9.12374 16.6288 9.16663M3.37123 9.16663C3.36085 9.21466 3.35258 9.26315 3.34643 9.31189C3.33333 9.41576 3.33333 9.52135 3.33333 9.73263V14.1666M16.6288 9.16663H17.5M16.6288 9.16663C16.6392 9.21466 16.6475 9.26315 16.6536 9.31189C16.6667 9.41513 16.6667 9.52011 16.6667 9.72883V14.1667M16.6667 14.1667L13.3333 14.1667M16.6667 14.1667V14.9999C16.6667 15.9203 15.9205 16.6666 15 16.6666C14.0795 16.6666 13.3333 15.9204 13.3333 15V14.1667M13.3333 14.1667L6.66667 14.1666M6.66667 14.1666H3.33333M6.66667 14.1666V15C6.66667 15.9204 5.92047 16.6666 5 16.6666C4.07953 16.6666 3.33333 15.9204 3.33333 15V14.1666" stroke="#5B5E68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <p className="text-[16px] font-[600] text-[#010101]">
                                                    {offer.vehicle.brand} {offer.vehicle.model} ({offer.vehicle.year})
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                                                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#5B5E68" strokeWidth="1.8" strokeLinecap="round"/>
                                                    <circle cx="9" cy="7" r="4" stroke="#5B5E68" strokeWidth="1.8"/>
                                                    <path d="M23 21V19C22.9986 18.1137 22.7068 17.2528 22.1694 16.5523C21.6321 15.8519 20.8799 15.3516 20.03 15.13" stroke="#5B5E68" strokeWidth="1.8" strokeLinecap="round"/>
                                                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#5B5E68" strokeWidth="1.8" strokeLinecap="round"/>
                                                </svg>
                                                <p className="text-[14px] text-[#5B5E68]">{offer.vehicle.seats} miejsc</p>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {offer.vehicle.hasWifi && <span className={featureBadge}>Wifi</span>}
                                                {offer.vehicle.hasTV && <span className={featureBadge}>TV</span>}
                                                {offer.vehicle.hasAirConditioning && <span className={featureBadge}>Klimatyzacja</span>}
                                                {offer.vehicle.hasWC && <span className={featureBadge}>WC</span>}
                                            </div>
                                        </div>

                                        {offer.vehicle.photos && offer.vehicle.photos.length > 0 && (
                                            <div className="flex gap-2 shrink-0">
                                                {offer.vehicle.photos.slice(0, 3).map((photo, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => openLightbox(offer.vehicle!.photos, idx)}
                                                        className="w-[100px] h-[100px] rounded-[8px] overflow-hidden hover:opacity-80 transition-opacity relative"
                                                    >
                                                        <img src={photo} alt={offer.vehicle?.name} className="w-full h-full object-cover"/>
                                                        {idx === 2 && offer.vehicle!.photos.length > 3 && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[14px] font-[500]">
                                                                +{offer.vehicle!.photos.length - 3}
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Dolna sekcja: kierowca + cena + przycisk */}
                                <div className="bg-[#F5F5F5] px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-[40px] h-[40px] rounded-full bg-[#D9DADC] flex items-center justify-center shrink-0">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="#9B9DA3"/>
                                                <path d="M12 14C7.58 14 4 16.01 4 18.5V20H20V18.5C20 16.01 16.42 14 12 14Z" fill="#9B9DA3"/>
                                            </svg>
                                        </div>
                                        <div>
                                            {offer.driverName && (
                                                <p className="text-[14px] font-[600] text-[#010101]">{offer.driverName}</p>
                                            )}
                                            {offer.message && (
                                                <p className="text-[13px] text-[#5B5E68]">Wiadomość: <span className="italic">&quot;{offer.message}&quot;</span></p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <p className="text-[#0B298F] text-[24px] font-[600] leading-tight">{offer.price} zł</p>
                                        <button
                                            onClick={() => handleAcceptOffer(offer.id)}
                                            disabled={acceptingOfferId !== null}
                                            className="bg-[#0B298F] hover:bg-[#091F6B] disabled:opacity-50 text-white px-6 py-3 rounded-xl font-[600] text-[14px] transition-colors"
                                        >
                                            {acceptingOfferId === offer.id ? "Wybieranie..." : "WYBIERAM OFERTĘ"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="my-16 flex flex-col items-center gap-3 text-center">
                        <div className="w-8 h-8 border-[2px] border-[#D9DADC] border-t-[#0B298F] rounded-full animate-spin"/>
                        <p className="text-[#5B5E68] text-[14px]">
                            Czekamy na kolejne oferty od przewoźników...
                        </p>
                    </div>
                </div>
            )}

            {/* Anuluj zapytanie */}
            {request.status === "published" && (
                <div className="mt-16 flex justify-center">
                    {showCancelConfirm ? (
                        <div className="flex flex-col items-center gap-2">
                            {cancelError && (
                                <p className="text-[12px] text-red-600">{cancelError}</p>
                            )}
                            <div className="flex items-center gap-3 text-[14px]">
                                <span className="text-[#5B5E68]">Na pewno anulować zapytanie?</span>
                                <button
                                    onClick={handleCancelRequest}
                                    disabled={isCancelling}
                                    className="text-red-600 hover:text-red-800 font-[500] transition-colors disabled:opacity-50"
                                >
                                    {isCancelling ? "Anulowanie..." : "Tak, anuluj"}
                                </button>
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="text-[#9B9DA3] hover:text-[#5B5E68] transition-colors"
                                >
                                    Nie
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="text-[#9B9DA3] hover:text-red-500 text-[13px] transition-colors"
                        >
                            Anuluj zapytanie
                        </button>
                    )}
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

    if (["accepted", "completed"].includes(request.status)) {
        return {
            redirect: {
                destination: `/request/${id}/transport`,
                permanent: false,
            },
        };
    }

    const offers = await getOffersByRequest(id);

    const initialOffers = offers.map((offer) => {
        const isAccepted = offer.status === "accepted";

        const baseOffer = {
            id: offer.id,
            requestId: offer.requestId,
            driverId: offer.driverId,
            price: offer.price,
            status: offer.status,
            message: offer.message || "",
            driverName: offer.driverName || "",
            driverEmail: "",
            driverPhone: "",
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
