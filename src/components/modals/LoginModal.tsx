import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import ModalShell from "./ModalShell";
import { GoogleIcon } from "@/components/icons";

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
  onVerified?: () => void;
}

const inputCls =
  "w-full px-4 py-3 text-sm border border-[#E5E7EB] rounded-[10px] outline-none " +
  "focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all placeholder:text-tertiary";

export default function LoginModal({ isOpen, onClose, callbackUrl, onVerified }: LoginModalProps) {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [step, setStep] = useState<"auth" | "phone-verify">("auth");
  const [verifyPhone, setVerifyPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeError, setCodeError] = useState("");
  const codeSentRef = useRef(false);

  const redirectUrl = callbackUrl || router.asPath;

  useEffect(() => {
    if (!isOpen) {
      setStep("auth");
      setVerifyPhone("");
      setSmsCode("");
      setCodeError("");
      codeSentRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (step !== "phone-verify" || !verifyPhone || codeSentRef.current) return;
    codeSentRef.current = true;
    sendSmsCode();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, verifyPhone]);

  const resetAuthForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setError("");
  };

  const goToPhoneVerify = (phoneNumber: string) => {
    setVerifyPhone(phoneNumber);
    setStep("phone-verify");
    setSmsCode("");
    setCodeError("");
    codeSentRef.current = false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Nieprawidłowy email lub hasło");
      return;
    }
    const session = await getSession();
    const sessionPhone = (session?.user as { phone?: string })?.phone || "";
    resetAuthForm();
    goToPhoneVerify(sessionPhone);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      await signIn("credentials", { email, password, redirect: false });
      const registeredPhone = phone;
      resetAuthForm();
      goToPhoneVerify(registeredPhone);
    } catch {
      setError("Błąd podczas rejestracji");
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    await signIn("google", { callbackUrl: redirectUrl });
  };

  const sendSmsCode = async () => {
    if (!verifyPhone) return;
    setIsSendingCode(true);
    setCodeError("");
    try {
      const res = await fetch("/api/auth/send-phone-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: verifyPhone }),
      });
      if (!res.ok) {
        const data = await res.json();
        setCodeError(data.error || "Nie udało się wysłać kodu SMS");
      }
    } catch {
      setCodeError("Nie udało się wysłać kodu SMS");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResend = () => {
    codeSentRef.current = false;
    setSmsCode("");
    setCodeError("");
    codeSentRef.current = true;
    sendSmsCode();
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setCodeError("");
    try {
      const res = await fetch("/api/auth/verify-phone-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: verifyPhone, code: smsCode }),
      });
      if (res.ok) {
        onVerified?.();
        onClose();
      } else {
        const data = await res.json();
        setCodeError(data.error || "Nieprawidłowy kod");
      }
    } catch {
      setCodeError("Błąd weryfikacji");
    } finally {
      setIsVerifying(false);
    }
  };

  if (step === "phone-verify") {
    return (
      <ModalShell
        isOpen={isOpen}
        onClose={onClose}
        title="Weryfikacja telefonu"
        subtitle="Wpisz kod SMS wysłany na poniższy numer"
      >
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="Numer telefonu"
              value={verifyPhone}
              onChange={(e) => { setVerifyPhone(e.target.value); setSmsCode(""); setCodeError(""); }}
              className={`${inputCls} flex-1`}
              required
            />
            <button
              type="button"
              onClick={handleResend}
              disabled={isSendingCode || !verifyPhone}
              className="shrink-0 px-4 py-3 text-[13px] font-medium text-navy border border-[#E5E7EB] rounded-[10px] hover:bg-disabled transition-colors disabled:opacity-50"
            >
              {isSendingCode ? "Wysyłanie…" : "Wyślij kod"}
            </button>
          </div>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Kod SMS (6 cyfr)"
            value={smsCode}
            onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
            className={`${inputCls} tracking-[0.3em] text-center text-[18px]`}
            autoFocus
          />

          {codeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[10px] text-red-600 text-sm">
              {codeError}
            </div>
          )}

          <button
            type="submit"
            disabled={smsCode.length < 4 || isVerifying || !verifyPhone}
            className="w-full py-3 rounded-[10px] text-white text-[15px] font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#0B298F" }}
          >
            {isVerifying ? "Weryfikacja…" : "Zatwierdź"}
          </button>
        </form>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? "Zarejestruj się" : "Zaloguj się"}
      subtitle={isRegister ? "Utwórz nowe konto pasażera" : "Witaj z powrotem"}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px] text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="w-full flex items-center justify-center gap-3 border border-[#E5E7EB] rounded-[10px] p-3 text-sm font-medium hover:bg-disabled disabled:opacity-50 mb-4 transition-colors"
      >
        <GoogleIcon />
        {isGoogleLoading ? "Przekierowywanie..." : "Kontynuuj z Google"}
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E5E7EB]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-tertiary">lub</span>
        </div>
      </div>

      <form onSubmit={isRegister ? handleRegister : handleLogin} className="flex flex-col gap-3">
        {isRegister && (
          <>
            <div className="flex gap-3">
              <input
                type="text"
                data-cy="input-first-name"
                placeholder="Imię"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`${inputCls} flex-1`}
                required
              />
              <input
                type="text"
                data-cy="input-last-name"
                placeholder="Nazwisko"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`${inputCls} flex-1`}
                required
              />
            </div>
            <input
              type="tel"
              placeholder="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
              required
            />
          </>
        )}
        <input
          type="email"
          data-cy="input-email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          required
        />
        <input
          type="password"
          data-cy="input-password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          required
        />
        <button
          type="submit"
          data-cy="btn-auth-submit"
          className="w-full py-3 rounded-[10px] text-white text-[15px] font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: "#0B298F" }}
        >
          {isRegister ? "Zarejestruj się" : "Zaloguj się"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => { setIsRegister(!isRegister); setError(""); }}
          data-cy="btn-switch-auth-mode"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          {isRegister
            ? "Masz już konto? Zaloguj się"
            : "Nie masz konta? Zarejestruj się"}
        </button>
      </div>
    </ModalShell>
  );
}
