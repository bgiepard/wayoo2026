import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { getRequestsByUserEmail, getOffersCountByRequestIds } from "@/services";
import type { RequestData, RequestStatus, Route } from "@/models";

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

const getStatusStyle = (status: RequestStatus, offersCount: number = 0) => {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-600";
    case "published":
      return offersCount > 0 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
    case "accepted":
      return "bg-orange-100 text-orange-700";
    case "paid":
      return "bg-green-100 text-green-700";
    case "completed":
      return "bg-gray-100 text-gray-600";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function MyRequestsPage({ requests }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("active");

  const activeStatuses: RequestStatus[] = ["draft", "published", "accepted", "paid"];
  const completedStatuses: RequestStatus[] = ["completed", "cancelled"];

  const activeRequests = requests.filter((r) => activeStatuses.includes(r.status));
  const completedRequests = requests.filter((r) => completedStatuses.includes(r.status));

  const displayedRequests = activeTab === "active" ? activeRequests : completedRequests;

  return (
    <main className="py-8 px-4 max-w-[1250px] mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Moje zapytania</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Aktywne ({activeRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "completed"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Zakonczone ({completedRequests.length})
        </button>
      </div>

      {displayedRequests.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          {activeTab === "active"
            ? "Nie masz aktywnych zapytan."
            : "Nie masz zakonczonych zapytan."}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayedRequests.map((request) => {
            const route: Route = JSON.parse(request.route || "{}");
            const originName = route.origin?.address?.split(",")[0] || "";
            const destName = route.destination?.address?.split(",")[0] || "";
            const routeDisplay = originName && destName ? `${originName} → ${destName}` : "Brak trasy";

            return (
              <Link
                key={request.id}
                href={`/request/${request.id}`}
                className="bg-white rounded-lg p-5 flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-900">
                    {routeDisplay}
                  </span>
                  <span className="text-sm text-gray-500">
                    {request.date} o {request.time}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {request.adults + request.children} os.
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusStyle(request.status, request.offersCount)}`}>
                    {getStatusText(request.status, request.offersCount)}
                  </span>
                </div>
              </Link>
            );
          })}
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
