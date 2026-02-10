import SearchForm from "@/components/SearchForm";
import Image from "next/image";
import screensImg from "@/assets/screens.png";
import requestScreen1 from "@/assets/requestScreen1.svg";
import requestScreen2 from "@/assets/requestScreen2.svg";
import requestScreen3 from "@/assets/requestScreen3.svg";
import arrowsTop from "@/assets/arrowsTop.svg";
import arrowsBottom from "@/assets/arrowsBottom.svg";
import { WhyIcon1, WhyIcon2, WhyIcon3, WhyIcon4 } from "@/components/icons";

export default function Home() {
    return (
        <main className="flex flex-col gap-8">
            {/* Sekcja 1: Formularz */}
            <section className="flex flex-col justify-center bg-sky-900">
                <div className="w-full max-w-[1150px] mx-auto pb-[120px] pt-[120px] px-4">
                    <h1 className="text-center font-[400] text-[42px] mb-12 text-white">Zarezerwuj <span
                        className="text-[#FFC428]">transport grupowy</span> w kilka minut.</h1>
                    <SearchForm/>
                </div>
            </section>

            {/*Sekcja 2: Jak działa Wayoo?*/}
            <section className="flex flex-col justify-center">
                <div className="w-full max-w-[1150px] mx-auto px-4 pt-16 pb-24">
                    <h2 className="text-[#0B298F] text-[33px] text-center mb-16">Jak działa Wayoo?</h2>

                    {/* Wiersz 1: Obrazki + strzałki (5 kolumn) */}
                    <div className="hidden lg:flex items-center justify-between">
                        <div className="flex-1 flex justify-center">
                            <Image src={requestScreen1} alt="Składasz zapytanie" width={150} height={99} />
                        </div>
                        <div className="flex items-center">
                            <Image src={arrowsTop} alt="" width={201} height={101} />
                        </div>
                        <div className="flex-1 flex justify-center">
                            <Image src={requestScreen2} alt="Lokalni przewoźnicy przesyłają oferty" width={150} height={75} />
                        </div>
                        <div className="flex items-center">
                            <Image src={arrowsBottom} alt="" width={201} height={101} />
                        </div>
                        <div className="flex-1 flex justify-center">
                            <Image src={requestScreen3} alt="Wybierasz najlepszą opcję" width={150} height={84} />
                        </div>
                    </div>

                    {/* Wiersz 2: Teksty (3 kolumny) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                        <div className="flex flex-col items-center text-center pr-30">
                            {/* Obrazek tylko na mobile */}
                            <div className="lg:hidden mb-4">
                                <Image src={requestScreen1} alt="Składasz zapytanie" width={150} height={99} />
                            </div>
                            <h3 className="text-[#0B298F] font-[400] text-[18px] mb-2">
                                Składasz zapytanie<br/>transportowe
                            </h3>
                            <p className="text-[#010101] text-[16px] leading-[150%]">
                                Podajesz trasę, termin<br/>i liczbę pasażerów.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="lg:hidden mb-4">
                                <Image src={requestScreen2} alt="Lokalni przewoźnicy przesyłają oferty" width={150} height={75} />
                            </div>
                            <h3 className="text-[#0B298F] font-[400] text-[18px] mb-2">
                                Lokalni przewoźnicy<br/>przesyłają oferty
                            </h3>
                            <p className="text-[#010101] text-[16px] leading-[150%]">
                                Otrzymujesz konkurencyjne<br/>propozycje cenowe.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center pl-30">
                            <div className="lg:hidden mb-4">
                                <Image src={requestScreen3} alt="Wybierasz najlepszą opcję" width={150} height={84} />
                            </div>
                            <h3 className="text-[#0B298F] font-[400] text-[18px] mb-2">
                                Wybierasz najlepszą opcję<br/>i ruszasz w drogę
                            </h3>
                            <p className="text-[#010101] text-[16px] leading-[150%]">
                                Akceptujesz warunki<br/>dopasowane do Twoich gości.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/*Sekcja 3: Dlaczego warto wypróbować Wayoo?*/}
            <section className="bg-[#E7EAF4]">
                <div className="w-full max-w-[1150px] mx-auto px-4 pt-[64px] pb-[96px]">
                    <h2 className="text-[#0B298F] text-[33px] text-center mb-[64px]">
                        Dlaczego warto wypróbować Wayoo?
                    </h2>

                    <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-12">
                        {/* Lewa strona — lista zalet */}
                        <div className="flex flex-col gap-8 lg:max-w-[55%]">
                            {/* 1. Prosty proces zamówienia */}
                            <div className="flex gap-[24px]">
                                <div className="flex-shrink-0 p-[12px] bg-white rounded-[8px] border border-[#D9DADC] flex items-center justify-center self-start">
                                    <WhyIcon1 />
                                </div>
                                <div>
                                    <h3 className="text-[#0B298F] font-[400] text-[18px] mb-1">Prosty proces zamówienia</h3>
                                    <p className="text-[#010101] text-[16px] leading-[150%]">
                                        Składasz zapytanie, otrzymujesz oferty od przewoźników<br/>
                                        i wybierasz najlepszą — wszystko w jednym miejscu.<br/>
                                        Zapomnij o niekończących się telefonach i mailach!
                                    </p>
                                </div>
                            </div>

                            {/* 2. Bezpieczeństwo i weryfikacja */}
                            <div className="flex gap-[24px]">
                                <div className="flex-shrink-0 p-[12px] bg-white rounded-[8px] border border-[#D9DADC] flex items-center justify-center self-start">
                                    <WhyIcon2 />
                                </div>
                                <div>
                                    <h3 className="text-[#0B298F] font-[400] text-[18px] mb-1">Bezpieczeństwo i weryfikacja</h3>
                                    <p className="text-[#010101] text-[16px] leading-[150%]">
                                        Współpracujemy wyłącznie ze sprawdzonymi lokalnymi<br/>
                                        przewoźnikami. Każdy przewoźnik jest weryfikowany,<br/>
                                        a opinie pasażerów są zawsze dostępne.
                                    </p>
                                </div>
                            </div>

                            {/* 3. Oszczędność czasu */}
                            <div className="flex gap-[24px]">
                                <div className="flex-shrink-0 p-[12px] bg-white rounded-[8px] border border-[#D9DADC] flex items-center justify-center self-start">
                                    <WhyIcon3 />
                                </div>
                                <div>
                                    <h3 className="text-[#0B298F] font-[400] text-[18px] mb-1">Oszczędność czasu</h3>
                                    <p className="text-[#010101] text-[16px] leading-[150%]">
                                        Zamiast dzwonić do wielu przewoźników —<br/>
                                        wszystko odbywa się w jednym miejscu.<br/>
                                        <strong>Średni czas odpowiedzi to tylko 11 minut!</strong>
                                    </p>
                                </div>
                            </div>

                            {/* 4. Odpowiedzialny model współpracy */}
                            <div className="flex gap-[24px]">
                                <div className="flex-shrink-0 p-[12px] bg-white rounded-[8px] border border-[#D9DADC] flex items-center justify-center self-start">
                                    <WhyIcon4 />
                                </div>
                                <div>
                                    <h3 className="text-[#0B298F] font-[400] text-[18px] mb-1">Odpowiedzialny model współpracy</h3>
                                    <p className="text-[#010101] text-[16px] leading-[150%]">
                                        Wayoo wspiera standardy ESG i porządkuje proces<br/>
                                        organizacji transportu po stronie hotelu.<br/>
                                        Razem budujemy lepszą przyszłość!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Prawa strona — obrazek */}
                        <div className="flex justify-end">
                            <Image
                                src={screensImg}
                                alt="Wayoo — podgląd aplikacji"
                                width={520}
                                height={500}
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
