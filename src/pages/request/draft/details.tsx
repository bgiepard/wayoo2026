import {useRouter} from "next/router";
import {useState, useEffect} from "react";
import {useSession} from "next-auth/react";
import LoginModal from "@/components/LoginModal";
import RouteModal from "@/components/RouteModal";
import DateTimeModal from "@/components/DateTimeModal";
import PassengersModal from "@/components/PassengersModal";
import RequestDetailsLayout, {detailsStyles} from "@/components/RequestDetailsLayout";
import {DraftCheckBadgeIcon, DraftCheckIcon} from "@/components/icons";
import type {SearchData, Route} from "@/models";

const optionsList = [
    {key: "wifi", label: "Wifi"},
    {key: "wc", label: "WC"},
    {key: "tv", label: "Telewizor"},
    {key: "airConditioning", label: "Klimatyzacja"},
    {key: "powerOutlet", label: "Gniazdko elektryczne"},
    {key: "extraLuggage", label: "Więcej miejsca na bagaż"},
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
    const [activeModal, setActiveModal] = useState<"route" | "datetime" | "passengers" | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("draft_request");
        if (stored) {
            const data: SearchData = JSON.parse(stored);
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
                body: JSON.stringify(updatedData),
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
                <p className="text-[#5B5E68]">Ładowanie...</p>
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
                    <h3 className={`${detailsStyles.cardTitle} mb-2`}>Dodatkowe wymagania</h3>
                    <p className="text-[#5B5E68] text-[16px] mb-6">Wybierz dodatkowe potrzeby dotyczące podróży</p>

                    <div className="flex flex-col gap-4 mb-8">
                        {optionsList.map(({key, label}) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => toggleOption(key)}
                                className="flex items-center gap-3 group cursor-pointer"
                            >
                                <div
                                    className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center transition-colors shrink-0 ${
                                        options[key]
                                            ? "bg-[#0B298F] border-[#0B298F]"
                                            : "border-[#D9DADC] bg-white group-hover:border-[#9B9DA3]"
                                    }`}
                                >
                                    {options[key] && <DraftCheckIcon/>}
                                </div>
                                <span className="text-[#010101] text-[16px]">{label}</span>
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="text-[#5B5E68] text-[14px] font-[500] block mb-2">
                            Uwagi specjalne – instrukcje
                        </label>
                        <textarea
                            value={specialNotes}
                            onChange={(e) => setSpecialNotes(e.target.value)}
                            placeholder="Wpisz inne wymagania, instrukcje lub pytania dotyczące podróży..."
                            className="w-full bg-[#FCFDFD] border border-[#D9DADC] rounded-[6px] px-4 py-2 text-[14px] text-[#010101] placeholder:text-[#9B9DA3] resize-none focus:border-[#0B298F] focus:ring-0 transition-colors"
                            rows={2}
                        />
                    </div>
                </section>

                {/* Zielony banner */}
                <div className="bg-[#E6F6EC] rounded-[2px] px-4 py-2 flex items-center gap-3 border border-[#01A83D] mb-8 mt-8">
                    <div className="shrink-0"><DraftCheckBadgeIcon/></div>
                    <span className="text-[#01A83D] text-[14px] leading-[140%]">
                        Średni czas ofert przewoźników na podobne zlecenia to 11 minut.
                    </span>
                </div>

                {/* Przycisk */}
                <div className="flex justify-end">
                    {status === "loading" ? (
                        <button disabled
                                className="bg-gray-200 text-[#5B5E68] px-8 py-3 rounded-xl font-[500] text-[16px]">
                            Ładowanie...
                        </button>
                    ) : (
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="bg-[#0B298F] hover:bg-[#091F6B] text-white px-8 py-3 rounded-xl font-[500] text-[16px] transition-colors disabled:opacity-50"
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
        </>
    );
}
