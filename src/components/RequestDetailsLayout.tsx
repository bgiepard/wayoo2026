import {type ReactNode} from "react";
import type {Route} from "@/models";
import {
    DraftOriginIcon,
    DraftWaypointIcon,
    DraftDestinationIcon,
    DraftCalendarIcon,
    DraftClockIcon,
    DraftUsersIcon,
    DraftChildSeatIcon,
    DraftEditIcon,
} from "@/components/icons";
import {formatDatePL} from "@/lib/formatDate";
import RequestSteps from "@/components/RequestSteps";
import RouteMap from "@/components/RouteMap";

// === Shared styles ===

export const detailsStyles = {
    card: "bg-white rounded-[8px] p-8 border border-[#D9DADC]",
    cardTitle: "text-[#0B298F] text-[20px] font-[400]",
    rowList: "flex flex-col gap-6",
    row: "flex items-start gap-4",
    rowIcon: "mt-0.5 shrink-0",
    rowLabel: "text-[#5B5E68] text-[14px] block mb-0.5",
    rowValue: "text-[#010101] text-[16px] font-[600]",
};

// === Shared sub-components ===

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
                <button onClick={onEdit} className="flex items-center gap-2 text-[#0B298F] text-[14px] font-[500] hover:opacity-80 transition-opacity">
                    <DraftEditIcon/>
                    {editLabel}
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

            <h1 className={`text-center text-[#0B298F] text-[26px] font-[400] ${subtitle ? "mb-3" : "mb-12"}`}>
                {title}
            </h1>
            {subtitle && (
                <h2 className="text-center text-[#5B5E68] text-[16px] font-[400] mb-12">
                    {subtitle}
                </h2>
            )}

            <div className="flex gap-8">
                <div className="w-[680px] shrink-0 flex flex-col gap-6">
                    {/* Punkty na trasie */}
                    <section className={detailsStyles.card}>
                        <CardHeader title="Punkty na trasie" editLabel="Edytuj punkty na trasie" onEdit={onEditRoute}/>
                        <div className={detailsStyles.rowList}>
                            <DataRow icon={<DraftOriginIcon/>} label="Miejsce wyjazdu" value={route.origin.address}/>
                            {(route.waypoints || []).map((wp, i) => (
                                <DataRow key={i} icon={<DraftWaypointIcon/>} label={`Przystanek #${i + 1}`} value={wp.address}/>
                            ))}
                            <DataRow icon={<DraftDestinationIcon/>} label="Lokalizacja końcowa" value={route.destination.address}/>
                        </div>
                    </section>

                    {/* Termin wyjazdu */}
                    <section className={detailsStyles.card}>
                        <CardHeader title="Termin wyjazdu" editLabel="Edytuj termin wyjazdu" onEdit={onEditDateTime}/>
                        <div className={detailsStyles.rowList}>
                            <DataRow icon={<DraftCalendarIcon/>} label="Termin wyjazdu" value={formatDatePL(date)}/>
                            <DataRow icon={<DraftClockIcon/>} label="Godzina wyjazdu" value={time}/>
                        </div>
                    </section>

                    {/* Pasażerowie */}
                    <section className={detailsStyles.card}>
                        <CardHeader title="Pasażerowie" editLabel="Edytuj liczbę pasażerów" onEdit={onEditPassengers}/>
                        <div className={detailsStyles.rowList}>
                            <DataRow icon={<DraftUsersIcon/>} label="Dorośli" value={`${adults} dorosłych`}/>
                            <DataRow icon={<DraftUsersIcon/>} label="Dzieci" value={`${childrenCount} dzieci`}/>
                            <DataRow icon={<DraftChildSeatIcon/>} label="Liczba fotelików" value={formatChildSeats(childSeats)}/>
                        </div>
                    </section>

                    {extraContent}
                </div>
                <div className="flex-1 sticky top-8 self-start">
                    <RouteMap route={route} height="600px" lightTheme/>
                </div>
            </div>
        </main>
    );
}
