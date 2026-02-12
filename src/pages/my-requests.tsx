import {GetServerSideProps} from "next";
import {getServerSession} from "next-auth";
import Link from "next/link";
import {useState} from "react";
import {authOptions} from "./api/auth/[...nextauth]";
import {getRequestsByUserEmail, getOffersCountByRequestIds} from "@/services";
import type {RequestData, RequestStatus, Route} from "@/models";
import {formatDatePL} from "@/lib/formatDate";
import {
    DraftOriginIcon,
    DraftDestinationIcon,
    DraftCalendarIcon,
    DraftClockIcon,
    DraftUsersIcon,
} from "@/components/icons";

interface RequestWithOffers extends RequestData {
    offersCount: number;
}

interface Props {
    requests: RequestWithOffers[];
}

type Tab = "active" | "completed";

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
    draft: {label: "Wersja robocza", bg: "bg-[#F0F1F3]", text: "text-[#5B5E68]", dot: "bg-[#9B9DA3]", border: "border-[#D9DADC]"},
    published_waiting: {label: "Oczekuje na oferty", bg: "bg-[#FFF8E1]", text: "text-[#B8860B]", dot: "bg-[#B8860B]", border: "border-[#E6D08A]"},
    published_offers: {label: "", bg: "bg-[#E6F6EC]", text: "text-[#01A83D]", dot: "bg-[#01A83D]", border: "border-[#A3DFB8]"},
    accepted: {label: "Oczekuje na platnosc", bg: "bg-[#FFF3E0]", text: "text-[#E65100]", dot: "bg-[#E65100]", border: "border-[#F5C28B]"},
    paid: {label: "Oplacone", bg: "bg-[#E6F6EC]", text: "text-[#01A83D]", dot: "bg-[#01A83D]", border: "border-[#A3DFB8]"},
    completed: {label: "Zakonczone", bg: "bg-[#F0F1F3]", text: "text-[#5B5E68]", dot: "bg-[#5B5E68]", border: "border-[#D9DADC]"},
    cancelled: {label: "Anulowane", bg: "bg-[#FDEAEA]", text: "text-[#D32F2F]", dot: "bg-[#D32F2F]", border: "border-[#F0B8B8]"},
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
        return `${diffHours} ${diffHours === 1 ? "godzine" : diffHours < 5 ? "godziny" : "godzin"} temu`;
    } else {
        return `${diffDays} ${diffDays === 1 ? "dzien" : "dni"} temu`;
    }
};

const featureBadge = "text-[12px] bg-[#EEF2FF] text-[#0B298F] px-2 py-0.5 rounded-[4px] font-[500]";

export default function MyRequestsPage({requests}: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("active");

    const activeStatuses: RequestStatus[] = ["draft", "published", "accepted", "paid"];
    const completedStatuses: RequestStatus[] = ["completed", "cancelled"];

    const activeRequests = requests.filter((r) => activeStatuses.includes(r.status));
    const completedRequests = requests.filter((r) => completedStatuses.includes(r.status));

    const displayedRequests = activeTab === "active" ? activeRequests : completedRequests;

    return (
        <main className="pb-12 px-4 max-w-[1250px] mx-auto">
            {/* Naglowek */}
            <div className="pt-12 mb-10">
                <h1 className="text-center text-[#0B298F] text-[26px] font-[400] mb-3">
                    Moje zapytania
                </h1>
                <h2 className="text-center text-[#5B5E68] text-[16px] font-[400]">
                    Przegladaj swoje zlecenia transportowe i sprawdzaj oferty przewoznikow.
                </h2>
            </div>

            {/* Taby */}
            <div className="flex gap-1 mb-8 border-b border-[#D9DADC]">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`px-5 py-3 text-[14px] font-[500] transition-colors relative ${
                        activeTab === "active"
                            ? "text-[#0B298F]"
                            : "text-[#9B9DA3] hover:text-[#5B5E68]"
                    }`}
                >
                    Aktywne ({activeRequests.length})
                    {activeTab === "active" && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0B298F]"/>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-5 py-3 text-[14px] font-[500] transition-colors relative ${
                        activeTab === "completed"
                            ? "text-[#0B298F]"
                            : "text-[#9B9DA3] hover:text-[#5B5E68]"
                    }`}
                >
                    Zakonczone ({completedRequests.length})
                    {activeTab === "completed" && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0B298F]"/>
                    )}
                </button>
            </div>

            {/* Pusta lista */}
            {displayedRequests.length === 0 ? (
                <div className="bg-white rounded-[8px] border border-[#D9DADC] p-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F0F1F3] flex items-center justify-center mx-auto mb-6">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="#9B9DA3" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <p className="text-[#010101] text-[18px] font-[500] mb-2">
                        {activeTab === "active" ? "Brak aktywnych zapytan" : "Brak zakonczonych zapytan"}
                    </p>
                    <p className="text-[#5B5E68] text-[14px] max-w-[360px] mx-auto">
                        {activeTab === "active"
                            ? "Zloz nowe zapytanie transportowe, a oferty pojawia sie tutaj."
                            : "Twoje zakonczone i anulowane zlecenia pojawia sie tutaj."}
                    </p>
                    {activeTab === "active" && (
                        <Link
                            href="/"
                            className="inline-block mt-6 bg-[#0B298F] hover:bg-[#091F6B] text-white px-8 py-3 rounded-xl font-[500] text-[16px] transition-colors"
                        >
                            Zloz zapytanie
                        </Link>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {displayedRequests.map((request) => {
                        const route: Route = JSON.parse(request.route || "{}");
                        const originName = route.origin?.address?.split(",")[0] || "Brak";
                        const destName = route.destination?.address?.split(",")[0] || "Brak";
                        const waypointsCount = route.waypoints?.length || 0;
                        const statusInfo = getStatusInfo(request.status, request.offersCount);
                        const options: Record<string, boolean> = JSON.parse(request.options || "{}");
                        const activeOptions = Object.entries(optionLabels).filter(([key]) => options[key]);
                        const totalPassengers = request.adults + request.children;

                        return (
                            <Link
                                key={request.id}
                                href={`/request/${request.id}`}
                                className="bg-white rounded-[8px] border border-[#D9DADC] p-6 hover:border-[#0B298F] transition-all group"
                            >
                                {/* Gora: trasa + status */}
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <DraftOriginIcon/>
                                            <span className="text-[#010101] text-[16px] font-[600] truncate">
                                                {originName}
                                            </span>
                                        </div>
                                        {waypointsCount > 0 && (
                                            <div className="ml-[28px] mb-1">
                                                <span className="text-[#9B9DA3] text-[13px]">
                                                    + {waypointsCount} {waypointsCount === 1 ? "przystanek" : waypointsCount < 5 ? "przystanki" : "przystankow"}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <DraftDestinationIcon/>
                                            <span className="text-[#010101] text-[16px] font-[600] truncate">
                                                {destName}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0 ml-4 border ${statusInfo.bg} ${statusInfo.border}`}>
                                        <div className={`w-[6px] h-[6px] rounded-full ${statusInfo.dot}`}/>
                                        <span className={`text-[13px] font-[500] ${statusInfo.text}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Separator */}
                                <div className="border-t border-[#D9DADC] mb-5"/>

                                {/* Srodek: data, godzina, pasazerowie */}
                                <div className="flex items-center gap-6 mb-4 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <DraftCalendarIcon/>
                                        <span className="text-[#5B5E68] text-[14px]">
                                            {formatDatePL(request.date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DraftClockIcon/>
                                        <span className="text-[#5B5E68] text-[14px]">
                                            {request.time}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DraftUsersIcon/>
                                        <span className="text-[#5B5E68] text-[14px]">
                                            {totalPassengers} {totalPassengers === 1 ? "osoba" : totalPassengers < 5 ? "osoby" : "osob"}
                                            {request.children > 0 && (
                                                <span className="text-[#9B9DA3]"> (w tym {request.children} {request.children === 1 ? "dziecko" : "dzieci"})</span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Dol: opcje + czas zlozenia */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {activeOptions.map(([key, label]) => (
                                            <span key={key} className={featureBadge}>{label}</span>
                                        ))}
                                    </div>
                                    <span className="text-[#9B9DA3] text-[13px] shrink-0 ml-4">
                                        {getTimeAgo(request.createdAt)}
                                    </span>
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
