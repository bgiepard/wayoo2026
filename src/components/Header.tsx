import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LoginModal from "./LoginModal";
import NotificationDropdown from "./NotificationDropdown";
import { ChevronDownIcon } from "./icons";
import logo from "@/assets/logo.png";

const navMenus = [
  {
    label: "Podróżuj z Wayoo",
    items: [
      { href: "/transfers", label: "Transfery lotniskowe" },
      { href: "/city-rides", label: "Przejazdy miejskie" },
      { href: "/long-distance", label: "Trasy dalekobieżne" },
    ],
  },
  {
    label: "Dla hoteli i obiektów",
    items: [
      { href: "/for-hotels", label: "Oferta dla hoteli" },
      { href: "/for-resorts", label: "Oferta dla resortów" },
      { href: "/partnership", label: "Zostań partnerem" },
    ],
  },
  {
    label: "Partnerzy transportowi",
    items: [
      { href: "/become-driver", label: "Zostań kierowcą" },
      { href: "/fleet-partners", label: "Partnerzy flotowi" },
      { href: "/driver-app", label: "Aplikacja kierowcy" },
    ],
  },
  {
    label: "O nas",
    items: [
      { href: "/about", label: "O firmie" },
      { href: "/careers", label: "Kariera" },
      { href: "/press", label: "Dla mediów" },
    ],
  },
  {
    label: "Pomoc i kontakt",
    items: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Kontakt" },
      { href: "/support", label: "Wsparcie" },
    ],
  },
];

export default function Header() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header>
      <div className="bg-[#0B298F] px-4 py-[18px]">
        <div className="max-w-[1150px] mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold">
            <Image src={logo} width={120} height={40} alt="Wayoo logo" />
          </Link>

          <nav className="flex gap-8 items-center text-sm">
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
        </div>
      </div>

      <div className="bg-[#081D66]">
        <nav className="max-w-[1150px] mx-auto flex justify-center items-center gap-8 py-2 text-sm text-white">
          {navMenus.map((menu) => (
            <div key={menu.label} className="relative group">
              <button className="flex items-center gap-2 hover:text-gray-300 py-2 px-4 text-[14px] font-[600]">
                {menu.label}
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              <div className="absolute left-0 top-full hidden group-hover:block bg-white text-gray-800 rounded shadow-lg min-w-[200px] z-50">
                {menu.items.map((item) => (
                  <Link key={item.href} href={item.href} className="block px-4 py-2 hover:bg-gray-100">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
}
