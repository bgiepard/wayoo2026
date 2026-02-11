import {GetServerSideProps} from "next";
import {getRequestById} from "@/services";
import type {RequestData, Route} from "@/models";
import RequestDetailsLayout, {detailsStyles} from "@/components/RequestDetailsLayout";
import {DraftCheckIcon} from "@/components/icons";

const optionLabels: Record<string, string> = {
    wifi: "WiFi",
    wc: "WC",
    tv: "Telewizor",
    airConditioning: "Klimatyzacja",
    powerOutlet: "Gniazdko elektryczne",
};

interface Props {
    request: RequestData;
}

export default function RequestDetailsPage({request}: Props) {
    const isRequestAccepted = ["accepted", "paid", "completed"].includes(request.status);
    const options: Record<string, boolean> = JSON.parse(request.options || "{}");
    const route: Route = JSON.parse(request.route || "{}");

    return (
        <RequestDetailsLayout
            route={route}
            date={request.date}
            time={request.time}
            adults={request.adults}
            childrenCount={request.children}
            childSeats={0}
            requestId={request.id}
            activeStep={1}
            hasAcceptedOffer={isRequestAccepted}
            title="Szczegóły zapytania"
        >
            {/* Dodatkowe wymagania - read only */}
            <section className={detailsStyles.card}>
                <h3 className={`${detailsStyles.cardTitle} mb-8`}>Dodatkowe wymagania</h3>
                <div className="flex flex-col gap-4">
                    {Object.entries(optionLabels).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-3">
                            <div
                                className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center shrink-0 ${
                                    options[key]
                                        ? "bg-[#0B298F] border-[#0B298F]"
                                        : "border-[#D9DADC] bg-white"
                                }`}
                            >
                                {options[key] && <DraftCheckIcon/>}
                            </div>
                            <span className="text-[#010101] text-[16px]">{label}</span>
                        </div>
                    ))}
                </div>
            </section>
        </RequestDetailsLayout>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({params}) => {
    const id = params?.id as string;
    const request = await getRequestById(id);

    if (!request) {
        return {notFound: true};
    }

    return {
        props: {
            request,
        },
    };
};
