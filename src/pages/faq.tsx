import { useState } from "react";
import Link from "next/link";

function Eyebrow({ children }: { children: React.ReactNode }) {
    return <p className="text-[11px] font-[700] tracking-[.1em] uppercase text-navy mb-[10px]">{children}</p>;
}

function H2({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-[clamp(22px,3vw,32px)] font-[600] tracking-[-0.022em] text-foreground leading-[1.22] mb-3">
            {children}
        </h2>
    );
}

function Lead({ children }: { children: React.ReactNode }) {
    return <p className="text-[16px] text-muted max-w-[580px] mb-11 leading-[1.72]">{children}</p>;
}

const faqs = [
    {
        q: "Jak złożyć zapytanie o transport?",
        a: "Wystarczy wejść na stronę główną Wayoo, wypełnić formularz z trasą, datą, godziną i liczbą pasażerów, a następnie opublikować zapytanie. Przewoźnicy sami się z Tobą skontaktują z ofertami.",
    },
    {
        q: "Jak długo czeka się na oferty od przewoźników?",
        a: "Pierwsze oferty zazwyczaj pojawiają się w ciągu kilku do kilkunastu minut od opublikowania zapytania. Czas oczekiwania zależy od trasy i terminu.",
    },
    {
        q: "Czy korzystanie z platformy jest bezpłatne dla pasażerów?",
        a: "Tak — dla pasażerów korzystanie z Wayoo jest bezpłatne. Płacisz wyłącznie za wybrany przejazd, zgodnie z ofertą przewoźnika.",
    },
    {
        q: "Jak wybrać najlepszą ofertę?",
        a: "Po otrzymaniu ofert możesz porównać je pod względem ceny, informacji o pojeździe, liczby miejsc oraz zdjęć. Wybierasz ofertę, która najbardziej odpowiada Twoim potrzebom.",
    },
    {
        q: "Jak przebiega płatność?",
        a: "Po wybraniu oferty skontaktujesz się bezpośrednio z przewoźnikiem w celu ustalenia formy płatności.",
    },
    {
        q: "Czy mogę anulować zapytanie?",
        a: "Tak — możesz anulować opublikowane zapytanie, jeśli nie wybrałeś jeszcze żadnej oferty. Opcja anulowania dostępna jest na liście ofert.",
    },
    {
        q: "Jak skontaktować się z kierowcą po wyborze oferty?",
        a: "Po dokonaniu płatności otrzymasz dane kontaktowe kierowcy — numer telefonu i adres e-mail — bezpośrednio w systemie.",
    },
    {
        q: "Czy muszę być zalogowany, żeby złożyć zapytanie?",
        a: "Tak, do złożenia zapytania wymagane jest posiadanie konta i zalogowanie się. Rejestracja jest bezpłatna.",
    },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-chrome">
            <button
                className="w-full flex items-start justify-between gap-4 py-5 text-left"
                onClick={() => setOpen((o) => !o)}
            >
                <span className="text-[15px] font-[600] text-foreground leading-[1.4]">{q}</span>
                <svg
                    width="20" height="20" viewBox="0 0 20 20" fill="none"
                    className={`shrink-0 mt-[2px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                >
                    <path d="M5 7.5l5 5 5-5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {open && (
                <p className="text-[14px] text-muted leading-[1.72] pb-5">{a}</p>
            )}
        </div>
    );
}

export default function FaqPage() {
    return (
        <div>
            {/* HERO */}
            <div className="bg-dark px-6 py-[72px] relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 65% 55% at 75% 55%, rgba(67,97,238,.16) 0%, transparent 70%)" }}
                />
                <div className="max-w-[1100px] mx-auto relative z-10">
                    <span className="inline-block text-[11px] font-[600] tracking-[.1em] uppercase text-white/40 mb-4">Pomoc i kontakt</span>
                    <h1 className="text-[clamp(26px,3.8vw,44px)] font-[600] text-white leading-[1.17] tracking-[-0.025em] mb-[18px] max-w-[660px]">
                        Jak możemy <em className="text-blue-alt not-italic">Ci pomóc?</em>
                    </h1>
                    <p className="text-[16px] text-white/60 max-w-[540px] leading-[1.72]">
                        Znajdziesz tu odpowiedzi na najczęściej zadawane pytania oraz dane kontaktowe do naszego zespołu.
                    </p>
                </div>
            </div>

            {/* FAQ */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Najczęstsze pytania</Eyebrow>
                    <H2>FAQ</H2>
                    <Lead>Odpowiedzi na pytania, które zadają nam najczęściej pasażerowie i przewoźnicy.</Lead>

                    <div className="max-w-[760px]">
                        {faqs.map((faq) => (
                            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Kontakt */}
            <div className="bg-faint">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Kontakt</Eyebrow>
                    <H2>Skontaktuj się z nami</H2>
                    <Lead>Nie znalazłeś odpowiedzi? Napisz lub zadzwoń — odpowiemy najszybciej jak to możliwe.</Lead>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                icon: (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.86 10.82 19.79 19.79 0 01.77 2.18 2 2 0 012.75 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l1.28-1.28a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" stroke="#0B298F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ),
                                label: "Telefon",
                                value: "510 554 018",
                                href: "tel:510554018",
                            },
                            {
                                icon: (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#0B298F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        <polyline points="22,6 12,13 2,6" stroke="#0B298F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ),
                                label: "E-mail",
                                value: "kontakt@wayoo.pl",
                                href: "mailto:kontakt@wayoo.pl",
                            },
                            {
                                icon: (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="#0B298F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="10" r="3" stroke="#0B298F" strokeWidth="1.8" />
                                    </svg>
                                ),
                                label: "Adres",
                                value: "ul. Sosnowa 6, 76-270 Wodnica",
                                href: undefined,
                            },
                        ].map((item) => (
                            <div key={item.label} className="bg-white border border-chrome rounded-xl p-6 flex flex-col items-start gap-3">
                                <div className="w-10 h-10 rounded-[10px] bg-accent-soft flex items-center justify-center shrink-0">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-[12px] text-muted mb-1">{item.label}</p>
                                    {item.href ? (
                                        <a href={item.href} className="text-[15px] font-[600] text-navy hover:underline">
                                            {item.value}
                                        </a>
                                    ) : (
                                        <p className="text-[15px] font-[600] text-foreground">{item.value}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <div className="bg-navy rounded-xl px-10 py-[50px] text-center">
                        <h2 className="text-[clamp(22px,3vw,32px)] font-[600] text-white leading-[1.22] tracking-[-0.022em]">
                            Gotowy na wygodny transport grupowy?
                        </h2>
                        <p className="text-white/70 max-w-[460px] mx-auto mt-[10px] mb-7 text-[15px]">
                            Zarezerwuj przejazd już teraz — jedno zapytanie wystarczy.
                        </p>
                        <Link
                            href="/"
                            className="bg-white text-navy font-[700] px-6 rounded-lg inline-flex items-center h-12 hover:opacity-90 transition-opacity text-[14px]"
                        >
                            Zarezerwuj teraz →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
