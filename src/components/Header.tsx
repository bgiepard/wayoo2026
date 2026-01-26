import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import LoginModal from "./LoginModal";

export default function Header() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-300 max-w-[1250px] mx-auto">
      <div>wayoo</div>
      <div className="flex gap-4 items-center">
        {session ? (
          <>
            <span>🔔</span>
            <span>Moje zapytania</span>
            <span>Moje konto</span>
            <button onClick={() => signOut()} className="cursor-pointer">
              Wyloguj
            </button>
          </>
        ) : (
          <button onClick={() => setIsModalOpen(true)} className="cursor-pointer">
            Zaloguj się
          </button>
        )}
      </div>
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
}
