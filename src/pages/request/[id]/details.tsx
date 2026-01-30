import { GetServerSideProps } from "next";
import { getRequestById } from "@/services";
import type { RequestData, Route } from "@/models";
import RequestSteps from "@/components/RequestSteps";
import RouteMap from "@/components/RouteMap";

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

  const route: Route = JSON.parse(request.route || "{}");

  // Build route display string
  const routeParts: string[] = [];
  if (route.origin?.address) {
    routeParts.push(route.origin.address.split(",")[0]);
  }
  if (route.waypoints) {
    route.waypoints.forEach((wp) => {
      if (wp.address) routeParts.push(wp.address.split(",")[0]);
    });
  }
  if (route.destination?.address) {
    routeParts.push(route.destination.address.split(",")[0]);
  }
  const routeDisplay = routeParts.join(" → ");

  return (
    <main className="py-8 px-4 max-w-[1250px] mx-auto">
      <RequestSteps
        requestId={request.id}
        activeStep={1}
        hasAcceptedOffer={isRequestAccepted}
      />

      <h1 className="text-2xl font-semibold mb-6">Szczegoly zapytania</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dane zapytania */}
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Trasa</span>
              <span className="font-medium text-right max-w-[60%]">
                {routeDisplay || "Brak danych"}
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

        {/* Mapa z trasa */}
        <div className="bg-white rounded-lg p-6">
          {route.origin?.lat && route.destination?.lat ? (
            <RouteMap route={route} />
          ) : (
            <div className="w-full h-[350px] rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Brak danych trasy</span>
            </div>
          )}
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
