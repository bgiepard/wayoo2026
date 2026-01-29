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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? "Zarejestruj sie" : "Zaloguj sie"}
      width="w-96"
    >
      {error && (
        <div className="mb-4 p-2 border border-red-300 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={isRegister ? handleRegister : handleLogin}
        className="flex flex-col gap-4"
      >
        {isRegister && (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Imie"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border border-gray-300 p-2 flex-1"
                required
              />
              <input
                type="text"
                placeholder="Nazwisko"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border border-gray-300 p-2 flex-1"
                required
              />
            </div>
            <input
              type="tel"
              placeholder="Telefon (opcjonalnie)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-gray-300 p-2"
            />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-2"
          required
        />
        <input
          type="password"
          placeholder="Haslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-2"
          required
        />
        <button type="submit" className="border border-gray-800 bg-gray-800 text-white p-2">
          {isRegister ? "Zarejestruj" : "Zaloguj"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <button onClick={switchMode} className="underline cursor-pointer">
          {isRegister
            ? "Masz juz konto? Zaloguj sie"
            : "Nie masz konta? Zarejestruj sie"}
        </button>
      </div>
    </Modal>
  );
}
