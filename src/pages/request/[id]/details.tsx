import { GetServerSideProps } from "next";
import { getRequestById } from "@/services";
import type { RequestData } from "@/models";
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
  const stops: string[] = JSON.parse(request.stops || "[]");

  return (
    <main className="py-8 px-4 max-w-[1250px] mx-auto">
      <RequestSteps
        requestId={request.id}
        activeStep={1}
        hasAcceptedOffer={isRequestAccepted}
      />

      <h1 className="text-2xl font-semibold mb-6">Szczegoly zapytania</h1>

      <div className="bg-white rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Trasa</span>
            <span className="font-medium text-right">
              {request.from}
              {stops.length > 0 && (
                <> → {stops.join(" → ")}</>
              )}
              {" → "}{request.to}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Data i godzina</span>
            <span>{request.date} o {request.time}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Pasazerowie</span>
            <span>{request.adults} doroslych, {request.children} dzieci</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-500">Dodatkowe opcje</span>
            <span>{selectedOptions.length > 0 ? selectedOptions.join(", ") : "Brak"}</span>
          </div>
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
