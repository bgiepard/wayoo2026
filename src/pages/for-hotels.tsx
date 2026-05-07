import Link from "next/link";

function Eyebrow({ children }: { children: React.ReactNode }) {
    return <p className="text-[11px] font-[700] tracking-[.1em] uppercase text-navy mb-[10px]">{children}</p>;
}

function H2({ children, light }: { children: React.ReactNode; light?: boolean }) {
    return (
        <h2 className={`text-[clamp(22px,3vw,32px)] font-[600] tracking-[-0.022em] leading-[1.22] mb-3 ${light ? "text-white" : "text-foreground"}`}>
            {children}
        </h2>
    );
}

function Lead({ children, light }: { children: React.ReactNode; light?: boolean }) {
    return <p className={`text-[16px] max-w-[580px] mb-11 leading-[1.72] ${light ? "text-white/50" : "text-muted"}`}>{children}</p>;
}

function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="m-0 p-0 list-none">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-[10px] py-2 border-b border-chrome last:border-b-0 text-[14px] text-muted leading-[1.6]">
                    <span className="w-[6px] h-[6px] rounded-full bg-navy shrink-0 mt-[7px]" />
                    {item}
                </li>
            ))}
        </ul>
    );
}

const hotelChips = [
    { icon: "🏙️", title: "Hotele miejskie", desc: "Goście podróżujący do miast często potrzebują transportu z lotniska, dworca lub pomiędzy różnymi punktami w mieście." },
    { icon: "🎤", title: "Hotele konferencyjne", desc: "Obiekty organizujące konferencje, szkolenia lub wydarzenia często potrzebują transportu dla uczestników." },
    { icon: "🏖️", title: "Hotele turystyczne i resorty", desc: "Goście podróżujący na wypoczynek często planują transport pomiędzy miejscem noclegu a atrakcjami turystycznymi." },
    { icon: "🏡", title: "Pensjonaty i obiekty butikowe", desc: "Mniejsze obiekty mogą dzięki Wayoo zapewnić gościom dodatkową wygodę związaną z organizacją transportu." },
    { icon: "👥", title: "Obiekty przyjmujące grupy", desc: "Transport jest szczególnie istotny w przypadku pobytów grupowych, wyjazdów firmowych lub wycieczek." },
    { icon: "🏢", title: "Apartamenty", desc: "Goście samodzielnie organizują transport dzięki dostępnemu kodowi QR." },
];

const obSteps = [
    { num: 1, title: "Rejestracja hotelu", desc: "Hotel otrzymuje dostęp do dedykowanego dashboardu, który umożliwia zarządzanie transportem gości." },
    { num: 2, title: "Udostępnienie systemu gościom", desc: "Obiekt może organizować transport bezpośrednio z poziomu recepcji lub udostępnić gościom kod QR, dzięki któremu mogą samodzielnie rozpocząć organizację przejazdu." },
    { num: 3, title: "Organizacja transportu", desc: "Zapytania trafiają do przewoźników, którzy przesyłają propozycje przejazdu. Hotel lub gość może wybrać ofertę najlepiej dopasowaną do potrzeb podróży." },
];

export default function ForHotelsPage() {
    return (
        <div>
            {/* HERO */}
            <div className="bg-dark px-6 py-[72px] relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 65% 55% at 75% 55%, rgba(67,97,238,.16) 0%, transparent 70%)" }}
                />
                <div className="max-w-[1100px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-center">
                    <div>
                        <span className="inline-block text-[11px] font-[600] tracking-[.1em] uppercase text-white/40 mb-4">
                            Dedykowany system dla hoteli i obiektów noclegowych
                        </span>
                        <h1 className="text-[clamp(26px,3.8vw,44px)] font-[600] text-white leading-[1.17] tracking-[-0.025em] mb-[18px] max-w-[660px]">
                            Zarządzaj transportem gości<br />
                            z <em className="text-blue-alt not-italic">jednego miejsca</em>
                        </h1>
                        <p className="text-[16px] text-white/60 max-w-[540px] mb-8 leading-[1.72]">
                            Każdy hotel lub obiekt noclegowy współpracujący z Wayoo otrzymuje dostęp do własnego, dedykowanego panelu zarządzania. Organizacja transportu dla gości staje się prostsza i bardziej przejrzysta.
                        </p>
                        <div className="flex gap-3 flex-wrap">
                            <Link href="/faq" className="bg-navy hover:bg-navy-dark text-white text-[14px] font-[600] px-6 h-12 rounded-lg flex items-center transition-colors">
                                Skontaktuj się z nami →
                            </Link>
                        </div>
                    </div>

                    {/* Dashboard mockup */}
                    <div className="bg-[#090920] rounded-[14px] p-4 border border-white/5 shadow-[0_28px_72px_rgba(0,0,0,.55)]">
                        <div className="flex justify-between items-center mb-[14px]">
                            <span className="text-[10px] font-[700] tracking-[.08em] text-white/35">HOTEL DASHBOARD</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                                <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                                <div className="w-2 h-2 rounded-full bg-[#28c840]" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {[["24", "PRZEJAZDY"], ["3", "OCZEKUJĄ", "#4361ee"], ["11min", "ŚR. CZAS", "#28c840"]].map(([num, lbl, color]) => (
                                <div key={lbl} className="bg-white/4 rounded-[8px] p-[10px] text-center">
                                    <div className="text-[18px] font-[700] text-white" style={color ? { color } : {}}>{num}</div>
                                    <div className="text-[9px] text-white/30 mt-[2px] tracking-[.04em]">{lbl}</div>
                                </div>
                            ))}
                        </div>
                        {[
                            { color: "#4361ee", name: "Kowalski J. · +3 os.", route: "WAW Lotnisko → Hotel · Dziś 14:30", badge: "Aktywny", badgeBg: "#d1fae5", badgeColor: "#065f46" },
                            { color: "#a855f7", name: "Nowak M. · +7 os.", route: "Hotel → KRK Lotnisko · Jutro 9:00", badge: "Oferty: 3", badgeBg: "#fef3c7", badgeColor: "#92400e" },
                            { color: "#059669", name: "Wiśniewska A. · +12 os.", route: "Hotel → Centrum wystawowe", badge: "QR", badgeBg: "#dbeafe", badgeColor: "#1e40af" },
                        ].map((row) => (
                            <div key={row.name} className="bg-white/4 rounded-[8px] px-3 py-[10px] mb-[6px] flex items-center gap-[10px]">
                                <div className="w-[22px] h-[22px] rounded-full shrink-0" style={{ background: row.color }} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-[600] text-white/80">{row.name}</div>
                                    <div className="text-[9px] text-white/33 mt-[1px]">{row.route}</div>
                                </div>
                                <span className="text-[8px] font-[700] px-[7px] py-[3px] rounded-[20px]" style={{ background: row.badgeBg, color: row.badgeColor }}>{row.badge}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dashboard opis */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Dedykowany panel zarządzania</Eyebrow>
                    <H2>Dashboard umożliwia wygodne organizowanie transportu</H2>
                    <Lead>Zarówno dla gości indywidualnych, jak i grupowych. Wszystkie zapytania i zamówienia transportowe są widoczne w jednym miejscu, co pozwala recepcji lub zespołowi obsługi sprawnie zarządzać przejazdami.</Lead>
                </div>
            </div>

            {/* Dwa tryby */}
            <div className="bg-faint">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Elastyczność organizacji</Eyebrow>
                    <H2>Transport organizowany przez hotel lub bezpośrednio przez gościa</H2>
                    <Lead>System Wayoo daje obiektom noclegowym dużą elastyczność w sposobie zamawiania transportu.</Lead>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-white border border-chrome rounded-xl p-7">
                            <div className="text-[30px] mb-[14px]">🖥️</div>
                            <h4 className="text-[17px] font-[600] text-foreground mb-[10px]">Hotel zamawia transport dla gości</h4>
                            <p className="text-[14px] text-muted leading-[1.7] mb-[14px]">
                                Hotel może zamawiać transport dla gości bezpośrednio z poziomu dashboardu — np. w przypadku transferów z lotniska, transportu dla grup lub przejazdów związanych z wydarzeniami organizowanymi w obiekcie.
                            </p>
                            <span className="inline-block text-[11px] font-[600] px-3 py-1 rounded-[20px] bg-accent-soft text-blue-alt">Dashboard hotelowy</span>
                        </div>

                        <div className="bg-white border border-chrome rounded-xl p-7">
                            <div className="text-[30px] mb-[14px]">📱</div>
                            <h4 className="text-[17px] font-[600] text-foreground mb-[10px]">Gość organizuje transport samodzielnie</h4>
                            <p className="text-[14px] text-muted leading-[1.7] mb-[14px]">
                                Hotel może udostępnić gościom kod QR, który pozwala w prosty sposób rozpocząć organizację transportu samodzielnie. System automatycznie przypisuje takie zapytanie do danego hotelu.
                            </p>
                            <span className="inline-block text-[11px] font-[600] px-3 py-1 rounded-[20px] bg-[#f0fdf4] text-[#166534] mb-4">Kod QR dla gości</span>
                            <div className="bg-faint rounded-lg p-[14px] border border-chrome">
                                <p className="text-[11px] text-muted mb-2">Kod QR może być umieszczony:</p>
                                <BulletList items={["w recepcji", "w pokojach", "w materiałach informacyjnych dla gości", "w wiadomościach wysyłanych przed przyjazdem"]} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ESG */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Dane i raportowanie</Eyebrow>
                    <H2>Dane i raportowanie wspierające zrównoważony rozwój</H2>
                    <Lead>Wayoo zbiera i porządkuje dane związane z organizacją transportu dla gości.</Lead>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                        <div className="flex flex-col gap-[10px]">
                            {[
                                { icon: "📊", text: "Liczba przejazdów i rodzaj transportu" },
                                { icon: "🗺️", text: "Trasy podróży gości" },
                                { icon: "🌿", text: "Dane o wpływie transportu na środowisko" },
                            ].map((s) => (
                                <div key={s.text} className="bg-white border border-chrome rounded-lg px-4 py-[14px] flex items-center gap-3">
                                    <span className="text-[20px]">{s.icon}</span>
                                    <span className="text-[13px] text-muted leading-[1.4]">{s.text}</span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white border border-chrome rounded-xl p-[26px]">
                            <h4 className="text-[15px] font-[600] text-foreground mb-[10px]">Dane gromadzone w systemie mogą być pomocne przy:</h4>
                            <BulletList items={["raportowaniu działań środowiskowych", "analizie mobilności gości", "planowaniu bardziej zrównoważonych rozwiązań transportowych"]} />
                            <p className="text-[14px] text-muted leading-[1.72] mt-4">
                                Wayoo wspiera hotele w lepszym zarządzaniu informacjami dotyczącymi transportu gości oraz w budowaniu bardziej odpowiedzialnego podejścia do mobilności w turystyce.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {["Raportowanie ESG", "Analiza mobilności", "Zrównoważony rozwój"].map((tag) => (
                                    <span key={tag} className="text-[12px] font-[500] px-3 py-[5px] rounded-[20px] border border-chrome text-muted bg-faint">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dla jakich obiektów */}
            <div className="bg-faint">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Dla kogo</Eyebrow>
                    <H2>Dla jakich obiektów jest Wayoo</H2>
                    <Lead>Rozwiązanie Wayoo zostało zaprojektowane z myślą o różnych typach obiektów noclegowych, które chcą zapewnić swoim gościom wygodną organizację transportu.</Lead>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px]">
                        {hotelChips.map((chip) => (
                            <div key={chip.title} className="bg-white border border-chrome rounded-xl px-4 py-5 text-center hover:shadow-[0_4px_18px_rgba(18,18,42,.07)] hover:-translate-y-0.5 transition-all duration-200">
                                <div className="text-[26px] mb-[10px]">{chip.icon}</div>
                                <h4 className="text-[13.5px] font-[600] text-foreground mb-1">{chip.title}</h4>
                                <p className="text-[12px] text-muted leading-[1.5]">{chip.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Jak wygląda współpraca */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Jak wygląda współpraca z Wayoo</Eyebrow>
                    <H2>Rozpoczęcie współpracy jest proste</H2>
                    <Lead>Nie wymaga skomplikowanego wdrożenia.</Lead>

                    <div className="flex flex-col">
                        {obSteps.map((step, i) => (
                            <div key={step.num} className={`flex gap-4 py-5 ${i < obSteps.length - 1 ? "border-b border-chrome" : ""}`}>
                                <div className="w-9 h-9 rounded-[10px] bg-dark text-white text-[14px] font-[700] flex items-center justify-center shrink-0 mt-[1px]">
                                    {step.num}
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-[600] text-foreground mb-[6px]">{step.title}</h4>
                                    <p className="text-[13.5px] text-muted leading-[1.65]">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA split */}
            <div className="bg-faint">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <p className="text-[16px] font-[600] text-foreground mb-6">
                        Wayoo pomaga hotelom organizować transport dla gości oraz zarządzać danymi dotyczącymi mobilności i ESG w jednym systemie.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-dark rounded-xl p-8 text-center">
                            <h3 className="text-[18px] font-[600] text-white mb-2">Skontaktuj się z nami</h3>
                            <p className="text-[13.5px] text-white/50 mb-[22px]">Jeśli prowadzisz hotel, pensjonat lub apartament i chcesz zapewnić swoim gościom wygodną organizację transportu, skontaktuj się z nami.</p>
                            <Link href="/faq" className="bg-navy hover:bg-navy-dark text-white text-[14px] font-[600] px-6 h-12 rounded-lg inline-flex items-center transition-colors">
                                Wyślij zapytanie →
                            </Link>
                        </div>
                        <div className="bg-white border border-chrome rounded-xl p-8 text-center">
                            <h3 className="text-[18px] font-[600] text-foreground mb-2">Pobierz materiały informacyjne</h3>
                            <p className="text-[13.5px] text-muted mb-[22px]">Prezentacja i one-pager z pełną ofertą Wayoo dla hoteli i obiektów noclegowych.</p>
                            <button className="bg-transparent border border-chrome text-foreground text-[14px] font-[500] px-6 h-12 rounded-lg inline-flex items-center hover:bg-gray-light transition-colors">
                                Pobierz PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
