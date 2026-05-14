import {GetServerSideProps} from "next";
import {useRouter} from "next/router";
import {useState, useEffect, useCallback} from "react";
import {getRequestById, getOffersByRequest} from "@/services";
import type {RequestData, OfferData} from "@/models";
import RequestSteps from "@/components/RequestSteps";
import {getPusherClient, type NewOfferEvent} from "@/lib/pusher-client";
import {ChevronLeftIcon, ChevronRightIcon, CloseIcon, ChevronDownIcon} from "@/components/icons";
import {Calendar, Clock, Group, ChatBubble, Bus, DirectorChair, Sparks} from "iconoir-react";

const vehicleTypeLabels: Record<string, string> = {
    bus: "Autobus",
    minibus: "Minibus",
    van: "Van",
    car: "Samochód",
};

const featureBadge = "text-[12px] bg-accent-soft text-navy px-2 py-0.5 rounded-[4px] font-[500]";

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
    const [isRouteExpanded, setIsRouteExpanded] = useState(false);
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
                    <h1 className="text-center text-navy text-[26px] font-[400] mb-3">
                        Oferta wybrana
                    </h1>
                    <h2 className="text-center text-secondary text-[16px] font-[400] mb-6">
                        Skontaktuj się bezpośrednio z kierowcą.
                    </h2>
                </>
            ) : pendingOffers.length > 0 ? (
                <>
                    <h1 className="text-center text-navy text-[26px] font-[400] mb-3">
                        Wybierz najlepszą ofertę!
                    </h1>
                    <h2 className="text-center text-secondary text-[16px] font-[400] mb-6">
                        {pendingOffers.length} {pendingOffers.length === 1 ? "oferta dostępna" : pendingOffers.length <= 4 ? "oferty dostępne" : "ofert dostępnych"}
                    </h2>
                </>
            ) : (
                <div className="mb-6" />
            )}

            {/* Szczegóły trasy */}
            <div className="bg-white rounded-[12px] my-10" style={{border: "1px solid var(--border)", boxShadow: "0 2px 10px rgba(0,0,0,0.06)"}}>
                {/* Nagłówek karty — klikalny */}
                <button
                    onClick={() => setIsRouteExpanded(v => !v)}
                    className="w-full px-6 py-3.5 flex items-center gap-2.5 hover:bg-[#fafafa] transition-colors rounded-t-[12px]"
                    style={{borderBottom: isRouteExpanded ? "1px solid var(--border)" : "none"}}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                        <circle cx="5" cy="5" r="2.5" stroke="#0B298F" strokeWidth="2"/>
                        <path d="M5 7.5V16.5" stroke="#0B298F" strokeWidth="2" strokeLinecap="round" strokeDasharray="2.5 2.5"/>
                        <circle cx="5" cy="19" r="2.5" stroke="#0B298F" strokeWidth="2"/>
                        <path d="M10 5H21M10 19H21" stroke="#0B298F" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    <h3 className="text-navy text-[12px] font-[700] uppercase tracking-[0.08em]">Szczegóły trasy</h3>
                    {!isRouteExpanded && route && (
                        <span className="flex-1 text-left text-[13px] font-[500] text-ink ml-2 truncate">
                            {route.origin?.address?.split(",")[0]}
                            <span className="text-secondary mx-1.5">→</span>
                            {route.destination?.address?.split(",")[0]}
                        </span>
                    )}
                    <ChevronDownIcon
                        className={`w-4 h-4 text-secondary shrink-0 transition-transform duration-200 ml-auto ${isRouteExpanded ? "rotate-180" : "rotate-0"}`}
                    />
                </button>

                {/* Trzy sekcje — widoczne tylko po rozwinięciu */}
                {isRouteExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                    {/* Punkty trasy */}
                    {route && (
                        <div className="p-6 border-b sm:border-b-0 sm:border-r border-line">
                            <p className="text-[10px] font-[700] uppercase tracking-[0.08em] text-secondary mb-4">Punkty trasy</p>
                            <div className="flex flex-col">
                                <div className="flex items-start gap-3">
                                    <div className="flex flex-col items-center self-stretch">
                                        <div className="w-2 h-2 rounded-full bg-navy shrink-0 mt-1"/>
                                        <div className="w-px flex-1 bg-line mt-1"/>
                                    </div>
                                    <p className="text-[13px] font-[500] text-ink leading-snug pb-3">{route.origin?.address?.split(",")[0]}</p>
                                </div>
                                {(route.waypoints || []).map((wp: {address: string}, i: number) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="flex flex-col items-center self-stretch">
                                            <div className="w-2 h-2 rounded-full border-2 border-navy bg-white shrink-0 mt-1"/>
                                            <div className="w-px flex-1 bg-line mt-1"/>
                                        </div>
                                        <p className="text-[13px] font-[500] text-ink leading-snug pb-3">{wp.address?.split(",")[0]}</p>
                                    </div>
                                ))}
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-navy shrink-0 mt-1"/>
                                    <p className="text-[13px] font-[500] text-ink leading-snug">{route.destination?.address?.split(",")[0]}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Termin wyjazdu */}
                    <div className="p-6 border-b sm:border-b-0 sm:border-r border-line">
                        <p className="text-[10px] font-[700] uppercase tracking-[0.08em] text-secondary mb-4">Termin wyjazdu</p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-[34px] h-[34px] rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                                    <Calendar width={15} height={15} color="#0B298F" strokeWidth={1.8}/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-secondary font-[500] mb-0.5">Data</p>
                                    <p className="text-[13px] font-[600] text-ink">{request.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-[34px] h-[34px] rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                                    <Clock width={15} height={15} color="#0B298F" strokeWidth={1.8}/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-secondary font-[500] mb-0.5">Godzina</p>
                                    <p className="text-[13px] font-[600] text-ink">{request.time}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pasażerowie */}
                    <div className="p-6">
                        <p className="text-[10px] font-[700] uppercase tracking-[0.08em] text-secondary mb-4">Pasażerowie</p>
                        <div className="flex items-center gap-3">
                            <div className="w-[34px] h-[34px] rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                                <Group width={15} height={15} color="#0B298F" strokeWidth={1.8}/>
                            </div>
                            <div>
                                <p className="text-[13px] font-[600] text-ink">
                                    {request.adults + request.children}{" "}
                                    {request.adults + request.children === 1 ? "osoba" : request.adults + request.children <= 4 ? "osoby" : "osób"}
                                </p>
                                <p className="text-[11px] text-secondary mt-0.5">
                                    {request.adults} dorosłych{request.children > 0 ? `, ${request.children} dzieci` : ""}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>

            {/* Zaakceptowana oferta */}
            {acceptedOffer && (
                <div className="bg-white rounded-[12px] overflow-hidden" style={{border: "1.5px solid #16a34a", boxShadow: "0 4px 16px rgba(22,163,74,0.10)"}}>
                    {/* Nagłówek sukcesu */}
                    <div className="bg-[#f0fdf4] px-6 py-4 border-b border-[#bbf7d0] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" fill="#16a34a"/>
                                <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-[13px] font-[700] text-[#16a34a] uppercase tracking-[0.06em]">Wybrana oferta</span>
                        </div>
                        <div className="text-right">
                            <p className="text-navy text-[26px] font-[700] leading-none">{acceptedOffer.price} <span className="text-[16px] font-[500]">zł</span></p>
                        </div>
                    </div>

                    {/* Pojazd */}
                    {acceptedOffer.vehicle && (
                        <div className="p-6 border-b border-line">
                            <div className="flex gap-5 items-start">
                                {acceptedOffer.vehicle.photos && acceptedOffer.vehicle.photos.length > 0 && (
                                    <div className="flex gap-2 shrink-0">
                                        {acceptedOffer.vehicle.photos.slice(0, 3).map((photo, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => openLightbox(acceptedOffer.vehicle!.photos, idx)}
                                                className="w-[90px] h-[66px] rounded-[8px] overflow-hidden hover:opacity-80 transition-opacity relative"
                                            >
                                                <img src={photo} alt={acceptedOffer.vehicle?.name} className="w-full h-full object-cover"/>
                                                {idx === 2 && acceptedOffer.vehicle!.photos.length > 3 && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[13px] font-[600]">
                                                        +{acceptedOffer.vehicle!.photos.length - 3}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-ink text-[17px] font-[700]">{acceptedOffer.vehicle.name}</p>
                                    <p className="text-secondary text-[13px] mt-0.5">
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
                        </div>
                    )}

                    {/* Kierowca + kontakt */}
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-[44px] h-[44px] rounded-full bg-navy flex items-center justify-center shrink-0">
                                <span className="text-white text-[16px] font-[700]">
                                    {acceptedOffer.driverName?.[0]?.toUpperCase() || "?"}
                                </span>
                            </div>
                            <div>
                                <p className="text-ink text-[16px] font-[700]">{acceptedOffer.driverName || "Nieznany kierowca"}</p>
                                <p className="text-secondary text-[12px]">Kierowca</p>
                            </div>
                        </div>

                        {driverContact && (
                            <div className="flex flex-col gap-2.5">
                                {driverContact.phone && (
                                    <a href={`tel:${driverContact.phone}`} className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-[#f8f9fb] hover:bg-[#f0f4ff] transition-colors group">
                                        <div className="w-[32px] h-[32px] rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.86 10.82 19.79 19.79 0 01.77 2.18 2 2 0 012.75 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l1.28-1.28a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" stroke="#0B298F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-secondary font-[600] uppercase tracking-wide">Telefon</p>
                                            <p className="text-[14px] font-[600] text-navy group-hover:underline">{driverContact.phone}</p>
                                        </div>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-secondary shrink-0">
                                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </a>
                                )}
                                {driverContact.email && (
                                    <a href={`mailto:${driverContact.email}`} className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-[#f8f9fb] hover:bg-[#f0f4ff] transition-colors group">
                                        <div className="w-[32px] h-[32px] rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#0B298F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <polyline points="22,6 12,13 2,6" stroke="#0B298F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-secondary font-[600] uppercase tracking-wide">E-mail</p>
                                            <p className="text-[14px] font-[600] text-navy truncate group-hover:underline">{driverContact.email}</p>
                                        </div>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-secondary shrink-0">
                                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </a>
                                )}
                            </div>
                        )}

                        {acceptedOffer.message && (
                            <div className="mt-4 bg-[#f8f9fb] rounded-[10px] px-4 py-3 border border-line">
                                <p className="text-[10px] text-secondary font-[600] uppercase tracking-wide mb-1">Wiadomość od kierowcy</p>
                                <p className="text-secondary text-[13px] italic">&quot;{acceptedOffer.message}&quot;</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Oczekiwanie na oferty */}
            {!acceptedOffer && offers.length === 0 && (
                <div className="p-16 text-center">
                    <div className="w-12 h-12 border-[3px] border-line border-t-[#0B298F] rounded-full animate-spin mx-auto mb-6"/>
                    <p className="text-ink text-[20px] font-[500]">Oczekiwanie na oferty...</p>
                    <p className="text-secondary text-[14px] mt-2 max-w-[400px] mx-auto">
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
                    <div className="flex flex-col gap-4">
                        {pendingOffers.map((offer) => (
                            <div key={offer.id} className="bg-white rounded-[8px] overflow-hidden border border-line" style={{boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
                                <div className="p-5">
                                    <div className="flex gap-4 items-stretch">
                                        {/* Lewa: kierowca + pojazd ze zdjęciem */}
                                        <div className="flex-1 min-w-0">
                                            {/* Kierowca */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-[38px] h-[38px] rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                                                    <span className="text-navy text-[13px] font-[700]">
                                                        {offer.driverName?.[0]?.toUpperCase() || "?"}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[14px] font-[600] text-ink">{offer.driverName || "Kierowca"}</p>
                                                    {offer.message ? (
                                                        <p className="text-[12px] text-secondary italic truncate">&quot;{offer.message}&quot;</p>
                                                    ) : (
                                                        <p className="text-[12px] text-secondary">Oferta przejazdu</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Pojazd: zdjęcie obok szczegółów */}
                                            {offer.vehicle && (
                                                <div className="flex gap-3 items-start">
                                                    {offer.vehicle.photos && offer.vehicle.photos.length > 0 && (
                                                        <button
                                                            onClick={() => openLightbox(offer.vehicle!.photos, 0)}
                                                            className="w-[72px] h-[54px] rounded-[6px] overflow-hidden hover:opacity-80 transition-opacity relative shrink-0"
                                                        >
                                                            <img src={offer.vehicle.photos[0]} alt="" className="w-full h-full object-cover"/>
                                                            {offer.vehicle.photos.length > 1 && (
                                                                <div className="absolute inset-0 bg-black/35 flex items-center justify-center text-white text-[11px] font-[600]">
                                                                    +{offer.vehicle.photos.length - 1}
                                                                </div>
                                                            )}
                                                        </button>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-[600] text-ink mb-0.5">
                                                            {offer.vehicle.brand} {offer.vehicle.model}
                                                            <span className="text-secondary font-[400]"> ({offer.vehicle.year})</span>
                                                        </p>
                                                        <p className="text-[12px] text-secondary mb-2">
                                                            {vehicleTypeLabels[offer.vehicle.type] || offer.vehicle.type} · {offer.vehicle.seats} miejsc
                                                        </p>
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            {offer.vehicle.hasWifi && <span className={featureBadge}>WiFi</span>}
                                                            {offer.vehicle.hasTV && <span className={featureBadge}>TV</span>}
                                                            {offer.vehicle.hasAirConditioning && <span className={featureBadge}>Klimatyzacja</span>}
                                                            {offer.vehicle.hasWC && <span className={featureBadge}>WC</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Prawa: cena (góra) + przycisk (dół) */}
                                        <div className="shrink-0 flex flex-col items-end justify-end gap-3">
                                            <div className="text-right">
                                                <p className="text-navy text-[22px] font-[700] leading-none">{offer.price}</p>
                                                <p className="text-[11px] text-secondary mt-0.5">PLN / przejazd</p>
                                            </div>
                                            <button
                                                onClick={() => handleAcceptOffer(offer.id)}
                                                disabled={acceptingOfferId !== null}
                                                className="bg-navy hover:bg-navy-hover disabled:opacity-50 text-white px-5 py-2 rounded-[8px] font-[600] text-[13px] transition-colors whitespace-nowrap"
                                            >
                                                {acceptingOfferId === offer.id ? "Wybieranie..." : "Przejdź do oferty →"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="my-16 flex flex-col items-center gap-3 text-center">
                        <div className="w-8 h-8 border-[2px] border-line border-t-[#0B298F] rounded-full animate-spin"/>
                        <p className="text-secondary text-[14px]">
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
                                <span className="text-secondary">Na pewno anulować zapytanie?</span>
                                <button
                                    onClick={handleCancelRequest}
                                    disabled={isCancelling}
                                    className="text-red-600 hover:text-red-800 font-[500] transition-colors disabled:opacity-50"
                                >
                                    {isCancelling ? "Anulowanie..." : "Tak, anuluj"}
                                </button>
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="text-tertiary hover:text-secondary transition-colors"
                                >
                                    Nie
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="text-tertiary hover:text-red-500 text-[13px] transition-colors"
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
