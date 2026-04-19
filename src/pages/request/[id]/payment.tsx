import {GetServerSideProps} from "next";
import {useRouter} from "next/router";
import {useState, useEffect} from "react";
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
    const { offerId, session_id, canceled } = router.query;
    const [request, setRequest] = useState(initialRequest);
    const [isPaying, setIsPaying] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptCancellation, setAcceptCancellation] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [pollingTimeout, setPollingTimeout] = useState(false);

    // Po powrocie ze Stripe z session_id — webhook mógł jeszcze nie zaktualizować Airtable,
    // więc pollujemy status przez chwilę
    useEffect(() => {
        if (!session_id || request.status === "paid" || request.status === "completed") return;

        setProcessingPayment(true);
        setPollingTimeout(false);
        let attempts = 0;
        const maxAttempts = 10;

        const interval = setInterval(async () => {
            attempts++;
            try {
                const res = await fetch(`/api/requests/${request.id}/status-check`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "paid" || data.status === "completed") {
                        setRequest((prev) => ({...prev, status: data.status}));
                        setProcessingPayment(false);
                        clearInterval(interval);
                    }
                }
            } catch {
                // ignoruj błędy sieciowe podczas pollingu
            }

            if (attempts >= maxAttempts) {
                setProcessingPayment(false);
                setPollingTimeout(true);
                clearInterval(interval);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [session_id]);

    const canPay = acceptTerms && acceptCancellation;
    const isRequestAccepted = ["published", "paid", "completed"].includes(request.status);
    const isPaid = request.status === "paid" || request.status === "completed";
    const route: Route = JSON.parse(request.route || "{}");

    const handleMarkAsPaid = async () => {
        setIsPaying(true);
        try {
            const res = await fetch("/api/stripe/create-checkout-session", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({requestId: request.id, offerId: offerId as string}),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("Brak URL płatności:", data);
            }
        } catch (error) {
            console.error("Błąd inicjowania płatności:", error);
        } finally {
            setIsPaying(false);
        }
    };

    const handleRefresh = () => {
        router.replace(router.asPath);
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

                <button
                    onClick={() => router.push(`/request/${request.id}/offers`)}
                    className="flex items-center gap-2 text-[#5B5E68] hover:text-[#010101] text-[14px] transition-colors self-start"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Powrót do ofert
                </button>

                {/* Banner - przetwarzanie płatności (po powrocie ze Stripe, przed webhookiem) */}
                {processingPayment && (
                    <div className="bg-[#EEF2FF] rounded-[2px] px-4 py-2 flex items-center gap-3 border border-[#0B298F]">
                        <svg className="animate-spin shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#0B298F" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12"/>
                        </svg>
                        <span className="text-[#0B298F] text-[14px]">
                            Przetwarzamy Twoją płatność… To może chwilę potrwać.
                        </span>
                    </div>
                )}

                {/* Banner - timeout pollingu (webhook nie zdążył) */}
                {pollingTimeout && !isPaid && (
                    <div className="bg-[#FFF9E6] rounded-[2px] px-4 py-2 flex items-center gap-3 border border-[#B8860B]">
                        <svg className="shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66667 10 1.66667C5.39765 1.66667 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="#B8860B" strokeWidth="1.5"/>
                            <path d="M10 6.66667V10M10 13.3333H10.0083" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span className="text-[#B8860B] text-[14px] leading-[140%] flex-1">
                            Weryfikujemy Twoją płatność — to może potrwać kilka minut. Odśwież stronę lub sprawdź e-mail.
                        </span>
                        <button
                            onClick={handleRefresh}
                            className="text-[#B8860B] font-[500] text-[14px] hover:underline shrink-0"
                        >
                            Odśwież
                        </button>
                    </div>
                )}

                {/* Banner - płatność anulowana */}
                {canceled && !isPaid && (
                    <div className="bg-[#FFF3F3] rounded-[2px] px-4 py-2 flex items-center gap-3 border border-[#E53935]">
                        <svg className="shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66667 10 1.66667C5.39765 1.66667 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="#E53935" strokeWidth="1.5"/>
                            <path d="M12.5 7.5L7.5 12.5M7.5 7.5L12.5 12.5" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span className="text-[#E53935] text-[14px]">
                            Płatność została anulowana. Możesz spróbować ponownie.
                        </span>
                    </div>
                )}

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
                        <div className="flex items-center gap-4 mb-6">
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
                        <div className="bg-[#F8F9FA] rounded-[6px] px-4 py-3 mb-6">
                            <span className="text-[#5B5E68] text-[12px] block mb-1">Wiadomość dodatkowa</span>
                            <p className="text-[#5B5E68] text-[14px] italic">&quot;{acceptedOffer.message}&quot;</p>
                        </div>
                    )}

                    {/* Przed płatnością: info + zgody + przycisk (ukryte przy timeout pollingu) */}
                    {!isPaid && !pollingTimeout && (
                        <div>
                            <div className="bg-[#E7EAF4] rounded-[8px] px-5 py-4 mb-6 flex items-start gap-3">
                                <svg className="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M9 9V5.5M9 12H9.0075M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z" stroke="#9B9DA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <p className="text-[#5B5E68] text-[14px] leading-[160%]">
                                    Dane kontaktowe kierowcy (imię, nazwisko, telefon, e-mail) oraz numer rejestracyjny pojazdu zostaną udostępnione po opłaceniu przejazdu.
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row items-start gap-6 pt-6 border-t border-[#D9DADC]">
                                {/* Cena + przycisk (na mobile na górze) */}
                                <div className="w-full md:w-1/2 order-1 md:order-2 flex items-center justify-between md:justify-end gap-6">
                                    <p className="text-[#0B298F] text-[32px] font-[600] leading-tight">{acceptedOffer.price} PLN</p>
                                    <button
                                        onClick={handleMarkAsPaid}
                                        disabled={isPaying || !canPay}
                                        className="bg-[#0B298F] hover:bg-[#091F6B] text-white px-8 py-3 rounded-xl font-[500] text-[16px] transition-colors disabled:opacity-50"
                                    >
                                        {isPaying ? "Przetwarzanie..." : "Zapłać"}
                                    </button>
                                </div>

                                {/* Regulaminy (na mobile na dole) */}
                                <div className="w-full md:w-1/2 order-2 md:order-1 flex flex-col gap-3">
                                    <button type="button" onClick={() => setAcceptTerms(!acceptTerms)} className="flex items-start gap-3 group cursor-pointer text-left">
                                        <div className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                                            acceptTerms ? "bg-[#0B298F] border-[#0B298F]" : "border-[#D9DADC] bg-white group-hover:border-[#9B9DA3]"
                                        }`}>
                                            {acceptTerms && <DraftCheckIcon/>}
                                        </div>
                                        <span className="text-[#5B5E68] text-[14px] leading-[160%]">
                                            Akceptuję regulamin serwisu oraz politykę prywatności.<span className="text-red-500 ml-0.5">*</span>
                                        </span>
                                    </button>
                                    <button type="button" onClick={() => setAcceptCancellation(!acceptCancellation)} className="flex items-start gap-3 group cursor-pointer text-left">
                                        <div className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                                            acceptCancellation ? "bg-[#0B298F] border-[#0B298F]" : "border-[#D9DADC] bg-white group-hover:border-[#9B9DA3]"
                                        }`}>
                                            {acceptCancellation && <DraftCheckIcon/>}
                                        </div>
                                        <span className="text-[#5B5E68] text-[14px] leading-[160%]">
                                            Zapoznałem się z warunkami anulowania zamówienia.<span className="text-red-500 ml-0.5">*</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Po płatności: dane kierowcy + co dalej */}
                    {isPaid && (
                        <div className="flex flex-col gap-6">
                            <h3 className="text-[#0B298F] text-[20px] font-[600]">Dane kontaktowe kierowcy</h3>

                            {/* Karta kontaktowa */}
                            <div className="bg-[#F8F9FA] rounded-[8px] p-5 border border-[#D9DADC]">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-[56px] h-[56px] rounded-full bg-[#E6F6EC] flex items-center justify-center shrink-0">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="#01A83D"/>
                                            <path d="M12 14C7.58 14 4 16.01 4 18.5V20H20V18.5C20 16.01 16.42 14 12 14Z" fill="#01A83D"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className={label}>Imię i nazwisko</span>
                                        <span className={value}>{acceptedOffer.driverName || "Nieznany"}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {acceptedOffer.driverPhone && (
                                        <div className="flex items-center gap-3">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                                                <path d="M18.3084 15.275C18.3084 15.575 18.2417 15.8833 18.1001 16.1833C17.9584 16.4833 17.7751 16.7667 17.5334 17.0333C17.1251 17.4833 16.6751 17.8083 16.1667 18.0167C15.6667 18.225 15.1251 18.3333 14.5417 18.3333C13.6917 18.3333 12.7834 18.1333 11.8251 17.725C10.8667 17.3167 9.90841 16.7667 8.95841 16.075C8.00008 15.375 7.09175 14.6 6.22508 13.7417C5.36675 12.875 4.59175 11.9667 3.90008 11.0167C3.21675 10.0667 2.66675 9.11667 2.26675 8.175C1.86675 7.225 1.66675 6.31667 1.66675 5.45C1.66675 4.88333 1.76675 4.34167 1.96675 3.84167C2.16675 3.33333 2.48341 2.86667 2.92508 2.45C3.45841 1.925 4.04175 1.66667 4.65841 1.66667C4.89175 1.66667 5.12508 1.71667 5.33341 1.81667C5.55008 1.91667 5.74175 2.06667 5.89175 2.28333L7.82508 5.00833C7.97508 5.21667 8.08341 5.40833 8.15841 5.59167C8.23341 5.76667 8.27508 5.94167 8.27508 6.1C8.27508 6.3 8.21675 6.5 8.10008 6.69167C7.99175 6.88333 7.83341 7.08333 7.63341 7.28333L7.00008 7.94167C6.90841 8.03333 6.86675 8.14167 6.86675 8.275C6.86675 8.34167 6.87508 8.4 6.89175 8.46667C6.91675 8.53333 6.94175 8.58333 6.95841 8.63333C7.10841 8.90833 7.36675 9.26667 7.73341 9.7C8.10841 10.1333 8.50841 10.575 8.94175 11.0167C9.39175 11.4583 9.82508 11.8667 10.2667 12.2417C10.7001 12.6083 11.0584 12.8583 11.3417 13.0083C11.3834 13.025 11.4334 13.05 11.4917 13.075C11.5584 13.1 11.6251 13.1083 11.7001 13.1083C11.8417 13.1083 11.9501 13.0583 12.0417 12.9667L12.6751 12.3417C12.8834 12.1333 13.0834 11.975 13.2751 11.875C13.4667 11.7583 13.6584 11.7 13.8667 11.7C14.0251 11.7 14.1917 11.7333 14.3751 11.8083C14.5584 11.8833 14.7501 11.9917 14.9584 12.1333L17.7167 14.0917C17.9334 14.2417 18.0834 14.4167 18.1751 14.625C18.2584 14.8333 18.3084 15.0417 18.3084 15.275Z" stroke="#5B5E68" strokeWidth="1.5" strokeMiterlimit="10"/>
                                            </svg>
                                            <div>
                                                <span className={label}>Telefon</span>
                                                <a href={`tel:${acceptedOffer.driverPhone}`} className="text-[#0B298F] text-[16px] font-[600] hover:underline">
                                                    {acceptedOffer.driverPhone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {acceptedOffer.driverEmail && (
                                        <div className="flex items-center gap-3">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                                                <path d="M14.1667 17.0833H5.83341C3.33341 17.0833 1.66675 15.8333 1.66675 12.9167V7.08333C1.66675 4.16667 3.33341 2.91667 5.83341 2.91667H14.1667C16.6667 2.91667 18.3334 4.16667 18.3334 7.08333V12.9167C18.3334 15.8333 16.6667 17.0833 14.1667 17.0833Z" stroke="#5B5E68" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M14.1667 7.5L11.5584 9.58333C10.7001 10.2667 9.29175 10.2667 8.43341 9.58333L5.83341 7.5" stroke="#5B5E68" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <div>
                                                <span className={label}>E-mail</span>
                                                <a href={`mailto:${acceptedOffer.driverEmail}`} className="text-[#0B298F] text-[16px] font-[600] hover:underline">
                                                    {acceptedOffer.driverEmail}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sekcja "Co dalej?" */}
                            <div className="bg-[#E7EAF4] rounded-[8px] px-5 py-4">
                                <h4 className="text-[#0B298F] text-[16px] font-[600] mb-3">Co dalej?</h4>
                                <ul className="space-y-2.5">
                                    <li className="flex items-start gap-2.5">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
                                            <circle cx="10" cy="10" r="8" stroke="#0B298F" strokeWidth="1.5"/>
                                            <path d="M7 10L9 12L13 8" stroke="#0B298F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span className="text-[#5B5E68] text-[14px] leading-[160%]">Kierowca skontaktuje się z Tobą w sprawie szczegółów przejazdu</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
                                            <circle cx="10" cy="10" r="8" stroke="#0B298F" strokeWidth="1.5"/>
                                            <path d="M7 10L9 12L13 8" stroke="#0B298F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span className="text-[#5B5E68] text-[14px] leading-[160%]">Dane kontaktowe kierowcy zostały też wysłane na Twój adres e-mail</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
                                            <circle cx="10" cy="10" r="8" stroke="#0B298F" strokeWidth="1.5"/>
                                            <path d="M7 10L9 12L13 8" stroke="#0B298F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span className="text-[#5B5E68] text-[14px] leading-[160%]">W razie pytań skontaktuj się bezpośrednio z kierowcą</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Przycisk powrotu do listy zapytań */}
                            <button
                                onClick={() => router.push("/my-requests")}
                                className="w-full bg-white hover:bg-[#F8F9FA] border-2 border-[#0B298F] text-[#0B298F] px-6 py-3 rounded-xl font-[600] text-[16px] transition-colors"
                            >
                                Moje zapytania
                            </button>
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({params, query}) => {
    const id = params?.id as string;
    const offerId = query.offerId as string | undefined;
    const request = await getRequestById(id);

    if (!request) {
        return {notFound: true};
    }

    const isRequestAccepted = ["published", "paid", "completed"].includes(request.status);

    if (!isRequestAccepted) {
        return {
            redirect: {
                destination: `/request/${id}/offers`,
                permanent: false,
            },
        };
    }

    const offers = await getOffersByRequest(id);
    const foundOffer = offerId
        ? offers.find((o) => o.id === offerId)
        : offers.find((o) => o.status === "paid");

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
