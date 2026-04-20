import { useState } from "react";
import { useRouter } from "next/router";

export default function VerifyPendingPage() {
  const router = useRouter();
  const { email } = router.query;
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendMessage("");
    setResendError("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendMessage("Email weryfikacyjny został wysłany ponownie.");
      } else {
        setResendError(data.error || "Nie udało się wysłać emaila.");
      }
    } catch {
      setResendError("Błąd sieci. Spróbuj ponownie.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-[12px] border border-[#D9DADC] p-10 max-w-[480px] w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[#EEF2FF] flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" stroke="#0B298F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 6L12 13L2 6" stroke="#0B298F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="text-[#0B298F] text-[24px] font-[600] mb-3">Sprawdź skrzynkę email</h1>
        <p className="text-[#5B5E68] text-[15px] leading-[160%] mb-2">
          Wysłaliśmy link aktywacyjny na adres:
        </p>
        {email && (
          <p className="text-[#010101] font-[600] text-[15px] mb-6">{email}</p>
        )}
        <p className="text-[#5B5E68] text-[14px] leading-[160%] mb-8">
          Kliknij link w emailu, aby aktywować konto. Link wygaśnie po 24 godzinach.
        </p>

        <div className="border-t border-[#D9DADC] pt-6">
          <p className="text-[#9B9DA3] text-[13px] mb-3">Nie dostałeś emaila?</p>
          <button
            onClick={handleResend}
            disabled={resending || !email}
            className="text-[#0B298F] font-[500] text-[14px] hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {resending ? "Wysyłanie..." : "Wyślij ponownie"}
          </button>
          {resendMessage && (
            <p className="text-[#01A83D] text-[13px] mt-3">{resendMessage}</p>
          )}
          {resendError && (
            <p className="text-[#D32F2F] text-[13px] mt-3">{resendError}</p>
          )}
        </div>
      </div>
    </main>
  );
}
