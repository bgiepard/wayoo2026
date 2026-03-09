import SearchForm from "@/components/SearchForm";
import Image from "next/image";
import screen1Img from "@/assets/screen1.png";
import screen2Img from "@/assets/screen2.png";
import bgImg from "@/assets/bg.jpg";
import requestScreen1 from "@/assets/requestScreen1.svg";
import requestScreen2 from "@/assets/requestScreen2.svg";
import requestScreen3 from "@/assets/requestScreen3.svg";
import arrowsTop from "@/assets/arrowsTop.svg";
import arrowsBottom from "@/assets/arrowsBottom.svg";
import { WhyIcon1, WhyIcon2, WhyIcon3, WhyIcon4 } from "@/components/icons";
import React from "react";

const heroStyle = { '--bg-hero-url': `url(${bgImg.src})` } as React.CSSProperties;

export default function Home() {
    return (
        <main className="flex flex-col gap-8">
            {/* Sekcja 1: Formularz */}
            <section className="relative bg-hero flex flex-col justify-center" style={heroStyle}>
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 w-full max-w-[1150px] mx-auto pb-[64px] pt-[120px] md:pt-[300px] px-4">
                    <h1 className="text-center font-[400] text-[42px] mb-12 text-white hidden md:block">Zarezerwuj <span className="text-[#FFC428]">transport grupowy</span> w kilka minut.</h1>
                    <h1 className="text-center font-[400] text-[26px] mb-12 text-white md:hidden">Zarezerwuj <br/><span className="text-[#FFC428]">transport grupowy</span><br/> w kilka minut.</h1>
                   <div className="hidden md:block"><SearchForm/></div>
                </div>
            </section>

            <div className="md:hidden pb-8 bg-[#081D66] -mt-8"><SearchForm/></div>

            {/*Sekcja 2: Jak działa Wayoo?*/}
            <section className="flex flex-col justify-center">
                <div className="w-full max-w-[1150px] mx-auto px-4 md:pt-16 md:pb-24">
                    <h2 className="text-[#0B298F] text-[20px] md:text-[33px] text-center md:mb-16">Jak działa Wayoo?</h2>

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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-6">
                        <div className="flex flex-col items-center text-center lg:pr-30">
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

                        <div className="flex flex-col items-center text-center lg:pl-30">
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
                <div className="w-full max-w-[1150px] mx-auto px-4 pt-8 md:pt-[64px] pb-[48px] md:pb-[96px]">
                    <h2 className="text-[#0B298F] text-[20px] md:text-[33px] text-center mb-6 md:mb-[64px]">
                        Dlaczego warto wypróbować Wayoo?
                    </h2>

                    <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-12">
                        {/* Lewa strona — lista zalet */}
                        <div className="flex flex-col gap-8 lg:max-w-[55%]">
                            {/* 1. Prosty proces zamówienia */}
                            <div className="flex flex-col md:flex-row gap-[24px]">
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
                            <div className="flex flex-col md:flex-row gap-[24px]">
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
                            <div className="flex flex-col md:flex-row gap-[24px]">
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
                            <div className="flex flex-col md:flex-row gap-[24px]">
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

                        {/* Prawa strona — obrazki */}
                        {/* Desktop */}
                        <div className="relative hidden lg:block" style={{ width: 620, height: 400 }}>
                            <Image
                                src={screen2Img}
                                alt="Wayoo — podgląd aplikacji 2"
                                width={560}
                                height={350}
                                className="object-contain absolute bottom-35 left-0"
                            />
                            <Image
                                src={screen1Img}
                                alt="Wayoo — podgląd aplikacji 1"
                                width={560}
                                height={350}
                                className="object-contain absolute bottom-0 left-30"
                            />
                        </div>

                    </div>
                </div>
            </section>

            {/*Sekcja 4: Opinie użytkowników*/}
            <section className="flex flex-col justify-center">
                <div className="w-full max-w-[1150px] mx-auto px-4 md:pt-16 mb-[48px] md:pb-24">
                    <h2 className="text-[#0B298F] text-[20px] md:text-[33px] text-center mb-6 md:mb-16">Poznaj opinie użytkowników Wayoo</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Opinia 1 */}
                        <div className="flex flex-col gap-4 border border-[#D9DADC] rounded-[12px] p-6">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#FFC428" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 1L12.39 6.26L18.18 7.11L14.09 11.1L15.12 16.87L10 14.12L4.88 16.87L5.91 11.1L1.82 7.11L7.61 6.26L10 1Z"/>
                                    </svg>
                                ))}
                            </div>
                            <p className="text-[#010101] text-[16px] leading-[150%] flex-1">
                                Bardzo wygodna aplikacja. W kilka minut otrzymałam kilka ofert od przewoźników i mogłam wybrać najlepszą cenę. Cały proces – od zapytania po płatność – przebiegł bezproblemowo.
                            </p>
                            <div>
                                <p className="text-[#010101] font-semibold text-[16px]">Anna</p>
                                <p className="text-[#6B7280] text-[14px]">9 lutego 2026</p>
                            </div>
                        </div>

                        {/* Opinia 2 */}
                        <div className="flex flex-col gap-4 border border-[#D9DADC] rounded-[12px] p-6">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#FFC428" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 1L12.39 6.26L18.18 7.11L14.09 11.1L15.12 16.87L10 14.12L4.88 16.87L5.91 11.1L1.82 7.11L7.61 6.26L10 1Z"/>
                                    </svg>
                                ))}
                            </div>
                            <p className="text-[#010101] text-[16px] leading-[150%] flex-1">
                                Świetne rozwiązanie dla transportu grupowego. Nie trzeba dzwonić po firmach – wszystko w jednym miejscu. Przewoźnik był punktualny, a oferta zgodna z ustaleniami.
                            </p>
                            <div>
                                <p className="text-[#010101] font-semibold text-[16px]">Marcin</p>
                                <p className="text-[#6B7280] text-[14px]">17 lutego 2026</p>
                            </div>
                        </div>

                        {/* Opinia 3 */}
                        <div className="flex flex-col gap-4 border border-[#D9DADC] rounded-[12px] p-6">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#FFC428" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 1L12.39 6.26L18.18 7.11L14.09 11.1L15.12 16.87L10 14.12L4.88 16.87L5.91 11.1L1.82 7.11L7.61 6.26L10 1Z"/>
                                    </svg>
                                ))}
                            </div>
                            <p className="text-[#010101] text-[16px] leading-[150%] flex-1">
                                Aplikacja oszczędziła mi sporo czasu i stresu przy organizacji wyjazdu. Przejrzyste oferty, szybkie odpowiedzi i bezpieczna płatność. Zdecydowanie będę korzystać ponownie.
                            </p>
                            <div>
                                <p className="text-[#010101] font-semibold text-[16px]">Katarzyna</p>
                                <p className="text-[#6B7280] text-[14px]">19 lutego 2026</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
