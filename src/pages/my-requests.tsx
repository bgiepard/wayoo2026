import {GetServerSideProps} from "next";
import {getServerSession} from "next-auth";
import Link from "next/link";
import {useState, useEffect} from "react";
import {useRouter} from "next/router";
import {authOptions} from "./api/auth/[...nextauth]";
import {getRequestsByUserEmail, getOffersCountByRequestIds} from "@/services";
import type {RequestData, RequestStatus, Route} from "@/models";
import {formatDatePL} from "@/utils/formatDate";
import { formatDistanceToNow, isPast } from "date-fns";
import { pl } from "date-fns/locale";

interface RequestWithOffers extends RequestData {
    offersCount: number;
}

interface Props {
    requests: RequestWithOffers[];
}

type Tab = "active" | "completed";

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
    draft: {label: "Wersja robocza", bg: "bg-surface", text: "text-secondary", dot: "bg-tertiary", border: "border-line"},
    published_waiting: {label: "Oczekuje na oferty", bg: "bg-warning-bg", text: "text-warning", dot: "bg-warning", border: "border-warning-border"},
    published_offers: {label: "", bg: "bg-success-bg", text: "text-success", dot: "bg-success", border: "border-success-border"},
    accepted: {label: "Kierowca wybrany", bg: "bg-accent-soft", text: "text-navy", dot: "bg-navy", border: "border-accent-border"},
    completed: {label: "Zakończone", bg: "bg-surface", text: "text-secondary", dot: "bg-secondary", border: "border-line"},
    canceled: {label: "Anulowane", bg: "bg-danger-bg", text: "text-danger", dot: "bg-danger", border: "border-danger-border"},
};

function getStatusInfo(status: RequestStatus, offersCount: number) {
    if (status === "published" && offersCount > 0) {
        const label = `${offersCount} ${offersCount === 1 ? "oferta" : offersCount < 5 ? "oferty" : "ofert"}`;
        return {...statusConfig.published_offers, label};
    }
    if (status === "published") {
        return statusConfig.published_waiting;
    }
    return statusConfig[status] || statusConfig.draft;
}

const optionLabels: Record<string, string> = {
    wifi: "WiFi",
    wc: "WC",
    tv: "TV",
    airConditioning: "Klimatyzacja",
    powerOutlet: "Gniazdko",
};

const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
        return `${diffMinutes} min temu`;
    } else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? "godzinę" : diffHours < 5 ? "godziny" : "godzin"} temu`;
    } else {
        return `${diffDays} ${diffDays === 1 ? "dzień" : "dni"} temu`;
    }
};

function formatOfferExpiry(expiresAt: string | null): { label: string; expired: boolean; urgent: boolean } {
    if (!expiresAt) return { label: "", expired: false, urgent: false };
    const date = new Date(expiresAt);
    if (isPast(date)) return { label: "Wygasło", expired: true, urgent: false };
    const hoursLeft = (date.getTime() - Date.now()) / 3600000;
    const label = "Jeszcze " + formatDistanceToNow(date, { locale: pl });
    return { label, expired: false, urgent: hoursLeft < 24 };
}

const featureBadge = "text-[12px] bg-accent-soft text-navy px-2 py-0.5 rounded-[4px] font-[500]";

export default function MyRequestsPage({requests}: Props) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("active");

    useEffect(() => {
        if (router.query.tab === "completed") {
            setActiveTab("completed");
        }
    }, [router.query.tab]);

    const activeStatuses: RequestStatus[] = ["draft", "published", "accepted"];
    const completedStatuses: RequestStatus[] = ["completed", "canceled"];

    const activeRequests = requests.filter((r) => activeStatuses.includes(r.status));
    const completedRequests = requests.filter((r) => completedStatuses.includes(r.status));

    const displayedRequests = activeTab === "active" ? activeRequests : completedRequests;

    return (
        <main className="pb-16 px-4 max-w-[860px] mx-auto">

            {/* Nagłówek */}
            <div className="pt-10 pb-8 flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-[26px] font-[700] text-ink leading-tight">Moje zapytania</h1>
                    <p className="text-secondary text-[14px] mt-1.5">
                        {activeRequests.length > 0 || completedRequests.length > 0
                            ? `${activeRequests.length} aktywnych · ${completedRequests.length} zakończonych`
                            : "Przeglądaj swoje zlecenia i oferty przewoźników"}
                    </p>
                </div>
                <Link
                    href="/"
                    className="shrink-0 bg-navy hover:bg-navy-hover text-white px-5 py-2.5 rounded-xl font-[600] text-[14px] transition-colors"
                >
                    + Nowe zapytanie
                </Link>
            </div>

            {/* Taby */}
            <div className="flex border-b border-line mb-6">
                {(["active", "completed"] as Tab[]).map((tab) => {
                    const isActive = activeTab === tab;
                    const count = tab === "active" ? activeRequests.length : completedRequests.length;
                    const label = tab === "active" ? "Aktywne" : "Zakończone";
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-4 py-3 text-[14px] font-[500] transition-colors relative ${
                                isActive ? "text-navy" : "text-tertiary hover:text-secondary"
                            }`}
                        >
                            {label}
                            <span className={`text-[11px] font-[700] px-1.5 py-0.5 rounded-full tabular-nums ${
                                isActive ? "bg-navy text-white" : "bg-surface text-tertiary"
                            }`}>
                                {count}
                            </span>
                            {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-navy rounded-t-full"/>}
                        </button>
                    );
                })}
            </div>

            {/* Pusta lista */}
            {displayedRequests.length === 0 ? (
                <div className="bg-white rounded-[12px] border border-line py-16 px-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mx-auto mb-5">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="#9B9DA3" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <p className="text-ink text-[17px] font-[600] mb-2">
                        {activeTab === "active" ? "Brak aktywnych zapytań" : "Brak zakończonych zapytań"}
                    </p>
                    <p className="text-secondary text-[14px] max-w-[340px] mx-auto leading-relaxed">
                        {activeTab === "active"
                            ? "Złóż nowe zapytanie, a oferty od przewoźników pojawią się tutaj."
                            : "Twoje zakończone i anulowane zlecenia pojawią się tutaj."}
                    </p>
                    {activeTab === "active" && (
                        <Link
                            href="/"
                            className="inline-block mt-6 bg-navy hover:bg-navy-hover text-white px-7 py-2.5 rounded-xl font-[600] text-[14px] transition-colors"
                        >
                            Złóż zapytanie
                        </Link>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {displayedRequests.map((request) => {
                        const route: Route = JSON.parse(request.route || "{}");
                        const originName = route.origin?.address?.split(",")[0] || "—";
                        const destName = route.destination?.address?.split(",")[0] || "—";
                        const waypointsCount = route.waypoints?.length || 0;
                        const statusInfo = getStatusInfo(request.status, request.offersCount);
                        const options: Record<string, boolean> = JSON.parse(request.options || "{}");
                        const activeOptions = Object.entries(optionLabels).filter(([key]) => options[key]);
                        const totalPassengers = request.adults + request.children;
                        const hasOffers = request.status === "published" && request.offersCount > 0;
                        const isDraft = request.status === "draft";
                        const expiry = request.status === "published" ? formatOfferExpiry(request.offerExpiresAt) : null;

                        return (
                            <Link
                                key={request.id}
                                href={`/request/${request.id}`}
                                className={`block bg-white rounded-[10px] p-5 transition-all ${
                                    isDraft
                                        ? "border border-dashed border-line hover:border-navy"
                                        : "border border-line hover:border-navy"
                                }`}
                                style={hasOffers ? {boxShadow: "inset 3px 0 0 #01A83D, 0 1px 4px rgba(0,0,0,0.04)"} : {boxShadow: "0 1px 3px rgba(0,0,0,0.04)"}}
                            >
                                {/* Trasa + status */}
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {/* Connector kropki */}
                                        <div className="flex flex-col items-center shrink-0 mt-[3px]">
                                            <div className="w-[7px] h-[7px] rounded-full bg-navy"/>
                                            <div className="w-px bg-line" style={{height: waypointsCount > 0 ? "28px" : "16px", marginTop: "3px", marginBottom: "3px"}}/>
                                            <div className="w-[7px] h-[7px] rounded-full bg-navy"/>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[15px] font-[600] text-ink truncate leading-snug">{originName}</p>
                                            {waypointsCount > 0 && (
                                                <p className="text-[11px] text-tertiary my-[3px]">
                                                    + {waypointsCount} {waypointsCount === 1 ? "przystanek" : waypointsCount < 5 ? "przystanki" : "przystanków"}
                                                </p>
                                            )}
                                            <p className="text-[15px] font-[600] text-ink truncate leading-snug mt-1">{destName}</p>
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0 border ${statusInfo.bg} ${statusInfo.border}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusInfo.dot} ${request.status === "published" && !hasOffers ? "animate-pulse" : ""}`}/>
                                        <span className={`text-[12px] font-[600] ${statusInfo.text} whitespace-nowrap`}>{statusInfo.label}</span>
                                    </div>
                                </div>

                                {/* Meta */}
                                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[13px] text-secondary">
                                    <span>{formatDatePL(request.date)}</span>
                                    <span className="text-line">·</span>
                                    <span>{request.time}</span>
                                    <span className="text-line">·</span>
                                    <span>
                                        {totalPassengers} {totalPassengers === 1 ? "osoba" : totalPassengers < 5 ? "osoby" : "osób"}
                                        {request.children > 0 && <span className="text-tertiary"> (w tym {request.children} {request.children === 1 ? "dziecko" : "dzieci"})</span>}
                                    </span>
                                    {activeOptions.length > 0 && (
                                        <>
                                            <span className="text-line">·</span>
                                            <span className="flex items-center gap-1">
                                                {activeOptions.map(([key, label]) => (
                                                    <span key={key} className={featureBadge}>{label}</span>
                                                ))}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Dolny pasek */}
                                <div className="mt-3.5 pt-3.5 border-t border-surface flex items-center justify-between gap-4">
                                    <div className="text-[12px]">
                                        {expiry && expiry.label && (
                                            expiry.expired
                                                ? <span className="text-danger font-[500]">Przyjmowanie ofert: {expiry.label}</span>
                                                : expiry.urgent
                                                ? <span className="text-warning font-[500]">Przyjmowanie ofert: {expiry.label}</span>
                                                : <span className="text-tertiary">Przyjmowanie ofert: {expiry.label}</span>
                                        )}
                                        {!expiry?.label && isDraft && (
                                            <span className="text-tertiary">Wersja robocza — nie opublikowano</span>
                                        )}
                                    </div>
                                    <span className="text-tertiary text-[12px] shrink-0">{getTimeAgo(request.createdAt)}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({req, res}) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    const requests = await getRequestsByUserEmail(session.user.email);
    const requestIds = requests.map((r) => r.id);
    const offersCounts = await getOffersCountByRequestIds(requestIds);

    const requestsWithOffers: RequestWithOffers[] = requests.map((r) => ({
        ...r,
        offersCount: offersCounts[r.id] || 0,
    }));

    return {
        props: {
            requests: requestsWithOffers,
        },
    };
};
