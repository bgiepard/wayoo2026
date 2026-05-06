import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LoginModal from "./LoginModal";
import NotificationDropdown from "./NotificationDropdown";
import logo from "@/assets/logo.png";
import userIcon from "@/assets/user_icon.svg";

const navLinks = [
  { label: "Podróżuj z Wayoo", href: "/transfers" },
  { label: "Dla hoteli i obiektów", href: "/for-hotels" },
  { label: "Partnerzy transportowi", href: "/become-driver" },
  { label: "O nas", href: "/about" },
  { label: "Pomoc i kontakt", href: "/faq" },
];

export default function Header() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header>
      <div className="bg-[#0B298F] px-4 py-[18px]">
        <div className="max-w-[1150px] mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold">
            <Image src={logo} width={120} height={40} alt="Wayoo logo" />
          </Link>

          {/* Desktop auth links */}
          <nav className="hidden lg:flex gap-8 items-center text-sm">
            {session ? (
              <>
                <NotificationDropdown />
                <Link href="/my-requests" className="text-white hover:text-gray-300 text-[16px]">Moje zapytania</Link>
                <Link href="/account" className="text-white hover:text-gray-300 text-[16px]">Moje konto</Link>
              </>
            ) : (
              <button onClick={() => setIsModalOpen(true)} className="text-white hover:text-gray-300 text-[16px]">
                Zaloguj sie
              </button>
            )}
          </nav>

          {/* Ikony mobile — powiadomienia + user + hamburger */}
          <div className="lg:hidden flex items-center gap-6">
            {/* Powiadomienia — tylko gdy zalogowany */}
            {session && (
              <div className="flex items-center justify-center w-8 h-8">
                <NotificationDropdown />
              </div>
            )}

            {/* User icon z menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                aria-label="Menu użytkownika"
                className="flex items-center justify-center w-8 h-8"
              >
                <Image src={userIcon} width={24} height={24} alt="Użytkownik" />
              </button>
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-[200px] bg-white rounded-[8px] shadow-lg z-40 overflow-hidden">
                    {session ? (
                      <>
                        <Link
                          href="/my-requests"
                          className="block px-4 py-3 text-[14px] text-gray-800 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Moje zapytania
                        </Link>
                        <Link
                          href="/account"
                          className="block px-4 py-3 text-[14px] text-gray-800 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Moje konto
                        </Link>
                      </>
                    ) : (
                      <button
                        onClick={() => { setIsUserMenuOpen(false); setIsModalOpen(true); }}
                        className="w-full text-left px-4 py-3 text-[14px] text-gray-800 hover:bg-gray-100"
                      >
                        Zaloguj się
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Hamburger */}
            <button
              className="flex flex-col justify-center items-center gap-[5px] w-8 h-8"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Otwórz menu"
            >
              <span className="block w-6 h-[2px] bg-white rounded" />
              <span className="block w-6 h-[2px] bg-white rounded" />
              <span className="block w-6 h-[2px] bg-white rounded" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop nav bar */}
      <div className="hidden lg:block bg-[#081D66]">
        <nav className="max-w-[1150px] mx-auto flex justify-center items-center gap-8 py-2 text-sm text-white">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gray-300 py-2 px-4 text-[14px] font-[600]">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] bg-[#0B298F] z-50 flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/20">
          <Image src={logo} width={100} height={34} alt="Wayoo logo" />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Zamknij menu"
            className="text-white w-8 h-8 flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-5 py-3 text-white text-[15px] font-[600] hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

      </div>

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
}
