import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Modal from "./ui/Modal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
        fill="#EA4335"
      />
    </svg>
  );
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

  // Użyj przekazanego callbackUrl lub aktualnej ścieżki
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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Nieprawidlowy email lub haslo");
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
      setError("Blad podczas rejestracji");
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError("");
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    await signIn("google", { callbackUrl: redirectUrl });
  };

  const inputClass = "border border-gray-200 rounded-lg p-3 text-sm focus:border-blue-500";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? "Zarejestruj sie" : "Zaloguj sie"}
      width="w-96"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg p-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 mb-4"
      >
        <GoogleIcon />
        {isGoogleLoading ? "Przekierowywanie..." : "Kontynuuj z Google"}
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500">lub</span>
        </div>
      </div>

      <form
        onSubmit={isRegister ? handleRegister : handleLogin}
        className="flex flex-col gap-4"
      >
        {isRegister && (
          <>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Imie"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`${inputClass} flex-1`}
                required
              />
              <input
                type="text"
                placeholder="Nazwisko"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`${inputClass} flex-1`}
                required
              />
            </div>
            <input
              type="tel"
              placeholder="Telefon (opcjonalnie)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          required
        />
        <input
          type="password"
          placeholder="Haslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 text-sm font-medium"
        >
          {isRegister ? "Zarejestruj" : "Zaloguj"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button onClick={switchMode} className="text-sm text-gray-500 hover:text-gray-700">
          {isRegister
            ? "Masz juz konto? Zaloguj sie"
            : "Nie masz konta? Zarejestruj sie"}
        </button>
      </div>
    </Modal>
  );
}
