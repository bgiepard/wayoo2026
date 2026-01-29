import { GetServerSideProps } from "next";
import { getRequestById, RequestData } from "@/lib/airtable";
import RequestSteps from "@/components/RequestSteps";

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

export default function RequestDetailsPage({ request }: Props) {
  const isRequestAccepted = ["accepted", "paid", "completed"].includes(request.status);

  const options = JSON.parse(request.options || "{}");
  const selectedOptions = Object.entries(options)
    .filter(([, value]) => value)
    .map(([key]) => optionLabels[key] || key);

  return (
    <main className="p-4 max-w-[1250px] mx-auto">
      <RequestSteps
        requestId={request.id}
        activeStep={1}
        hasAcceptedOffer={isRequestAccepted}
      />

      <h1 className="text-2xl mb-6">Szczegoly zapytania</h1>

      <div className="border border-gray-300 p-4 flex flex-col gap-4">
        <div className="flex gap-2">
          <span className="font-medium">Trasa:</span>
          <span>{request.from} → {request.to}</span>
        </div>

        <div className="flex gap-2">
          <span className="font-medium">Data i godzina:</span>
          <span>{request.date} {request.time}</span>
        </div>

        <div className="flex gap-2">
          <span className="font-medium">Pasazerowie:</span>
          <span>{request.adults} doroslych, {request.children} dzieci</span>
        </div>

        <div className="flex gap-2">
          <span className="font-medium">Dodatkowe opcje:</span>
          <span>{selectedOptions.length > 0 ? selectedOptions.join(", ") : "Brak"}</span>
        </div>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const id = params?.id as string;

  const request = await getRequestById(id);

  if (!request) {
    return { notFound: true };
  }

  return {
    props: {
      request,
    },
  };
};
