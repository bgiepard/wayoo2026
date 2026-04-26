import { GetServerSideProps } from "next";
import { getRequestById, getOffersByRequest } from "@/services";
import type { RequestData, OfferData, Route } from "@/models";
import RequestSteps from "@/components/RequestSteps";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/icons";
import { useState } from "react";

const vehicleTypeLabels: Record<string, string> = {
    bus: "Autobus",
    minibus: "Minibus",
    van: "Van",
    car: "Samochód",
};

const featureBadge = "text-[12px] bg-[#EEF2FF] text-[#0B298F] px-2 py-0.5 rounded-[4px] font-[500]";

interface Props {
    request: RequestData;
    offer: OfferData;
}

export default function TransportDetailsPage({ request, offer }: Props) {
    const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);

    const route: Route | null = (() => { try { return JSON.parse(request.route); } catch { return null; } })();

    const closeLightbox = () => setLightbox(null);
    const lightboxPrev = () => lightbox && setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.photos.length) % lightbox.photos.length });
    const lightboxNext = () => lightbox && setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.photos.length });

    return (
        <main className="pb-12 px-4 max-w-[1250px] mx-auto">
            <RequestSteps
                requestId={request.id}
                activeStep={3}
                hasAcceptedOffer={true}
            />

            <h1 className="text-center text-[#0B298F] text-[26px] font-[400] mb-3">
                Szczegóły transportu
            </h1>
            <h2 className="text-center text-[#5B5E68] text-[16px] font-[400] mb-10">
                Twój kierowca jest gotowy. Skontaktuj się bezpośrednio.
            </h2>

            <div className="flex flex-col gap-6 max-w-[760px] mx-auto">

                {/* Dane kontaktowe kierowcy */}
                <div className="bg-[#0B298F] rounded-[12px] p-6 text-white">
                    <p className="text-[12px] font-[600] uppercase tracking-wider text-white/60 mb-4">Twój kierowca</p>
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-[52px] h-[52px] rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="white"/>
                                <path d="M12 14C7.58 14 4 16.01 4 18.5V20H20V18.5C20 16.01 16.42 14 12 14Z" fill="white"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-[20px] font-[600]">{offer.driverName || "Kierowca"}</p>
                            <p className="text-white/60 text-[14px] mt-0.5">{offer.price} PLN za przejazd</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {offer.driverPhone && (
                            <a
                                href={`tel:${offer.driverPhone}`}
                                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-[8px] px-4 py-3 transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.86 10.82 19.79 19.79 0 01.77 2.18 2 2 0 012.75 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l1.28-1.28a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="text-[15px] font-[500]">{offer.driverPhone}</span>
                            </a>
                        )}
                        {offer.driverEmail && (
                            <a
                                href={`mailto:${offer.driverEmail}`}
                                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-[8px] px-4 py-3 transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <polyline points="22,6 12,13 2,6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="text-[15px] font-[500]">{offer.driverEmail}</span>
                            </a>
                        )}
                        {!offer.driverPhone && !offer.driverEmail && (
                            <p className="text-white/50 text-[14px]">Brak danych kontaktowych</p>
                        )}
                    </div>
                    {offer.message && (
                        <div className="mt-4 bg-white/10 rounded-[8px] px-4 py-3">
                            <p className="text-white/70 text-[13px] italic">&quot;{offer.message}&quot;</p>
                        </div>
                    )}
                </div>

                {/* Pojazd */}
                {offer.vehicle && (
                    <div className="bg-white rounded-[12px] border border-[#D9DADC] p-6">
                        <p className="text-[12px] font-[600] uppercase tracking-wider text-[#5B5E68] mb-4">Pojazd</p>
                        <div className="flex gap-5 items-start">
                            {offer.vehicle.photos && offer.vehicle.photos.length > 0 && (
                                <div className="flex gap-2 shrink-0">
                                    {offer.vehicle.photos.slice(0, 3).map((photo, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setLightbox({ photos: offer.vehicle!.photos, index: idx })}
                                            className="w-[80px] h-[80px] rounded-[8px] overflow-hidden hover:opacity-80 transition-opacity relative"
                                        >
                                            <img src={photo} alt={offer.vehicle?.name} className="w-full h-full object-cover" />
                                            {idx === 2 && offer.vehicle.photos.length > 3 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[14px] font-[500]">
                                                    +{offer.vehicle.photos.length - 3}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-[#010101] text-[17px] font-[600]">{offer.vehicle.name}</p>
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
                    </div>
                )}

                {/* Szczegóły trasy */}
                <div className="bg-white rounded-[12px] border border-[#D9DADC] p-6">
                    <p className="text-[12px] font-[600] uppercase tracking-wider text-[#5B5E68] mb-4">Szczegóły przejazdu</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                        {/* Trasa */}
                        {route && (
                            <div className="sm:col-span-3 flex items-start gap-3">
                                <div className="flex flex-col items-center shrink-0 mt-0.5">
                                    <div className="w-[8px] h-[8px] rounded-full bg-[#0B298F]" />
                                    <div className="w-px flex-1 bg-[#D9DADC] my-1 min-h-[16px]" />
                                    <div className="w-[8px] h-[8px] rounded-full border-2 border-[#0B298F]" />
                                </div>
                                <div className="flex flex-col gap-2 min-w-0">
                                    <p className="text-[14px] font-[500] text-[#010101]">{route.origin?.address}</p>
                                    {route.waypoints?.map((wp: { address: string }, i: number) => (
                                        <p key={i} className="text-[13px] text-[#5B5E68]">↳ {wp.address}</p>
                                    ))}
                                    <p className="text-[14px] font-[500] text-[#010101]">{route.destination?.address}</p>
                                </div>
                            </div>
                        )}

                        {/* Data */}
                        <div className="flex items-center gap-3">
                            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#F0F1F3] flex items-center justify-center shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0B298F" strokeWidth="2"/>
                                    <path d="M16 2V6M8 2V6M3 10H21" stroke="#0B298F" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-[12px] text-[#5B5E68]">Data</p>
                                <p className="text-[14px] font-[500] text-[#010101]">{request.date}</p>
                            </div>
                        </div>

                        {/* Godzina */}
                        <div className="flex items-center gap-3">
                            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#F0F1F3] flex items-center justify-center shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="9" stroke="#0B298F" strokeWidth="2"/>
                                    <path d="M12 7v5l3 3" stroke="#0B298F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-[12px] text-[#5B5E68]">Godzina</p>
                                <p className="text-[14px] font-[500] text-[#010101]">{request.time}</p>
                            </div>
                        </div>

                        {/* Pasażerowie */}
                        <div className="flex items-center gap-3">
                            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#F0F1F3] flex items-center justify-center shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#0B298F" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="9" cy="7" r="4" stroke="#0B298F" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-[12px] text-[#5B5E68]">Pasażerowie</p>
                                <p className="text-[14px] font-[500] text-[#010101]">
                                    {request.adults + request.children} os.{" "}
                                    <span className="text-[13px] text-[#5B5E68] font-[400]">
                                        ({request.adults} dorosłych{request.children > 0 ? `, ${request.children} dzieci` : ""})
                                    </span>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Lightbox */}
            {lightbox && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]" onClick={closeLightbox}>
                    <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors">
                        <CloseIcon className="w-8 h-8" />
                    </button>
                    {lightbox.photos.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); lightboxPrev(); }} className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors">
                            <ChevronLeftIcon className="w-10 h-10" />
                        </button>
                    )}
                    <img src={lightbox.photos[lightbox.index]} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
                    {lightbox.photos.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); lightboxNext(); }} className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors">
                            <ChevronRightIcon className="w-10 h-10" />
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

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const id = params?.id as string;
    const request = await getRequestById(id);

    if (!request) {
        return { notFound: true };
    }

    if (!["accepted", "completed"].includes(request.status)) {
        return {
            redirect: {
                destination: `/request/${id}/offers`,
                permanent: false,
            },
        };
    }

    const offers = await getOffersByRequest(id);
    const acceptedOffer = offers.find((o) => o.status === "accepted");

    if (!acceptedOffer) {
        return {
            redirect: {
                destination: `/request/${id}/offers`,
                permanent: false,
            },
        };
    }

    return {
        props: {
            request,
            offer: {
                id: acceptedOffer.id,
                requestId: acceptedOffer.requestId,
                driverId: acceptedOffer.driverId,
                driverName: acceptedOffer.driverName || null,
                driverEmail: acceptedOffer.driverEmail || null,
                driverPhone: acceptedOffer.driverPhone || null,
                price: acceptedOffer.price,
                message: acceptedOffer.message || "",
                status: acceptedOffer.status,
                vehicle: acceptedOffer.vehicle
                    ? {
                          id: acceptedOffer.vehicle.id,
                          name: acceptedOffer.vehicle.name || "",
                          type: acceptedOffer.vehicle.type || "",
                          brand: acceptedOffer.vehicle.brand || "",
                          model: acceptedOffer.vehicle.model || "",
                          year: acceptedOffer.vehicle.year || 0,
                          seats: acceptedOffer.vehicle.seats || 0,
                          photos: acceptedOffer.vehicle.photos || [],
                          hasWifi: acceptedOffer.vehicle.hasWifi ?? false,
                          hasWC: acceptedOffer.vehicle.hasWC ?? false,
                          hasTV: acceptedOffer.vehicle.hasTV ?? false,
                          hasAirConditioning: acceptedOffer.vehicle.hasAirConditioning ?? false,
                      }
                    : undefined,
            },
        },
    };
};
