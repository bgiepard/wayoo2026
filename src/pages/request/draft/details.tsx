import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/LoginModal";
import { SearchData } from "@/components/SearchForm";

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
      <main className="p-4 max-w-[1250px] mx-auto">
        <p>Ladowanie...</p>
      </main>
    );
  }

  const selectedOptions = Object.entries(requestData.options)
    .filter(([, value]) => value)
    .map(([key]) => optionLabels[key] || key);

  return (
    <main className="p-4 max-w-[1250px] mx-auto">
      {/* Stepy - draft nie ma prawdziwego ID wiec pokazujemy uproszczona wersje */}
      <div className="flex justify-between mb-8 border border-gray-300 p-4">
        <div className="flex items-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-gray-800 text-white border-gray-800 ring-2 ring-offset-2 ring-gray-800">
              1
            </div>
            <span className="text-sm mt-2 font-medium">Szczegoly</span>
          </div>
          <div className="w-24 h-0.5 mx-4 bg-gray-300" />
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300">
              2
            </div>
            <span className="text-sm mt-2 text-gray-400">Oferty</span>
          </div>
          <div className="w-24 h-0.5 mx-4 bg-gray-300" />
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300">
              3
            </div>
            <span className="text-sm mt-2 text-gray-400">Platnosc</span>
          </div>
        </div>
      </div>

      <h1 className="text-2xl mb-6">Szczegoly zapytania</h1>

      <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6">
        <p className="text-yellow-800 font-medium">Wersja robocza</p>
        <p className="text-yellow-600 text-sm">
          To zapytanie nie zostalo jeszcze opublikowane. Kierowcy nie moga go zobaczyc.
        </p>
      </div>

      <div className="border border-gray-300 p-4 flex flex-col gap-4">
        <div className="flex gap-2">
          <span className="font-medium">Trasa:</span>
          <span>{requestData.from} → {requestData.to}</span>
        </div>

        <div className="flex gap-2">
          <span className="font-medium">Data i godzina:</span>
          <span>{requestData.date} {requestData.time}</span>
        </div>

        <div className="flex gap-2">
          <span className="font-medium">Pasazerowie:</span>
          <span>{requestData.adults} doroslych, {requestData.children} dzieci</span>
        </div>

        <div className="flex gap-2">
          <span className="font-medium">Dodatkowe opcje:</span>
          <span>{selectedOptions.length > 0 ? selectedOptions.join(", ") : "Brak"}</span>
        </div>
      </div>

      <div className="mt-6">
        {status === "loading" ? (
          <button disabled className="border border-gray-300 p-3 w-full opacity-50">
            Ladowanie...
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="border border-green-600 bg-green-600 text-white p-3 w-full disabled:opacity-50"
          >
            {isPublishing ? "Publikowanie..." : session ? "Opublikuj zapytanie" : "Zaloguj sie i opublikuj"}
          </button>
        )}
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </main>
  );
}
