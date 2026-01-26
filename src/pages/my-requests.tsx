import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { getRequestsByUserEmail, RequestData } from "@/lib/airtable";

interface Props {
  requests: RequestData[];
}

type Tab = "active" | "completed";

export default function MyRequestsPage({ requests }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("active");

  const activeRequests = requests.filter((r) => r.status < 3);
  const completedRequests = requests.filter((r) => r.status >= 3);

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
          Zakończone ({completedRequests.length})
        </button>
      </div>

      {/* Lista zapytań */}
      {displayedRequests.length === 0 ? (
        <p className="text-gray-500">
          {activeTab === "active"
            ? "Nie masz aktywnych zapytań."
            : "Nie masz zakończonych zapytań."}
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

  return {
    props: {
      requests,
    },
  };
};
