import { GetServerSideProps } from "next";
import { getRequestById, getOffersByRequest } from "@/services";
import type { RequestData, OfferData, Route } from "@/models";
import RequestSteps from "@/components/RequestSteps";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/icons";
import { CardHeader } from "@/components/RequestDetailsLayout";
import { Phone, Mail, ChatBubble, Bus, DirectorChair, Sparks, Calendar, Clock, Group } from "iconoir-react";
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

            <div className="max-w-[760px] mx-auto flex flex-col gap-6">

                {/* Dane kontaktowe kierowcy */}
                <div className="bg-white rounded-[8px] border border-[#D9DADC] p-8">
                    <CardHeader title="Twój kierowca" />

                    {/* Tożsamość kierowcy + cena */}
                    <div className="flex items-center justify-between pb-6 border-b border-[#F0F1F3]">
                        <div className="flex items-center gap-4">
                            <div className="w-[52px] h-[52px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="#0B298F"/>
                                    <path d="M12 14C7.58 14 4 16.01 4 18.5V20H20V18.5C20 16.01 16.42 14 12 14Z" fill="#0B298F"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-[16px] font-[600] text-[#010101]">{offer.driverName || "Kierowca"}</p>
                                <p className="text-[13px] text-[#5B5E68] mt-0.5">Zatwierdzona oferta</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-0.5">Uzgodniona cena</p>
                            <p className="text-[#010101] text-[26px] font-[700] leading-none">{offer.price} <span className="text-[16px] font-[500]">PLN</span></p>
                        </div>
                    </div>

                    {/* Kontakt */}
                    <div className="flex flex-col -mx-8">
                        {offer.driverPhone && (
                            <a
                                href={`tel:${offer.driverPhone}`}
                                className="flex items-center gap-4 px-8 py-4 group hover:bg-[#F8F9FF] transition-colors border-b border-[#F0F1F3]"
                            >
                                <div className="w-[40px] h-[40px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                                    <Phone width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-0.5">Telefon</p>
                                    <p className="text-[#010101] text-[15px] font-[600]">{offer.driverPhone}</p>
                                </div>
                                <span className="text-[#0B298F] text-[13px] font-[500] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Zadzwoń →</span>
                            </a>
                        )}
                        {offer.driverEmail && (
                            <a
                                href={`mailto:${offer.driverEmail}`}
                                className="flex items-center gap-4 px-8 py-4 group hover:bg-[#F8F9FF] transition-colors border-b border-[#F0F1F3]"
                            >
                                <div className="w-[40px] h-[40px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                                    <Mail width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-0.5">E-mail</p>
                                    <p className="text-[#010101] text-[15px] font-[600] truncate">{offer.driverEmail}</p>
                                </div>
                                <span className="text-[#0B298F] text-[13px] font-[500] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Napisz →</span>
                            </a>
                        )}
                        {!offer.driverPhone && !offer.driverEmail && (
                            <p className="text-[#5B5E68] text-[14px] px-8 py-4">Brak danych kontaktowych</p>
                        )}
                    </div>

                    {offer.message && (
                        <div className="mt-6 bg-[#EEF2FF] border border-[#C7D2F6] rounded-[8px] px-4 py-4">
                            <div className="flex items-center gap-2 mb-2">
                                <ChatBubble width={15} height={15} color="#0B298F" strokeWidth={1.8} className="shrink-0"/>
                                <span className="text-[#0B298F] text-[11px] font-[600] uppercase tracking-wide">Wiadomość od kierowcy</span>
                            </div>
                            <p className="text-[#3D4B8A] text-[14px] italic leading-relaxed">&quot;{offer.message}&quot;</p>
                        </div>
                    )}
                </div>

                {/* Pojazd */}
                {offer.vehicle && (
                    <div className="bg-white rounded-[8px] border border-[#D9DADC] p-8">
                        <CardHeader title="Pojazd" />

                        {/* Nazwa i marka */}
                        <div className="pb-6 border-b border-[#F0F1F3]">
                            <p className="text-[#010101] text-[20px] font-[700]">{offer.vehicle.name}</p>
                            <p className="text-[#5B5E68] text-[14px] mt-1">
                                {offer.vehicle.brand} {offer.vehicle.model}{offer.vehicle.year ? ` · ${offer.vehicle.year}` : ""}
                            </p>
                        </div>

                        {/* Zdjęcia — full-bleed gallery */}
                        {offer.vehicle.photos && offer.vehicle.photos.length > 0 && (
                            <div className="-mx-8 border-b border-[#F0F1F3]">
                                <div className="flex" style={{ height: "200px" }}>
                                    {offer.vehicle.photos.slice(0, 4).map((photo, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setLightbox({ photos: offer.vehicle!.photos, index: idx })}
                                            className={`relative overflow-hidden hover:opacity-90 transition-opacity border-r border-white last:border-0 ${idx === 0 ? "flex-[2]" : "flex-1"}`}
                                        >
                                            <img src={photo} alt="" className="w-full h-full object-cover" />
                                            {idx === 3 && (offer.vehicle?.photos.length ?? 0) > 4 && (
                                                <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-[18px] font-[700]">
                                                    +{(offer.vehicle?.photos.length ?? 0) - 4}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Specyfikacja — full-bleed rows */}
                        <div className="flex flex-col -mx-8">
                            <div className="flex items-center gap-4 px-8 py-4 border-b border-[#F0F1F3]">
                                <div className="w-[40px] h-[40px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                                    <Bus width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                                </div>
                                <div>
                                    <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-0.5">Typ pojazdu</p>
                                    <p className="text-[#010101] text-[15px] font-[600]">{vehicleTypeLabels[offer.vehicle.type] || offer.vehicle.type}</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-4 px-8 py-4 ${(offer.vehicle.hasWifi || offer.vehicle.hasWC || offer.vehicle.hasTV || offer.vehicle.hasAirConditioning) ? "border-b border-[#F0F1F3]" : ""}`}>
                                <div className="w-[40px] h-[40px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                                    <DirectorChair width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                                </div>
                                <div>
                                    <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-0.5">Liczba miejsc</p>
                                    <p className="text-[#010101] text-[15px] font-[600]">{offer.vehicle.seats} miejsc</p>
                                </div>
                            </div>
                            {(offer.vehicle.hasWifi || offer.vehicle.hasWC || offer.vehicle.hasTV || offer.vehicle.hasAirConditioning) && (
                                <div className="flex items-start gap-4 px-8 py-4">
                                    <div className="w-[40px] h-[40px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0 mt-0.5">
                                        <Sparks width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-2">Wyposażenie</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {offer.vehicle.hasWifi && <span className={featureBadge}>WiFi</span>}
                                            {offer.vehicle.hasWC && <span className={featureBadge}>WC</span>}
                                            {offer.vehicle.hasTV && <span className={featureBadge}>TV</span>}
                                            {offer.vehicle.hasAirConditioning && <span className={featureBadge}>Klimatyzacja</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Szczegóły trasy */}
                <div className="bg-white rounded-[8px] border border-[#D9DADC] p-8">
                    <CardHeader title="Szczegóły przejazdu" />

                    {/* Trasa — visual timeline */}
                    {route && (
                        <div className="pb-6 mb-2 border-b border-[#F0F1F3]">
                            <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-5">Trasa przejazdu</p>
                            <div className="flex flex-col">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center self-stretch">
                                        <div className="w-3 h-3 rounded-full bg-[#0B298F] shrink-0 mt-1" />
                                        <div className="w-px flex-1 bg-[#D0D7F0] mt-1" />
                                    </div>
                                    <div className="pb-5 flex-1">
                                        <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-0.5">Miejsce wyjazdu</p>
                                        <p className="text-[#010101] text-[15px] font-[600]">{route.origin?.address}</p>
                                    </div>
                                </div>
                                {route.waypoints?.map((wp: { address: string }, i: number) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="flex flex-col items-center self-stretch">
                                            <div className="w-3 h-3 rounded-full border-2 border-[#0B298F] bg-white shrink-0 mt-1" />
                                            <div className="w-px flex-1 bg-[#D0D7F0] mt-1" />
                                        </div>
                                        <div className="pb-5 flex-1">
                                            <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-0.5">Przystanek #{i + 1}</p>
                                            <p className="text-[#010101] text-[15px] font-[600]">{wp.address}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-start gap-4">
                                    <div className="w-3 h-3 rounded-full bg-[#0B298F] shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-0.5">Lokalizacja końcowa</p>
                                        <p className="text-[#010101] text-[15px] font-[600]">{route.destination?.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data, godzina, pasażerowie — full-bleed rows */}
                    <div className="flex flex-col -mx-8">
                        <div className="flex items-center gap-4 px-8 py-4 border-b border-[#F0F1F3]">
                            <div className="w-[40px] h-[40px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                                <Calendar width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                            </div>
                            <div>
                                <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-0.5">Data wyjazdu</p>
                                <p className="text-[#010101] text-[15px] font-[600]">{request.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 px-8 py-4 border-b border-[#F0F1F3]">
                            <div className="w-[40px] h-[40px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                                <Clock width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                            </div>
                            <div>
                                <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-0.5">Godzina wyjazdu</p>
                                <p className="text-[#010101] text-[15px] font-[600]">{request.time}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 px-8 py-4">
                            <div className="w-[40px] h-[40px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                                <Group width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                            </div>
                            <div>
                                <p className="text-[11px] font-[600] uppercase tracking-wide text-[#5B5E68] mb-0.5">Pasażerowie</p>
                                <p className="text-[#010101] text-[15px] font-[600]">
                                    {request.adults + request.children} os.{" "}
                                    <span className="text-[14px] text-[#5B5E68] font-[400]">
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
                driverName: acceptedOffer.driverName || undefined,
                driverEmail: acceptedOffer.driverEmail || undefined,
                driverPhone: acceptedOffer.driverPhone || undefined,
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
