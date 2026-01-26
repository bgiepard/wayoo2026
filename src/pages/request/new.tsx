import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { SearchData } from "@/components/SearchForm";
import LoginModal from "@/components/LoginModal";

const optionLabels: Record<string, string> = {
  wifi: "WiFi",
  wc: "WC",
  tv: "Telewizor",
  airConditioning: "Klimatyzacja",
  powerOutlet: "Gniazdko elektryczne",
};

export default function NewRequestPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requestData, setRequestData] = useState<SearchData | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pending_request");
    if (stored) {
      setRequestData(JSON.parse(stored));
    }
  }, []);

  const publishRequest = async () => {
    if (!requestData || isPublishing) return;

    setIsPublishing(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem("pending_request");
        router.push(`/request/${data.id}`);
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
        <p>Ładowanie...</p>
      </main>
    );
  }

  const selectedOptions = Object.entries(requestData.options)
    .filter(([, value]) => value)
    .map(([key]) => optionLabels[key]);

  return (
    <main className="p-4 max-w-[1250px] mx-auto">
      <h1 className="text-2xl mb-6">Nowe zapytanie</h1>

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
          <span className="font-medium">Pasażerowie:</span>
          <span>{requestData.adults} dorosłych, {requestData.children} dzieci</span>
        </div>

        <div className="flex gap-2">
          <span className="font-medium">Dodatkowe opcje:</span>
          <span>{selectedOptions.length > 0 ? selectedOptions.join(", ") : "Brak"}</span>
        </div>
      </div>

      <div className="mt-6">
        {status === "loading" ? (
          <p>Ładowanie...</p>
        ) : session ? (
          <button
            onClick={publishRequest}
            disabled={isPublishing}
            className="border border-gray-300 p-3 w-full"
          >
            {isPublishing ? "Publikowanie..." : "Opublikuj"}
          </button>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="border border-gray-300 p-3 w-full"
          >
            Zaloguj się aby opublikować
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
