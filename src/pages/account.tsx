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

type Tab = "account" | "notifications";

function VerificationBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
        Zweryfikowany
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
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

  return (
    <main className="py-8 px-4 max-w-[1250px] mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Moje konto</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("account")}
            className={`p-3 text-left text-sm rounded-lg transition-colors ${
              activeTab === "account"
                ? "bg-blue-600 text-white font-medium"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Dane konta
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`p-3 text-left text-sm rounded-lg transition-colors ${
              activeTab === "notifications"
                ? "bg-blue-600 text-white font-medium"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Powiadomienia
          </button>
          <button
            onClick={handleLogout}
            className="p-3 text-left text-sm rounded-lg bg-white text-red-600 hover:bg-red-50 transition-colors mt-4"
          >
            Wyloguj sie
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-lg p-6">
          {activeTab === "account" && (
            <div>
              <h2 className="text-lg font-medium mb-6">Informacje o koncie</h2>

              <div className="space-y-5">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Imie</span>
                  <span className="font-medium">
                    {user.firstName || <span className="text-gray-400 font-normal">Nie podano</span>}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Nazwisko</span>
                  <span className="font-medium">
                    {user.lastName || <span className="text-gray-400 font-normal">Nie podano</span>}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Email</span>
                  <div className="flex items-center gap-2">
                    <span>{user.email}</span>
                    <VerificationBadge verified={user.emailVerified} />
                  </div>
                </div>
                {!user.emailVerified && (
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Wyslij link weryfikacyjny
                  </button>
                )}

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Telefon</span>
                  {user.phone ? (
                    <div className="flex items-center gap-2">
                      <span>{user.phone}</span>
                      <VerificationBadge verified={user.phoneVerified} />
                    </div>
                  ) : (
                    <span className="text-gray-400">Nie podano</span>
                  )}
                </div>
                {user.phone && !user.phoneVerified && (
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Wyslij kod SMS
                  </button>
                )}
                {!user.phone && (
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Dodaj numer telefonu
                  </button>
                )}

                <div className="flex justify-between py-3">
                  <span className="text-gray-500">Metoda logowania</span>
                  <span className="capitalize">{user.provider}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="text-lg font-medium mb-6">Ustawienia powiadomien</h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <span className="text-sm">Powiadomienia email</span>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={() => handleNotificationChange("email")}
                    className="w-4 h-4 accent-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <span className="text-sm">Powiadomienia push</span>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={() => handleNotificationChange("push")}
                    className="w-4 h-4 accent-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <span className="text-sm">Powiadomienia SMS</span>
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={() => handleNotificationChange("sms")}
                    className="w-4 h-4 accent-blue-600"
                  />
                </label>

                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 text-sm font-medium mt-4 transition-colors">
                  Zapisz
                </button>
              </div>
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

  const sessionUser = session.user as {
    id?: string;
    email?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    provider?: string;
  };

  const userId = sessionUser.id;

  // Spróbuj pobrać użytkownika z bazy
  let user = userId ? await findUserById(userId) : null;

  // Jeśli nie znaleziono w bazie, użyj danych z sesji (dla OAuth)
  if (!user) {
    const nameParts = (sessionUser.name || "").split(" ");
    user = {
      id: userId || "",
      email: sessionUser.email || "",
      emailVerified: true, // OAuth weryfikuje email
      firstName: sessionUser.firstName || nameParts[0] || "",
      lastName: sessionUser.lastName || nameParts.slice(1).join(" ") || "",
      phone: sessionUser.phone || "",
      phoneVerified: false,
      provider: (sessionUser.provider as "email" | "google" | "facebook" | "apple") || "google",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;

  // Upewnij się, że wszystkie wartości są serializowalne (brak undefined)
  return {
    props: {
      user: {
        ...userWithoutPassword,
        phone: userWithoutPassword.phone || "",
        firstName: userWithoutPassword.firstName || "",
        lastName: userWithoutPassword.lastName || "",
      },
    },
  };
};
