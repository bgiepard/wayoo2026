import { GetServerSideProps } from "next";
import { getRequestById, RequestData } from "@/lib/airtable";

const optionLabels: Record<string, string> = {
  wifi: "WiFi",
  wc: "WC",
  tv: "Telewizor",
  airConditioning: "Klimatyzacja",
  powerOutlet: "Gniazdko elektryczne",
};

interface Props {
  request: RequestData | null;
}

export default function RequestPage({ request }: Props) {
  if (!request) {
    return (
      <main className="p-4 max-w-[1250px] mx-auto">
        <p>Nie znaleziono zapytania</p>
      </main>
    );
  }

  const options = JSON.parse(request.options || "{}");
  const selectedOptions = Object.entries(options)
    .filter(([, value]) => value)
    .map(([key]) => optionLabels[key] || key);

  return (
    <main className="p-4 max-w-[1250px] mx-auto">
      <h1 className="text-2xl mb-6">Szczegóły zapytania</h1>
      <p className="text-sm text-gray-500 mb-4">ID: {request.id}</p>

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
          <span className="font-medium">Pasażerowie:</span>
          <span>{request.adults} dorosłych, {request.children} dzieci</span>
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

  return {
    props: {
      request,
    },
  };
};
