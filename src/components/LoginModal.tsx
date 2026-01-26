import { signIn } from "next-auth/react";
import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
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
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      // Auto login after registration
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      resetForm();
      onClose();
    } catch {
      setError("Błąd podczas rejestracji");
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-300 p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h2>{isRegister ? "Zarejestruj się" : "Zaloguj się"}</h2>
          <button onClick={onClose}>✕</button>
        </div>

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
            <input
              type="text"
              placeholder="Imię"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 p-2"
              required
            />
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
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-2"
            required
          />
          <button type="submit" className="border border-gray-300 p-2">
            {isRegister ? "Zarejestruj" : "Zaloguj"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button onClick={switchMode} className="underline cursor-pointer">
            {isRegister
              ? "Masz już konto? Zaloguj się"
              : "Nie masz konta? Zarejestruj się"}
          </button>
        </div>
      </div>
    </div>
  );
}
