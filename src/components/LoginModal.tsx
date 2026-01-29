import { signIn } from "next-auth/react";
import { useState } from "react";
import Modal from "./ui/Modal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

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
