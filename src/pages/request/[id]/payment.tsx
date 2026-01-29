import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { getRequestById, getOffersByRequest, RequestData, OfferData } from "@/lib/airtable";
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
      <main className="p-4 max-w-[1250px] mx-auto">
        <RequestSteps
          requestId={request.id}
          activeStep={3}
          hasAcceptedOffer={isRequestAccepted}
        />
        <h1 className="text-2xl mb-6">Platnosc</h1>
        <p className="text-gray-500">Brak danych o ofercie.</p>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-[1250px] mx-auto">
      <RequestSteps
        requestId={request.id}
        activeStep={3}
        hasAcceptedOffer={isRequestAccepted}
      />

      <h1 className="text-2xl mb-6">Platnosc</h1>

      <div className="border border-gray-300 p-6">
        <div className="mb-6">
          <div className="flex justify-between border-b border-gray-200 py-2">
            <span>Trasa:</span>
            <span>{request.from} → {request.to}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-2">
            <span>Data:</span>
            <span>{request.date} {request.time}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-2">
            <span>Kierowca:</span>
            <span>{acceptedOffer.driverName || "Nieznany"}</span>
          </div>
          {acceptedOffer.driverPhone && (
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span>Telefon:</span>
              <span>{acceptedOffer.driverPhone}</span>
            </div>
          )}
          <div className="flex justify-between py-2 font-bold text-lg">
            <span>Do zaplaty:</span>
            <span>{acceptedOffer.price} PLN</span>
          </div>
        </div>

        {request.status === "paid" ? (
          <div className="bg-green-50 border border-green-200 p-6 text-center">
            <p className="text-green-800 font-medium">Platnosc zakonczona</p>
            <p className="text-green-600 text-sm mt-2">Dziekujemy za oplacenie przejazdu</p>
          </div>
        ) : request.status === "completed" ? (
          <div className="bg-gray-50 border border-gray-200 p-6 text-center">
            <p className="text-gray-800 font-medium">Przejazd zakonczony</p>
            <p className="text-gray-600 text-sm mt-2">Dziekujemy za skorzystanie z naszych uslug</p>
          </div>
        ) : (
          <button
            onClick={handleMarkAsPaid}
            disabled={isPaying}
            className="w-full border border-green-600 bg-green-600 text-white p-4 disabled:opacity-50"
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
  const acceptedOffer = offers.find((o) => o.status === 2) || null;

  return {
    props: {
      request,
      acceptedOffer,
    },
  };
};
