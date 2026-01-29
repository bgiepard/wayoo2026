import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { getRequestsByUserEmail, getOffersCountByRequestIds, RequestData, RequestStatus } from "@/lib/airtable";

interface RequestWithOffers extends RequestData {
  offersCount: number;
}

interface Props {
  requests: RequestWithOffers[];
}

type Tab = "active" | "completed";

const getStatusText = (status: RequestStatus, offersCount: number = 0) => {
  switch (status) {
    case "draft":
      return "Wersja robocza";
    case "published":
      if (offersCount > 0) {
        return `${offersCount} ${offersCount === 1 ? "oferta" : offersCount < 5 ? "oferty" : "ofert"}`;
      }
      return "Oczekuje na oferty";
    case "accepted":
      return "Oczekuje na platnosc";
    case "paid":
      return "Oplacone";
    case "completed":
      return "Zakonczone";
    case "cancelled":
      return "Anulowane";
    default:
      return "Nieznany";
  }
};

const getStatusColor = (status: RequestStatus, offersCount: number = 0) => {
  switch (status) {
    case "draft":
      return "text-gray-500";
    case "published":
      return offersCount > 0 ? "text-green-600" : "text-yellow-600";
    case "accepted":
      return "text-orange-600";
    case "paid":
      return "text-green-600";
    case "completed":
      return "text-gray-600";
    case "cancelled":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export default function MyRequestsPage({ requests }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("active");

  // Aktywne: draft, published, accepted, paid
  // Zakonczone: completed, cancelled
  const activeStatuses: RequestStatus[] = ["draft", "published", "accepted", "paid"];
  const completedStatuses: RequestStatus[] = ["completed", "cancelled"];

  const activeRequests = requests.filter((r) => activeStatuses.includes(r.status));
  const completedRequests = requests.filter((r) => completedStatuses.includes(r.status));

  const displayedRequests = activeTab === "active" ? activeRequests : completedRequests;

  return (
    <main className="p-4 max-w-[1250px] mx-auto">
      <h1 className="text-2xl mb-6">Moje zapytania</h1>

      {/* Taby */}
      <div className="flex gap-0 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 border ${
            activeTab === "active"
              ? "border-gray-800 bg-gray-800 text-white"
              : "border-gray-300"
          }`}
        >
          Aktywne ({activeRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 border border-l-0 ${
            activeTab === "completed"
              ? "border-gray-800 bg-gray-800 text-white"
              : "border-gray-300"
          }`}
        >
          Zakonczone ({completedRequests.length})
        </button>
      </div>

      {/* Lista zapytan */}
      {displayedRequests.length === 0 ? (
        <p className="text-gray-500">
          {activeTab === "active"
            ? "Nie masz aktywnych zapytan."
            : "Nie masz zakonczonych zapytan."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {displayedRequests.map((request) => (
            <Link
              key={request.id}
              href={`/request/${request.id}`}
              className="border border-gray-300 p-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">
                  {request.from} → {request.to}
                </span>
                <span className="text-sm text-gray-500">
                  {request.date} {request.time}
                </span>
                <span className={`text-sm font-medium ${getStatusColor(request.status, request.offersCount)}`}>
                  {getStatusText(request.status, request.offersCount)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {request.adults + request.children} os.
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const requests = await getRequestsByUserEmail(session.user.email);
  const requestIds = requests.map((r) => r.id);
  const offersCounts = await getOffersCountByRequestIds(requestIds);

  const requestsWithOffers: RequestWithOffers[] = requests.map((r) => ({
    ...r,
    offersCount: offersCounts[r.id] || 0,
  }));

  return {
    props: {
      requests: requestsWithOffers,
    },
  };
};
