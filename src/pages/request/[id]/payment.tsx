import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { getRequestById, getOffersByRequest } from "@/services";
import type { RequestData, OfferData } from "@/models";
import RequestSteps from "@/components/RequestSteps";

interface Props {
  request: RequestData;
  acceptedOffer: OfferData | null;
}

export default function RequestPaymentPage({ request: initialRequest, acceptedOffer }: Props) {
  const router = useRouter();
  const [request, setRequest] = useState(initialRequest);
  const [isPaying, setIsPaying] = useState(false);

  const isRequestAccepted = ["accepted", "paid", "completed"].includes(request.status);

  const handleMarkAsPaid = async () => {
    setIsPaying(true);
    try {
      const res = await fetch(`/api/requests/${request.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });

      if (res.ok) {
        setRequest({ ...request, status: "paid" });
      }
    } catch (error) {
      console.error("Error marking as paid:", error);
    } finally {
      setIsPaying(false);
    }
  };

  if (!acceptedOffer) {
    return (
      <main className="py-8 px-4 max-w-[1250px] mx-auto">
        <RequestSteps
          requestId={request.id}
          activeStep={3}
          hasAcceptedOffer={isRequestAccepted}
        />
        <h1 className="text-2xl font-semibold mb-6">Platnosc</h1>
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          Brak danych o ofercie.
        </div>
      </main>
    );
  }

  return (
    <main className="py-8 px-4 max-w-[1250px] mx-auto">
      <RequestSteps
        requestId={request.id}
        activeStep={3}
        hasAcceptedOffer={isRequestAccepted}
      />

      <h1 className="text-2xl font-semibold mb-6">Platnosc</h1>

      <div className="bg-white rounded-lg p-6">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Trasa</span>
            <span className="font-medium">{request.from} → {request.to}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Data</span>
            <span>{request.date} o {request.time}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Kierowca</span>
            <span>{acceptedOffer.driverName || "Nieznany"}</span>
          </div>
          {acceptedOffer.driverPhone && (
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Telefon</span>
              <span>{acceptedOffer.driverPhone}</span>
            </div>
          )}
          <div className="flex justify-between py-4">
            <span className="text-lg font-medium">Do zaplaty</span>
            <span className="text-2xl font-semibold">{acceptedOffer.price} PLN</span>
          </div>
        </div>

        {request.status === "paid" ? (
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <p className="text-green-800 font-medium">Platnosc zakonczona</p>
            <p className="text-green-600 text-sm mt-1">Dziekujemy za oplacenie przejazdu</p>
          </div>
        ) : request.status === "completed" ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-800 font-medium">Przejazd zakonczony</p>
            <p className="text-gray-600 text-sm mt-1">Dziekujemy za skorzystanie z naszych uslug</p>
          </div>
        ) : (
          <button
            onClick={handleMarkAsPaid}
            disabled={isPaying}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 font-medium disabled:opacity-50 transition-colors"
          >
            {isPaying ? "Przetwarzanie..." : `Zaplac ${acceptedOffer.price} PLN`}
          </button>
        )}
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

  const isRequestAccepted = ["accepted", "paid", "completed"].includes(request.status);

  if (!isRequestAccepted) {
    return {
      redirect: {
        destination: `/request/${id}/offers`,
        permanent: false,
      },
    };
  }

  const offers = await getOffersByRequest(id);
  const foundOffer = offers.find((o) => o.status === "accepted" || o.status === "paid");

  // Upewnij się, że wszystkie wartości są serializowalne (brak undefined)
  const acceptedOffer = foundOffer ? {
    ...foundOffer,
    message: foundOffer.message || "",
    driverName: foundOffer.driverName || "",
    driverEmail: foundOffer.driverEmail || "",
    driverPhone: foundOffer.driverPhone || "",
  } : null;

  return {
    props: {
      request,
      acceptedOffer,
    },
  };
};
