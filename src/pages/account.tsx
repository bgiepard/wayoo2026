import {GetServerSideProps} from "next";
import {getServerSession} from "next-auth";
import {signOut} from "next-auth/react";
import {useState} from "react";
import {authOptions} from "./api/auth/[...nextauth]";
import {findUserById} from "@/services";
import type {User} from "@/models";

interface Props {
    user: Omit<User, "password">;
}

type Tab = "account" | "notifications";

const providerLabels: Record<string, string> = {
    email: "Email i haslo",
    google: "Google",
    facebook: "Facebook",
    apple: "Apple",
};

export default function AccountPage({user}: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("account");
    const [notifications, setNotifications] = useState({
        email: false,
        push: false,
        sms: false,
    });

    const handleNotificationChange = (key: keyof typeof notifications) => {
        setNotifications({...notifications, [key]: !notifications[key]});
    };

    const handleLogout = () => {
        signOut({callbackUrl: "/"});
    };

    const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";

    return (
        <main className="pb-12 px-4 max-w-[1250px] mx-auto">
            {/* Naglowek */}
            <div className="pt-12 mb-10">
                <h1 className="text-center text-[#0B298F] text-[26px] font-[400] mb-3">
                    Moje konto
                </h1>
                <h2 className="text-center text-[#5B5E68] text-[16px] font-[400]">
                    Zarzadzaj swoimi danymi i ustawieniami konta.
                </h2>
            </div>

            <div className="flex gap-8">
                {/* Sidebar */}
                <div className="w-[220px] shrink-0 flex flex-col gap-1">
                    <button
                        onClick={() => setActiveTab("account")}
                        className={`px-4 py-3 text-left text-[14px] font-[500] rounded-[8px] transition-colors ${
                            activeTab === "account"
                                ? "bg-[#EEF2FF] text-[#0B298F]"
                                : "text-[#5B5E68] hover:bg-[#F8F9FA]"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 10C12.0711 10 13.75 8.32107 13.75 6.25C13.75 4.17893 12.0711 2.5 10 2.5C7.92893 2.5 6.25 4.17893 6.25 6.25C6.25 8.32107 7.92893 10 10 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3.75 17.5C3.75 14.0482 6.54822 11.25 10 11.25C13.4518 11.25 16.25 14.0482 16.25 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Dane konta
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`px-4 py-3 text-left text-[14px] font-[500] rounded-[8px] transition-colors ${
                            activeTab === "notifications"
                                ? "bg-[#EEF2FF] text-[#0B298F]"
                                : "text-[#5B5E68] hover:bg-[#F8F9FA]"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.79508 17.5C8.23454 17.8044 8.79508 18 9.39508 18C9.99508 18 10.5551 17.8044 10.9951 17.5M14.3951 7C14.3951 5.4087 13.7629 3.88258 12.6377 2.75736C11.5124 1.63214 9.98633 1 8.39508 1C6.80383 1 5.2777 1.63214 4.15248 2.75736C3.02726 3.88258 2.39508 5.4087 2.39508 7C2.39508 10.0902 1.62036 12.206 0.764783 13.6054C0.0455792 14.7859 -0.314017 15.3761 -0.301658 15.5408C-0.287895 15.7231 -0.253825 15.7926 -0.107206 15.9016C0.025083 16 0.625671 16 1.82685 16H14.9633C16.1645 16 16.7651 16 16.8973 15.9016C17.0439 15.7926 17.0781 15.7231 17.0918 15.5408C17.1041 15.3761 16.7445 14.7859 16.0253 13.6054C15.1698 12.206 14.3951 10.0902 14.3951 7Z" transform="translate(1,1)" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Powiadomienia
                        </div>
                    </button>

                    <div className="border-t border-[#D9DADC] my-3"/>

                    <button
                        onClick={handleLogout}
                        className="px-4 py-3 text-left text-[14px] font-[500] rounded-[8px] text-[#D32F2F] hover:bg-[#FDEAEA] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Wyloguj sie
                        </div>
                    </button>
                </div>

                {/* Zawartosc */}
                <div className="flex-1">
                    {activeTab === "account" && (
                        <div className="flex flex-col gap-6">
                            {/* Avatar + imie */}
                            <div className="bg-white rounded-[8px] border border-[#D9DADC] p-8">
                                <div className="flex items-center gap-5 mb-8 pb-8 border-b border-[#D9DADC]">
                                    <div className="w-[64px] h-[64px] rounded-full bg-[#0B298F] flex items-center justify-center shrink-0">
                                        <span className="text-white text-[22px] font-[600]">{initials}</span>
                                    </div>
                                    <div>
                                        <p className="text-[#010101] text-[20px] font-[600]">
                                            {user.firstName && user.lastName
                                                ? `${user.firstName} ${user.lastName}`
                                                : "Uzytkownik"}
                                        </p>
                                        <p className="text-[#5B5E68] text-[14px] mt-0.5">{user.email}</p>
                                    </div>
                                </div>

                                <h3 className="text-[#0B298F] text-[20px] font-[400] mb-6">Informacje osobiste</h3>

                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    {/* Imie */}
                                    <div>
                                        <span className="text-[#5B5E68] text-[14px] block mb-1">Imie</span>
                                        <span className="text-[#010101] text-[16px] font-[600]">
                                            {user.firstName || <span className="text-[#9B9DA3] font-[400]">Nie podano</span>}
                                        </span>
                                    </div>

                                    {/* Nazwisko */}
                                    <div>
                                        <span className="text-[#5B5E68] text-[14px] block mb-1">Nazwisko</span>
                                        <span className="text-[#010101] text-[16px] font-[600]">
                                            {user.lastName || <span className="text-[#9B9DA3] font-[400]">Nie podano</span>}
                                        </span>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <span className="text-[#5B5E68] text-[14px] block mb-1">Adres email</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#010101] text-[16px] font-[600]">{user.email}</span>
                                            {user.emailVerified ? (
                                                <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[#E6F6EC] text-[#01A83D] font-[500] border border-[#A3DFB8]">
                                                    Zweryfikowany
                                                </span>
                                            ) : (
                                                <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[#FFF8E1] text-[#B8860B] font-[500] border border-[#E6D08A]">
                                                    Niezweryfikowany
                                                </span>
                                            )}
                                        </div>
                                        {!user.emailVerified && (
                                            <button className="text-[#0B298F] text-[13px] font-[500] mt-2 hover:opacity-80 transition-opacity">
                                                Wyslij link weryfikacyjny
                                            </button>
                                        )}
                                    </div>

                                    {/* Telefon */}
                                    <div>
                                        <span className="text-[#5B5E68] text-[14px] block mb-1">Numer telefonu</span>
                                        {user.phone ? (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[#010101] text-[16px] font-[600]">{user.phone}</span>
                                                    {user.phoneVerified ? (
                                                        <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[#E6F6EC] text-[#01A83D] font-[500] border border-[#A3DFB8]">
                                                            Zweryfikowany
                                                        </span>
                                                    ) : (
                                                        <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[#FFF8E1] text-[#B8860B] font-[500] border border-[#E6D08A]">
                                                            Niezweryfikowany
                                                        </span>
                                                    )}
                                                </div>
                                                {!user.phoneVerified && (
                                                    <button className="text-[#0B298F] text-[13px] font-[500] mt-2 hover:opacity-80 transition-opacity">
                                                        Wyslij kod SMS
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[#9B9DA3] text-[16px]">Nie podano</span>
                                                <button className="block text-[#0B298F] text-[13px] font-[500] mt-2 hover:opacity-80 transition-opacity">
                                                    Dodaj numer telefonu
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Metoda logowania */}
                                    <div>
                                        <span className="text-[#5B5E68] text-[14px] block mb-1">Metoda logowania</span>
                                        <div className="flex items-center gap-2">
                                            {user.provider === "google" && (
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 4.962-3.32 8.49-8.327 8.49a8.684 8.684 0 0 1-6.154-2.55A8.66 8.66 0 0 1-1.347 8a8.684 8.684 0 0 1 2.55-6.154A8.66 8.66 0 0 1 7.357-.704c2.34 0 4.303.86 5.812 2.266L10.9 3.83C10.039 3.007 8.862 2.58 7.357 2.58c-2.998 0-5.42 2.546-5.42 5.42 0 2.873 2.422 5.42 5.42 5.42 2.777 0 4.603-1.583 4.987-3.756H7.357V7.023h7.73c.26 0 .458.3.458.536z" transform="translate(0.5 0.5)" fill="#4285F4"/>
                                                </svg>
                                            )}
                                            <span className="text-[#010101] text-[16px] font-[600]">
                                                {providerLabels[user.provider] || user.provider}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="bg-white rounded-[8px] border border-[#D9DADC] p-8">
                            <h3 className="text-[#0B298F] text-[20px] font-[400] mb-2">Ustawienia powiadomien</h3>
                            <p className="text-[#5B5E68] text-[14px] mb-8">Wybierz, w jaki sposob chcesz otrzymywac powiadomienia o swoich zleceniach.</p>

                            <div className="flex flex-col gap-3">
                                {/* Email */}
                                <label className="flex items-center justify-between p-4 rounded-[8px] border border-[#D9DADC] hover:border-[#0B298F] transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-[40px] h-[40px] rounded-[8px] bg-[#EEF2FF] flex items-center justify-center shrink-0">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M2.5 5.83333L8.83248 10.5962C9.21524 10.8784 9.40662 11.0196 9.61622 11.0722C9.80167 11.1188 9.99505 11.1188 10.1805 11.0722C10.3901 11.0196 10.5815 10.8784 10.9643 10.5962L17.5 5.83333M5.66667 16.6667H14.3333C15.7335 16.6667 16.4335 16.6667 16.9683 16.394C17.4387 16.1545 17.8212 15.772 18.0608 15.3016C18.3333 14.7668 18.3333 14.0668 18.3333 12.6667V7.33333C18.3333 5.93319 18.3333 5.23314 18.0608 4.69836C17.8212 4.22795 17.4387 3.84549 16.9683 3.60582C16.4335 3.33333 15.7335 3.33333 14.3333 3.33333H5.66667C4.26653 3.33333 3.56647 3.33333 3.03169 3.60582C2.56129 3.84549 2.17883 4.22795 1.93916 4.69836C1.66667 5.23314 1.66667 5.93319 1.66667 7.33333V12.6667C1.66667 14.0668 1.66667 14.7668 1.93916 15.3016C2.17883 15.772 2.56129 16.1545 3.03169 16.394C3.56647 16.6667 4.26653 16.6667 5.66667 16.6667Z" stroke="#0B298F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="text-[#010101] text-[16px] font-[500] block">Powiadomienia email</span>
                                            <span className="text-[#5B5E68] text-[13px]">Otrzymuj aktualizacje na swoj adres email</span>
                                        </div>
                                    </div>
                                    <div className={`w-[44px] h-[24px] rounded-full transition-colors relative ${notifications.email ? "bg-[#0B298F]" : "bg-[#D9DADC]"}`}>
                                        <div className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow transition-transform ${notifications.email ? "left-[22px]" : "left-[2px]"}`}/>
                                        <input
                                            type="checkbox"
                                            checked={notifications.email}
                                            onChange={() => handleNotificationChange("email")}
                                            className="sr-only"
                                        />
                                    </div>
                                </label>

                                {/* Push */}
                                <label className="flex items-center justify-between p-4 rounded-[8px] border border-[#D9DADC] hover:border-[#0B298F] transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-[40px] h-[40px] rounded-[8px] bg-[#EEF2FF] flex items-center justify-center shrink-0">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M7.5 15C7.5 15.663 7.76339 16.2989 8.23223 16.7678C8.70107 17.2366 9.33696 17.5 10 17.5C10.663 17.5 11.2989 17.2366 11.7678 16.7678C12.2366 16.2989 12.5 15.663 12.5 15M10 2.5V4.16667M16.6667 8.33333C16.6667 6.56522 15.9643 4.86953 14.714 3.61929C13.4638 2.36905 11.7681 1.66667 10 1.66667C8.2319 1.66667 6.53621 2.36905 5.28596 3.61929C4.03572 4.86953 3.33334 6.56522 3.33334 8.33333C3.33334 11.1025 2.63376 13.0171 1.90398 14.2807C1.28899 15.3461 0.981499 15.8788 0.993857 16.0335C1.00753 16.2057 1.04036 16.2713 1.18092 16.3739C1.30584 16.4652 1.84536 16.4652 2.92441 16.4652H17.0756C18.1547 16.4652 18.6942 16.4652 18.8191 16.3739C18.9597 16.2713 18.9925 16.2057 19.0062 16.0335C19.0185 15.8788 18.711 15.3461 18.096 14.2807C17.3663 13.0171 16.6667 11.1025 16.6667 8.33333Z" stroke="#0B298F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="text-[#010101] text-[16px] font-[500] block">Powiadomienia push</span>
                                            <span className="text-[#5B5E68] text-[13px]">Powiadomienia w przegladarce w czasie rzeczywistym</span>
                                        </div>
                                    </div>
                                    <div className={`w-[44px] h-[24px] rounded-full transition-colors relative ${notifications.push ? "bg-[#0B298F]" : "bg-[#D9DADC]"}`}>
                                        <div className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow transition-transform ${notifications.push ? "left-[22px]" : "left-[2px]"}`}/>
                                        <input
                                            type="checkbox"
                                            checked={notifications.push}
                                            onChange={() => handleNotificationChange("push")}
                                            className="sr-only"
                                        />
                                    </div>
                                </label>

                                {/* SMS */}
                                <label className="flex items-center justify-between p-4 rounded-[8px] border border-[#D9DADC] hover:border-[#0B298F] transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-[40px] h-[40px] rounded-[8px] bg-[#EEF2FF] flex items-center justify-center shrink-0">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M6.66667 7.5H6.675M10 7.5H10.0083M13.3333 7.5H13.3417M5.83333 13.3333H3.33333C2.41286 13.3333 1.66667 12.5871 1.66667 11.6667V4.16667C1.66667 3.24619 2.41286 2.5 3.33333 2.5H16.6667C17.5871 2.5 18.3333 3.24619 18.3333 4.16667V11.6667C18.3333 12.5871 17.5871 13.3333 16.6667 13.3333H10.8333L5.83333 17.5V13.3333Z" stroke="#0B298F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="text-[#010101] text-[16px] font-[500] block">Powiadomienia SMS</span>
                                            <span className="text-[#5B5E68] text-[13px]">Wiadomosci tekstowe na Twoj numer telefonu</span>
                                        </div>
                                    </div>
                                    <div className={`w-[44px] h-[24px] rounded-full transition-colors relative ${notifications.sms ? "bg-[#0B298F]" : "bg-[#D9DADC]"}`}>
                                        <div className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow transition-transform ${notifications.sms ? "left-[22px]" : "left-[2px]"}`}/>
                                        <input
                                            type="checkbox"
                                            checked={notifications.sms}
                                            onChange={() => handleNotificationChange("sms")}
                                            className="sr-only"
                                        />
                                    </div>
                                </label>
                            </div>

                            <div className="flex justify-end mt-8">
                                <button className="bg-[#0B298F] hover:bg-[#091F6B] text-white px-8 py-3 rounded-xl font-[500] text-[16px] transition-colors">
                                    Zapisz ustawienia
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({req, res}) => {
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

    // Sprobuj pobrac uzytkownika z bazy
    let user = userId ? await findUserById(userId) : null;

    // Jesli nie znaleziono w bazie, uzyj danych z sesji (dla OAuth)
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
    const {password, ...userWithoutPassword} = user;

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
