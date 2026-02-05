import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/LoginModal";
import RouteMap from "@/components/RouteMap";
import RequestSteps from "@/components/RequestSteps";
import type { SearchData } from "@/models";

const optionLabels: Record<string, string> = {
  wifi: "WiFi",
  wc: "WC",
  tv: "Telewizor",
  airConditioning: "Klimatyzacja",
  powerOutlet: "Gniazdko elektryczne",
};

export default function DraftDetailsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requestData, setRequestData] = useState<SearchData | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("draft_request");
    if (stored) {
      setRequestData(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, [router]);

  const handlePublish = async () => {
    if (!session) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!requestData) return;

    setIsPublishing(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
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
        <p className="text-gray-500">Ladowanie...</p>
      </main>
    );
  }

  const selectedOptions = Object.entries(requestData.options)
    .filter(([, value]) => value)
    .map(([key]) => optionLabels[key] || key);

  const { route } = requestData;

  // Build route display string
  const routeParts = [route.origin.address.split(",")[0]];
  route.waypoints.forEach((wp) => {
    if (wp.address) routeParts.push(wp.address.split(",")[0]);
  });
  routeParts.push(route.destination.address.split(",")[0]);
  const routeDisplay = routeParts.join(" → ");

  return (
    <main className="py-8 px-4 max-w-[1250px] mx-auto">
      <RequestSteps activeStep={1} />

      <h1 className="text-2xl font-semibold mb-6">Szczegoly zapytania</h1>

      <div className="bg-yellow-50 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 font-medium">Wersja robocza</p>
        <p className="text-yellow-700 text-sm mt-1">
          To zapytanie nie zostalo jeszcze opublikowane. Kierowcy nie moga go zobaczyc.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Dane zapytania */}
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Trasa</span>
              <span className="font-medium text-right max-w-[60%]">
                {routeDisplay}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Data i godzina</span>
              <span>{requestData.date} o {requestData.time}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Pasazerowie</span>
              <span>{requestData.adults} doroslych, {requestData.children} dzieci</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-500">Dodatkowe opcje</span>
              <span>{selectedOptions.length > 0 ? selectedOptions.join(", ") : "Brak"}</span>
            </div>
          </div>
        </div>

        {/* Mapa z trasa */}
        <div className="bg-white rounded-lg p-6">
          <RouteMap route={route} />
        </div>
      </div>

      {status === "loading" ? (
        <button disabled className="w-full bg-gray-200 text-gray-500 rounded-lg p-4 font-medium">
          Ladowanie...
        </button>
      ) : (
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 font-medium disabled:opacity-50 transition-colors"
        >
          {isPublishing ? "Publikowanie..." : session ? "Opublikuj zapytanie" : "Zaloguj sie i opublikuj"}
        </button>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </main>
  );
}
