import {useRouter} from "next/router";
import {useState, useEffect} from "react";
import {useSession} from "next-auth/react";
import LoginModal from "@/components/modals/LoginModal";
import RouteModal from "@/components/modals/RouteModal";
import DateTimeModal from "@/components/modals/DateTimeModal";
import PassengersModal from "@/components/modals/PassengersModal";
import RequestDetailsLayout, {detailsStyles, CardHeader} from "@/components/RequestDetailsLayout";
import {DraftCheckBadgeIcon} from "@/components/icons";
import type {SearchData, Route} from "@/models";
import {calculateRouteDistance} from "@/utils/geo";
import {Wifi, Bathroom, Tv, AirConditioner, EvPlug, Bag, Calendar} from "iconoir-react";

const optionsList = [
    {key: "wifi", label: "WiFi", icon: Wifi},
    {key: "wc", label: "WC", icon: Bathroom},
    {key: "tv", label: "Telewizor", icon: Tv},
    {key: "airConditioning", label: "Klimatyzacja", icon: AirConditioner},
    {key: "powerOutlet", label: "Gniazdko elektryczne", icon: EvPlug},
    {key: "extraLuggage", label: "Więcej miejsca na bagaż", icon: Bag},
];

type OptionsState = Record<string, boolean>;

export default function DraftDetailsPage() {
    const router = useRouter();
    const {data: session, status} = useSession();
    const [requestData, setRequestData] = useState<SearchData | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [options, setOptions] = useState<OptionsState>({});
    const [specialNotes, setSpecialNotes] = useState("");
    const [offerExpiresDate, setOfferExpiresDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
    const [offerExpiresTime, setOfferExpiresTime] = useState("23:59");
    const [activeModal, setActiveModal] = useState<"route" | "datetime" | "passengers" | "offerExpiry" | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("draft_request");
        if (stored) {
            const data: SearchData = JSON.parse(stored);
            // Oblicz dystans raz przy wejściu na stronę i zapisz w route
            if (!data.route.distanceKm) {
                data.route.distanceKm = calculateRouteDistance(data.route);
                localStorage.setItem("draft_request", JSON.stringify(data));
            }
            setRequestData(data);
            setOptions({
                wifi: data.options.wifi,
                wc: data.options.wc,
                tv: data.options.tv,
                airConditioning: data.options.airConditioning,
                powerOutlet: data.options.powerOutlet,
                extraLuggage: false,
            });
        } else {
            router.push("/");
        }
    }, [router]);

    const updateData = (patch: Partial<SearchData>) => {
        setRequestData((prev) => {
            if (!prev) return prev;
            const updated = {...prev, ...patch};
            localStorage.setItem("draft_request", JSON.stringify(updated));
            return updated;
        });
    };

    const handleRouteSave = (route: Route) => updateData({route});
    const handleDateTimeSave = (date: string, time: string) => updateData({date, time});
    const handlePassengersSave = (adults: number, children: number, needsChildSeats: boolean, childrenAges: number[]) => {
        updateData({adults, children, needsChildSeats, childrenAges});
    };

    const toggleOption = (key: string) => {
        setOptions((prev) => ({...prev, [key]: !prev[key]}));
    };

    const handlePublish = async () => {
        if (!session) {
            setIsLoginModalOpen(true);
            return;
        }
        if (!requestData) return;

        const updatedData = {
            ...requestData,
            options: {
                wifi: options.wifi,
                wc: options.wc,
                tv: options.tv,
                airConditioning: options.airConditioning,
                powerOutlet: options.powerOutlet,
            },
        };

        setIsPublishing(true);
        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ ...updatedData, offerExpiresAt: `${offerExpiresDate}T${offerExpiresTime}:00.000Z` }),
            });
            const result = await res.json();
            if (res.ok) {
                localStorage.removeItem("draft_request");
                router.push(`/request/${result.id}/offers`);
            }
        } catch (error) {
            console.error("Error publishing request:", error);
        } finally {
            setIsPublishing(false);
        }
    };

    if (!requestData) {
        return (
            <main className="py-8 px-4 max-w-[1250px] mx-auto">
                <p className="text-secondary">Ładowanie...</p>
            </main>
        );
    }

    const {route} = requestData;
    const childSeats = requestData.needsChildSeats ? requestData.children : 0;

    return (
        <>
            <RequestDetailsLayout
                route={route}
                date={requestData.date}
                time={requestData.time}
                adults={requestData.adults}
                childrenCount={requestData.children}
                childSeats={childSeats}
                activeStep={1}
                title="Twoje zapytanie zostało utworzone."
                subtitle="Potwierdź dane i dodaj wszelkie dodatkowe wymagania."
                onEditRoute={() => setActiveModal("route")}
                onEditDateTime={() => setActiveModal("datetime")}
                onEditPassengers={() => setActiveModal("passengers")}
            >
                {/* Dodatkowe wymagania */}
                <section className={detailsStyles.card}>
                    <CardHeader title="Dodatkowe wymagania" />

                    {/* Opcje — full-bleed toggle rows */}
                    <div className="flex flex-col -mx-8">
                        {optionsList.map(({key, label, icon: Icon}, idx) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => toggleOption(key)}
                                className="flex items-center gap-4 px-8 py-4 group hover:bg-[#F8F9FF] transition-colors text-left"
                            >
                                <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0 transition-colors ${options[key] ? "bg-accent-soft" : "bg-surface"}`}>
                                    <Icon width={18} height={18} color={options[key] ? "#0B298F" : "#8E8F96"} strokeWidth={1.8}/>
                                </div>
                                <span className={`flex-1 text-[15px] font-[500] transition-colors ${options[key] ? "text-ink" : "text-secondary"}`}>
                                    {label}
                                </span>
                                <div className={`relative w-[44px] h-[24px] rounded-full transition-colors shrink-0 ${options[key] ? "bg-navy" : "bg-line"}`}>
                                    <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${options[key] ? "translate-x-[23px]" : "translate-x-[3px]"}`}/>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Uwagi specjalne */}
                    <div className="mt-4 pt-2">
                        <p className="text-[11px] font-[600] uppercase tracking-wide text-secondary mb-1">Uwagi specjalne</p>
                        <p className="text-tertiary text-[13px] mb-3">Dodatkowe instrukcje lub pytania dla kierowcy</p>
                        <textarea
                            value={specialNotes}
                            onChange={(e) => setSpecialNotes(e.target.value)}
                            placeholder="Wpisz inne wymagania, instrukcje lub pytania dotyczące podróży..."
                            className="w-full bg-[#FCFDFD] border border-line rounded-[8px] px-4 py-3 text-[14px] text-ink placeholder:text-tertiary resize-none focus:border-navy focus:outline-none transition-colors"
                            rows={3}
                        />
                    </div>
                </section>

                {/* Ważność zapytania */}
                <section className={detailsStyles.card}>
                    <CardHeader title="Ważność zapytania" />
                    <p className="text-secondary text-[14px] -mt-4 mb-6">
                        Ustaw deadline — po tym czasie kierowcy nie będą mogli składać ofert.
                    </p>
                    <button
                        type="button"
                        onClick={() => setActiveModal("offerExpiry")}
                        className="flex items-center gap-4 -mx-8 px-8 py-4 w-[calc(100%+64px)] group hover:bg-[#F8F9FF] transition-colors rounded-b-[8px] border-t border-surface"
                    >
                        <div className="w-[40px] h-[40px] rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                            <Calendar width={18} height={18} color="#0B298F" strokeWidth={1.8}/>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[11px] font-[600] uppercase tracking-wide text-secondary mb-0.5">Termin ważności</p>
                            <p className={`text-[15px] font-[600] ${offerExpiresDate ? "text-ink" : "text-tertiary"}`}>
                                {offerExpiresDate ? `${offerExpiresDate} · ${offerExpiresTime}` : "Wybierz datę i godzinę"}
                            </p>
                        </div>
                        <span className="text-navy text-[13px] font-[500] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Zmień →</span>
                    </button>
                </section>

                {/* Zielony banner */}
                <div className="bg-success-bg rounded-[2px] px-4 py-2 flex items-center gap-3 border border-success mb-8 mt-8">
                    <div className="shrink-0"><DraftCheckBadgeIcon/></div>
                    <span className="text-success text-[14px] leading-[140%]">
                        Średni czas ofert przewoźników na podobne zlecenia to 11 minut.
                    </span>
                </div>

                {/* Przycisk */}
                <div className="flex justify-end">
                    {status === "loading" ? (
                        <button disabled
                                className="bg-gray-200 text-secondary px-8 py-3 rounded-xl font-[500] text-[16px]">
                            Ładowanie...
                        </button>
                    ) : (
                        <button
                            data-cy="btn-publish"
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="bg-navy hover:bg-navy-hover text-white px-8 py-3 rounded-xl font-[500] text-[16px] transition-colors disabled:opacity-50"
                        >
                            {isPublishing ? "Publikowanie..." : "Sprawdź oferty"}
                        </button>
                    )}
                </div>
            </RequestDetailsLayout>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />

            <RouteModal
                isOpen={activeModal === "route"}
                onClose={() => setActiveModal(null)}
                route={route}
                onSave={handleRouteSave}
                confirmLabel="Zapisz"
            />

            <DateTimeModal
                isOpen={activeModal === "datetime"}
                onClose={() => setActiveModal(null)}
                date={requestData.date}
                time={requestData.time}
                onSave={handleDateTimeSave}
                confirmLabel="Zapisz"
            />

            <PassengersModal
                isOpen={activeModal === "passengers"}
                onClose={() => setActiveModal(null)}
                adults={requestData.adults}
                children={requestData.children}
                needsChildSeats={requestData.needsChildSeats}
                childrenAges={requestData.childrenAges}
                onSave={handlePassengersSave}
                confirmLabel="Zapisz"
            />

            <DateTimeModal
                isOpen={activeModal === "offerExpiry"}
                onClose={() => setActiveModal(null)}
                date={offerExpiresDate}
                time={offerExpiresTime}
                onSave={(date, time) => {
                    setOfferExpiresDate(date);
                    setOfferExpiresTime(time);
                }}
                confirmLabel="Zapisz"
            />
        </>
    );
}
