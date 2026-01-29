import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { findUserById } from "@/services";
import type { User } from "@/models";

interface Props {
  user: Omit<User, "password">;
}

type Tab = "account" | "notifications" | "logout";

function VerificationBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        Zweryfikowany
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
      Niezweryfikowany
    </span>
  );
}

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

  const fullName = `${user.firstName} ${user.lastName}`.trim() || "Brak";

  return (
    <main className="p-4 max-w-[1250px] mx-auto">
      <h1 className="text-2xl mb-6">Moje konto</h1>

      <div className="flex gap-4">
        {/* Sidebar z zakladkami */}
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

        {/* Zawartosc zakladki */}
        <div className="flex-1 border border-gray-300 p-4">
          {activeTab === "account" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-medium">Informacje o koncie</h2>

              {/* Dane osobowe */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <span className="font-medium w-32">Imie:</span>
                  <span>{user.firstName || <span className="text-gray-400">Nie podano</span>}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium w-32">Nazwisko:</span>
                  <span>{user.lastName || <span className="text-gray-400">Nie podano</span>}</span>
                </div>
              </div>

              {/* Email */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex gap-2 items-center">
                  <span className="font-medium w-32">Email:</span>
                  <span>{user.email}</span>
                  <VerificationBadge verified={user.emailVerified} />
                </div>
                {!user.emailVerified && (
                  <button className="mt-2 text-sm text-blue-600 underline">
                    Wyslij link weryfikacyjny
                  </button>
                )}
              </div>

              {/* Telefon */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex gap-2 items-center">
                  <span className="font-medium w-32">Telefon:</span>
                  {user.phone ? (
                    <>
                      <span>{user.phone}</span>
                      <VerificationBadge verified={user.phoneVerified} />
                    </>
                  ) : (
                    <span className="text-gray-400">Nie podano</span>
                  )}
                </div>
                {user.phone && !user.phoneVerified && (
                  <button className="mt-2 text-sm text-blue-600 underline">
                    Wyslij kod SMS
                  </button>
                )}
                {!user.phone && (
                  <button className="mt-2 text-sm text-blue-600 underline">
                    Dodaj numer telefonu
                  </button>
                )}
              </div>

              {/* Provider */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex gap-2">
                  <span className="font-medium w-32">Metoda logowania:</span>
                  <span className="capitalize">{user.provider}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-medium">Ustawienia powiadomien</h2>
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

  const userId = (session.user as { id?: string }).id;

  if (!userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const user = await findUserById(userId);

  if (!user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // Usun haslo z danych przekazywanych do frontendu
  const { password, ...userWithoutPassword } = user;

  return {
    props: {
      user: userWithoutPassword,
    },
  };
};
