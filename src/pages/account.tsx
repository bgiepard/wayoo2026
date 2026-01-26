import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";

interface Props {
  user: {
    name: string;
    email: string;
  };
}

type Tab = "account" | "notifications" | "logout";

export default function AccountPage({ user }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [notifications, setNotifications] = useState({
    email: false,
    push: false,
    sms: false,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <main className="p-4 max-w-[1250px] mx-auto">
      <h1 className="text-2xl mb-6">Moje konto</h1>

      <div className="flex gap-4">
        {/* Sidebar z zakładkami */}
        <div className="w-48 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("account")}
            className={`p-2 text-left border ${activeTab === "account" ? "border-gray-500 bg-gray-100" : "border-gray-300"}`}
          >
            Moje konto
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`p-2 text-left border ${activeTab === "notifications" ? "border-gray-500 bg-gray-100" : "border-gray-300"}`}
          >
            Powiadomienia
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-left border border-gray-300"
          >
            Wyloguj
          </button>
        </div>

        {/* Zawartość zakładki */}
        <div className="flex-1 border border-gray-300 p-4">
          {activeTab === "account" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-medium">Informacje o koncie</h2>
              <div className="flex gap-2">
                <span className="font-medium">Imię:</span>
                <span>{user.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-medium">Ustawienia powiadomień</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationChange("email")}
                  className="w-4 h-4"
                />
                <span>Powiadomienia email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() => handleNotificationChange("push")}
                  className="w-4 h-4"
                />
                <span>Powiadomienia push</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={() => handleNotificationChange("sms")}
                  className="w-4 h-4"
                />
                <span>Powiadomienia SMS</span>
              </label>
              <button className="border border-gray-300 p-2 w-fit mt-2">
                Zapisz
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        name: session.user.name || "",
        email: session.user.email || "",
      },
    },
  };
};
