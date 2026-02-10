import Image from "next/image";
import logo from "@/assets/logo.png";
import {
  LinkedInIcon,
  FacebookIcon,
  YouTubeIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
} from "./icons";

export default function Footer() {
  return (
    <footer>
      <div className="bg-[#0B298F] text-white">
        <div className="max-w-[1150px] mx-auto px-4 py-16 gap-6 flex justify-between">
          {/* Kolumna 1: Logo + opis + social */}
          <div className="w-[564px]">
            <Image src={logo} width={120} height={40} alt="Wayoo logo" className="mb-6" />
            <p className="text-[16px] leading-[150%] text-white/80 mb-8">
              Platforma, która łączy pasażerów z profesjonalnymi<br/>
              przewoźnikami, oferując szybki, wygodny i bezpieczny<br/>
              sposób organizacji transportu grupowego.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" aria-label="LinkedIn"><LinkedInIcon /></a>
              <a href="#" aria-label="Facebook"><FacebookIcon /></a>
              <a href="#" aria-label="YouTube"><YouTubeIcon /></a>
              <a href="#" aria-label="Instagram"><InstagramIcon /></a>
            </div>
          </div>

          {/* Kolumna 2: Linki nawigacyjne */}
          <div className="flex flex-col gap-4">
            <a href="#" className="text-[16px] hover:text-white/80 transition-colors">O nas</a>
            <a href="#" className="text-[16px] hover:text-white/80 transition-colors">Jak działa Wayoo?</a>
            <a href="#" className="text-[16px] hover:text-white/80 transition-colors">Dla przewoźników</a>
            <a href="#" className="text-[16px] hover:text-white/80 transition-colors">Cennik</a>
            <a href="#" className="text-[16px] hover:text-white/80 transition-colors">Kontakt</a>
            <a href="#" className="text-[16px] hover:text-white/80 transition-colors">Regulamin</a>
            <a href="#" className="text-[16px] hover:text-white/80 transition-colors">Polityka prywatności</a>
          </div>

          {/* Kolumna 3: Dane firmy */}
          <div>
            <h3 className="text-[16px] font-semibold mb-4">Wayoo Sp. z o.o.</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPinIcon className="shrink-0 mt-0.5" />
                <span className="text-[16px] leading-[150%]">
                  ul. Przykładowa 123<br/>00-001 Warszawa
                </span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="shrink-0" />
                <span className="text-[16px]">+48 123 456 789</span>
              </div>
              <div className="flex items-center gap-3">
                <MailIcon className="shrink-0" />
                <span className="text-[16px]">kontakt@wayoo.pl</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dolny pasek */}
      <div className="bg-[#FFC428] p-2 text-center">
        <span className="text-[#010101] text-[13px]">© 2026 Wayoo Sp. z o.o. Wszelkie prawa zastrzeżone.</span>
      </div>
    </footer>
  );
}
