import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import ModalShell from "./ModalShell";
import { GoogleIcon } from "@/components/icons";

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
}

export default function LoginModal({ isOpen, onClose, callbackUrl }: LoginModalProps) {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const redirectUrl = callbackUrl || router.asPath;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Nieprawidłowy email lub hasło");
    } else {
      resetForm();
      onClose();
    }
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
      resetForm();
      onClose();
    } catch {
      setError("Błąd podczas rejestracji");
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    await signIn("google", { callbackUrl: redirectUrl });
  };

  const inputCls =
    "w-full px-4 py-3 text-sm border border-[#E5E7EB] rounded-[10px] outline-none " +
    "focus:border-[#0B298F] focus:ring-2 focus:ring-[#0B298F]/10 transition-all placeholder:text-[#9B9DA3]";

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
        className="w-full flex items-center justify-center gap-3 border border-[#E5E7EB] rounded-[10px] p-3 text-sm font-medium hover:bg-[#F8F9FA] disabled:opacity-50 mb-4 transition-colors"
      >
        <GoogleIcon />
        {isGoogleLoading ? "Przekierowywanie..." : "Kontynuuj z Google"}
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E5E7EB]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-[#9B9DA3]">lub</span>
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
              placeholder="Telefon (opcjonalnie)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
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
          className="text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
        >
          {isRegister
            ? "Masz już konto? Zaloguj się"
            : "Nie masz konta? Zarejestruj się"}
        </button>
      </div>
    </ModalShell>
  );
}
