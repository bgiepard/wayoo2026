import {type ReactNode} from "react";
import type {Route} from "@/models";
import {DraftEditIcon} from "@/components/icons";
import {formatDatePL} from "@/utils/formatDate";
import RequestSteps from "@/components/RequestSteps";
import RouteMap from "@/components/RouteMap";
import {Calendar, Clock, Group, Crib} from "iconoir-react";

// === Shared styles (kept for external use) ===

export const detailsStyles = {
    card: "bg-white rounded-[8px] p-8 border border-line",
    cardTitle: "text-navy text-[20px] font-[400]",
    rowList: "flex flex-col gap-6",
    row: "flex items-start gap-4",
    rowIcon: "mt-0.5 shrink-0",
    rowLabel: "text-secondary text-[14px] block mb-0.5",
    rowValue: "text-ink text-[16px] font-[600]",
};

export function DataRow({icon, label, value}: {icon: ReactNode; label: string; value: ReactNode}) {
    return (
        <div className={detailsStyles.row}>
            <div className={detailsStyles.rowIcon}>{icon}</div>
            <div>
                <span className={detailsStyles.rowLabel}>{label}</span>
                <span className={detailsStyles.rowValue}>{value}</span>
            </div>
        </div>
    );
}

export function CardHeader({title, editLabel, onEdit}: {title: string; editLabel?: string; onEdit?: () => void}) {
    return (
        <div className="flex justify-between items-center mb-8">
            <h3 className={detailsStyles.cardTitle}>{title}</h3>
            {onEdit && editLabel && (
                <button onClick={onEdit} className="flex items-center gap-2 text-navy text-[14px] font-[500] hover:opacity-80 transition-opacity">
                    <DraftEditIcon/>
                    <span className="hidden md:inline">{editLabel}</span>
                </button>
            )}
        </div>
    );
}

export function formatChildSeats(count: number): string {
    if (count === 1) return "1 fotelik";
    if (count >= 2 && count <= 4) return `${count} foteliki`;
    return `${count} fotelików`;
}

// === Layout component ===

interface RequestDetailsLayoutProps {
    route: Route;
    date: string;
    time: string;
    adults: number;
    childrenCount: number;
    childSeats: number;

    requestId?: string;
    activeStep: number;
    hasAcceptedOffer?: boolean;

    title: string;
    subtitle?: string;

    onEditRoute?: () => void;
    onEditDateTime?: () => void;
    onEditPassengers?: () => void;

    children?: ReactNode;
}

const iconCircle = "w-[40px] h-[40px] rounded-full bg-accent-soft flex items-center justify-center shrink-0";
const rowLabel = "text-[11px] font-[600] uppercase tracking-wide text-secondary mb-0.5";
const rowValue = "text-ink text-[15px] font-[600]";

export default function RequestDetailsLayout({
    route,
    date,
    time,
    adults,
    childrenCount,
    childSeats,
    requestId,
    activeStep,
    hasAcceptedOffer,
    title,
    subtitle,
    onEditRoute,
    onEditDateTime,
    onEditPassengers,
    children: extraContent,
}: RequestDetailsLayoutProps) {
    return (
        <main className="pb-12 px-4 max-w-[1250px] mx-auto">
            <RequestSteps
                activeStep={activeStep}
                requestId={requestId}
                hasAcceptedOffer={hasAcceptedOffer}
            />

            <h1 className={`text-center text-navy text-[26px] font-[400] ${subtitle ? "mb-3" : "mb-12"}`}>
                {title}
            </h1>
            {subtitle && (
                <h2 className="text-center text-secondary text-[16px] font-[400] mb-12">
                    {subtitle}
                </h2>
            )}

            <div className="flex flex-col md:flex-row gap-8">
                <div className="hidden md:block order-1 md:order-2 md:flex-1 md:sticky md:top-8 md:self-start">
                    <RouteMap route={route} height="600px" lightTheme/>
                </div>
                <div className="order-2 md:order-1 w-full md:w-[680px] shrink-0 flex flex-col gap-6">

                    {/* Punkty na trasie */}
                    <section className={detailsStyles.card}>
                        <CardHeader title="Punkty na trasie" editLabel="Edytuj punkty na trasie" onEdit={onEditRoute}/>
                        <div className="flex flex-col">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center self-stretch">
                                    <div className="w-3 h-3 rounded-full bg-navy shrink-0 mt-1"/>
                                    <div className="w-px flex-1 bg-[#D0D7F0] mt-1"/>
                                </div>
                                <div className="pb-5 flex-1">
                                    <p className={rowLabel}>Miejsce wyjazdu</p>
                                    <p className={rowValue}>{route.origin.address}</p>
                                </div>
                            </div>
                            {(route.waypoints || []).map((wp, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="flex flex-col items-center self-stretch">
                                        <div className="w-3 h-3 rounded-full border-2 border-navy bg-white shrink-0 mt-1"/>
                                        <div className="w-px flex-1 bg-[#D0D7F0] mt-1"/>
                                    </div>
                                    <div className="pb-5 flex-1">
                                        <p className={rowLabel}>Przystanek #{i + 1}</p>
                                        <p className={rowValue}>{wp.address}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-start gap-4">
                                <div className="w-3 h-3 rounded-full bg-navy shrink-0 mt-1"/>
                                <div className="flex-1">
                                    <p className={rowLabel}>Lokalizacja końcowa</p>
                                    <p className={rowValue}>{route.destination.address}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Termin wyjazdu */}
                    <section className={detailsStyles.card}>
                        <CardHeader title="Termin wyjazdu" editLabel="Edytuj termin wyjazdu" onEdit={onEditDateTime}/>
                        <div className="flex flex-col -mx-8">
                            <div className="flex items-center gap-4 px-8 py-4 border-b border-surface">
                                <div className={iconCircle}>
                                    <Calendar width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                                </div>
                                <div>
                                    <p className={rowLabel}>Data wyjazdu</p>
                                    <p className={rowValue}>{formatDatePL(date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 px-8 py-4">
                                <div className={iconCircle}>
                                    <Clock width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                                </div>
                                <div>
                                    <p className={rowLabel}>Godzina wyjazdu</p>
                                    <p className={rowValue}>{time}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pasażerowie */}
                    <section className={detailsStyles.card}>
                        <CardHeader title="Pasażerowie" editLabel="Edytuj liczbę pasażerów" onEdit={onEditPassengers}/>
                        <div className="flex flex-col -mx-8">
                            <div className="flex items-center gap-4 px-8 py-4 border-b border-surface">
                                <div className={iconCircle}>
                                    <Group width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                                </div>
                                <div>
                                    <p className={rowLabel}>Dorośli</p>
                                    <p className={rowValue}>{adults} dorosłych</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-4 px-8 py-4 ${childSeats > 0 ? "border-b border-surface" : ""}`}>
                                <div className={iconCircle}>
                                    <Group width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                                </div>
                                <div>
                                    <p className={rowLabel}>Dzieci</p>
                                    <p className={rowValue}>{childrenCount} dzieci</p>
                                </div>
                            </div>
                            {childSeats > 0 && (
                                <div className="flex items-center gap-4 px-8 py-4">
                                    <div className={iconCircle}>
                                        <Crib width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                                    </div>
                                    <div>
                                        <p className={rowLabel}>Foteliki dziecięce</p>
                                        <p className={rowValue}>{formatChildSeats(childSeats)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {extraContent}
                </div>
            </div>
        </main>
    );
}
