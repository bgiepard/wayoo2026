import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import LoginModal from "./LoginModal";

export default function Header() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-300 max-w-[1250px] mx-auto">
      <Link href="/">wayoo</Link>
      <div className="flex gap-4 items-center">
        {session ? (
          <>
            <span>🔔</span>
            <Link href="/my-requests">Moje zapytania</Link>
            <Link href="/account">Moje konto</Link>
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
