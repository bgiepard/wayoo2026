import {GetServerSideProps} from "next";
import {useRouter} from "next/router";
import {useState} from "react";
import {getRequestById, getOffersByRequest} from "@/services";
import type {RequestData, OfferData, Route} from "@/models";
import RequestSteps from "@/components/RequestSteps";
import {DraftCheckIcon} from "@/components/icons";
import {formatDatePL} from "@/lib/formatDate";

const card = "bg-white rounded-[8px] p-8 border border-[#D9DADC]";
const label = "text-[#5B5E68] text-[14px] block mb-0.5";
const value = "text-[#010101] text-[16px] font-[600]";
const featureBadge = "text-[12px] bg-[#EEF2FF] text-[#0B298F] px-2 py-0.5 rounded-[4px] font-[500]";

const vehicleTypeLabels: Record<string, string> = {
    bus: "Autobus",
    minibus: "Minibus",
    van: "Van",
    car: "Samochód",
};

interface Props {
    request: RequestData;
    acceptedOffer: OfferData | null;
}

export default function RequestPaymentPage({request: initialRequest, acceptedOffer}: Props) {
    const router = useRouter();
    const [request, setRequest] = useState(initialRequest);
    const [isPaying, setIsPaying] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptCancellation, setAcceptCancellation] = useState(false);

    const canPay = acceptTerms && acceptCancellation;
    const isRequestAccepted = ["accepted", "paid", "completed"].includes(request.status);
    const isPaid = request.status === "paid" || request.status === "completed";
    const route: Route = JSON.parse(request.route || "{}");

    const handleMarkAsPaid = async () => {
        setIsPaying(true);
        try {
            const res = await fetch(`/api/requests/${request.id}/status`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({status: "paid"}),
            });
            if (res.ok) {
                setRequest({...request, status: "paid"});
            }
        } catch (error) {
            console.error("Error marking as paid:", error);
        } finally {
            setIsPaying(false);
        }
    };

    if (!acceptedOffer) {
        return (
            <main className="pb-12 px-4 max-w-[1250px] mx-auto">
                <RequestSteps requestId={request.id} activeStep={3} hasAcceptedOffer={isRequestAccepted}/>
                <h1 className="text-center text-[#0B298F] text-[26px] font-[400] mb-12">Płatność</h1>
                <div className={`${card} text-center`}>
                    <p className="text-[#5B5E68] text-[16px]">Brak danych o ofercie.</p>
                </div>
            </main>
        );
    }

    const originName = route.origin?.address?.split(",")[0] || "";
    const destName = route.destination?.address?.split(",")[0] || "";

    return (
        <main className="pb-12 px-4 max-w-[1250px] mx-auto">
            <RequestSteps requestId={request.id} activeStep={3} hasAcceptedOffer={isRequestAccepted}/>

            <h1 className="text-center text-[#0B298F] text-[26px] font-[400] mb-3">
                {isPaid ? "Zamówienie potwierdzone" : "Potwierdzenie zamówienia"}
            </h1>
            <h2 className="text-center text-[#5B5E68] text-[16px] font-[400] mb-12">
                {isPaid
                    ? "Dziękujemy za opłacenie przejazdu. Poniżej znajdziesz dane kontaktowe kierowcy."
                    : "Opłać przejazd, aby uzyskać pełne dane kontaktowe kierowcy."}
            </h2>

            <div className="flex flex-col gap-6">

                {/* Sukces - banner po opłaceniu */}
                {isPaid && (
                    <div className="bg-[#E6F6EC] rounded-[2px] px-4 py-2 flex items-center gap-3 border border-[#01A83D]">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66667 10 1.66667C5.39765 1.66667 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="#01A83D" strokeWidth="1.5"/>
                            <path d="M6.66669 10L8.88891 12.2222L13.3334 7.77778" stroke="#01A83D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[#01A83D] text-[14px] leading-[140%]">
                            Płatność została zrealizowana pomyślnie.
                        </span>
                    </div>
                )}

                {/* Skrócone szczegóły */}
                <section className={card}>
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#D9DADC]">
                        <div>
                            <span className={label}>Trasa</span>
                            <span className={value}>{originName} → {destName}</span>
                        </div>
                        <div className="text-right">
                            <span className={label}>Data</span>
                            <span className={value}>{formatDatePL(request.date)}, {request.time}</span>
                        </div>
                    </div>

                    {/* Pojazd - skrócony */}
                    {acceptedOffer.vehicle && (
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#D9DADC]">
                            {acceptedOffer.vehicle.photos && acceptedOffer.vehicle.photos.length > 0 && (
                                <div className="w-[60px] h-[60px] rounded-[8px] overflow-hidden shrink-0">
                                    <img src={acceptedOffer.vehicle.photos[0]} alt={acceptedOffer.vehicle.name} className="w-full h-full object-cover"/>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-[#010101] text-[16px] font-[600]">{acceptedOffer.vehicle.name}</p>
                                <p className="text-[#5B5E68] text-[14px] mt-0.5">
                                    {acceptedOffer.vehicle.brand} {acceptedOffer.vehicle.model} · {vehicleTypeLabels[acceptedOffer.vehicle.type] || acceptedOffer.vehicle.type} · {acceptedOffer.vehicle.seats} miejsc
                                </p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                                {acceptedOffer.vehicle.hasWifi && <span className={featureBadge}>WiFi</span>}
                                {acceptedOffer.vehicle.hasWC && <span className={featureBadge}>WC</span>}
                                {acceptedOffer.vehicle.hasTV && <span className={featureBadge}>TV</span>}
                                {acceptedOffer.vehicle.hasAirConditioning && <span className={featureBadge}>Klima</span>}
                            </div>
                        </div>
                    )}

                    {/* Wiadomość kierowcy */}
                    {acceptedOffer.message && (
                        <div className="bg-[#E6F6EC] rounded-[6px] px-4 py-3 mb-6">
                            <span className="text-[#5B5E68] text-[12px] block mb-1">Wiadomość od kierowcy</span>
                            <p className="text-[#5B5E68] text-[14px] italic">&quot;{acceptedOffer.message}&quot;</p>
                        </div>
                    )}

                    {/* Kwota */}
                    <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#D9DADC]">
                        <div>
                            <span className={label}>Do zapłaty</span>
                            <p className="text-[#0B298F] text-[32px] font-[600] leading-tight">{acceptedOffer.price} PLN</p>
                        </div>
                    </div>

                    {/* Przed płatnością: info + zgody + przycisk */}
                    {!isPaid && (
                        <div>
                            <div className="bg-[#F8F9FA] rounded-[8px] px-5 py-4 mb-6 flex items-start gap-3">
                                <svg className="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M9 9V5.5M9 12H9.0075M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z" stroke="#9B9DA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <p className="text-[#5B5E68] text-[14px] leading-[160%]">
                                    Dane kontaktowe kierowcy (imię, nazwisko, telefon, e-mail) oraz numer rejestracyjny pojazdu zostaną udostępnione po opłaceniu przejazdu.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 mb-6">
                                <button type="button" onClick={() => setAcceptTerms(!acceptTerms)} className="flex items-start gap-3 group cursor-pointer text-left">
                                    <div className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                                        acceptTerms ? "bg-[#0B298F] border-[#0B298F]" : "border-[#D9DADC] bg-white group-hover:border-[#9B9DA3]"
                                    }`}>
                                        {acceptTerms && <DraftCheckIcon/>}
                                    </div>
                                    <span className="text-[#5B5E68] text-[14px] leading-[160%]">
                                        Akceptuję regulamin serwisu oraz politykę prywatności.
                                    </span>
                                </button>
                                <button type="button" onClick={() => setAcceptCancellation(!acceptCancellation)} className="flex items-start gap-3 group cursor-pointer text-left">
                                    <div className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                                        acceptCancellation ? "bg-[#0B298F] border-[#0B298F]" : "border-[#D9DADC] bg-white group-hover:border-[#9B9DA3]"
                                    }`}>
                                        {acceptCancellation && <DraftCheckIcon/>}
                                    </div>
                                    <span className="text-[#5B5E68] text-[14px] leading-[160%]">
                                        Zapoznałem się z warunkami anulowania zamówienia.
                                    </span>
                                </button>
                            </div>
                            <button
                                onClick={handleMarkAsPaid}
                                disabled={isPaying || !canPay}
                                className="w-full bg-[#0B298F] hover:bg-[#091F6B] text-white py-3 rounded-xl font-[500] text-[16px] transition-colors disabled:opacity-50"
                            >
                                {isPaying ? "Przetwarzanie..." : `Zapłać ${acceptedOffer.price} PLN`}
                            </button>
                        </div>
                    )}

                    {/* Po płatności: dane kierowcy */}
                    {isPaid && (
                        <div className="flex flex-col gap-5">
                            <h3 className="text-[#0B298F] text-[18px] font-[500]">Dane kierowcy</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-[48px] h-[48px] rounded-full bg-[#E6F6EC] flex items-center justify-center shrink-0">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="#01A83D"/>
                                        <path d="M12 14C7.58 14 4 16.01 4 18.5V20H20V18.5C20 16.01 16.42 14 12 14Z" fill="#01A83D"/>
                                    </svg>
                                </div>
                                <div>
                                    <span className={label}>Imię i nazwisko</span>
                                    <span className={value}>{acceptedOffer.driverName || "Nieznany"}</span>
                                </div>
                            </div>
                            {acceptedOffer.driverPhone && (
                                <div>
                                    <span className={label}>Telefon</span>
                                    <span className={value}>{acceptedOffer.driverPhone}</span>
                                </div>
                            )}
                            {acceptedOffer.driverEmail && (
                                <div>
                                    <span className={label}>E-mail</span>
                                    <span className={value}>{acceptedOffer.driverEmail}</span>
                                </div>
                            )}
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({params}) => {
    const id = params?.id as string;
    const request = await getRequestById(id);

    if (!request) {
        return {notFound: true};
    }

    const isRequestAccepted = ["accepted", "paid", "completed"].includes(request.status);

    if (!isRequestAccepted) {
        return {
            redirect: {
                destination: `/request/${id}/offers`,
                permanent: false,
            },
        };
    }

    const offers = await getOffersByRequest(id);
    const foundOffer = offers.find((o) => o.status === "accepted" || o.status === "paid");

    const acceptedOffer = foundOffer ? {
        id: foundOffer.id,
        requestId: foundOffer.requestId,
        driverId: foundOffer.driverId,
        price: foundOffer.price,
        status: foundOffer.status,
        message: foundOffer.message || "",
        driverName: foundOffer.driverName || "",
        driverEmail: foundOffer.driverEmail || "",
        driverPhone: foundOffer.driverPhone || "",
        ...(foundOffer.vehicle && {
            vehicle: {
                id: foundOffer.vehicle.id,
                name: foundOffer.vehicle.name || "",
                type: foundOffer.vehicle.type || "",
                brand: foundOffer.vehicle.brand || "",
                model: foundOffer.vehicle.model || "",
                year: foundOffer.vehicle.year || 0,
                seats: foundOffer.vehicle.seats || 0,
                photos: foundOffer.vehicle.photos || [],
                hasWifi: foundOffer.vehicle.hasWifi ?? false,
                hasWC: foundOffer.vehicle.hasWC ?? false,
                hasTV: foundOffer.vehicle.hasTV ?? false,
                hasAirConditioning: foundOffer.vehicle.hasAirConditioning ?? false,
            },
        }),
    } : null;

    return {
        props: {
            request,
            acceptedOffer,
        },
    };
};
