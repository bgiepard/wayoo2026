import Link from "next/link";

function Eyebrow({ children }: { children: React.ReactNode }) {
    return <p className="text-[11px] font-[700] tracking-[.1em] uppercase text-[#0B298F] mb-[10px]">{children}</p>;
}

function H2({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-[clamp(22px,3vw,32px)] font-[600] tracking-[-0.022em] text-[#1a1a1a] leading-[1.22] mb-3">
            {children}
        </h2>
    );
}

function Lead({ children }: { children: React.ReactNode }) {
    return <p className="text-[16px] text-[#6b7280] max-w-[580px] mb-11 leading-[1.72]">{children}</p>;
}

function BulletList({ items, light }: { items: string[]; light?: boolean }) {
    return (
        <ul className="m-0 p-0 list-none">
            {items.map((item, i) => (
                <li
                    key={i}
                    className={`flex items-start gap-[10px] py-2 last:border-b-0 text-[14px] leading-[1.6] ${
                        light
                            ? "border-b border-white/6 text-white/75"
                            : "border-b border-[#e5e5e5] text-[#6a7282]"
                    }`}
                >
                    <span className={`w-[6px] h-[6px] rounded-full shrink-0 mt-[7px] ${light ? "bg-[#4361ee]" : "bg-[#0B298F]"}`} />
                    {item}
                </li>
            ))}
        </ul>
    );
}

const steps = [
    { num: 1, title: "Określasz trasę, termin i liczbę osób", desc: "Jedno zapytanie trafia do wszystkich dostępnych przewoźników w systemie." },
    { num: 2, title: "System przekazuje zapytanie do przewoźników", desc: "Dopasowani przewoźnicy przesyłają swoje propozycje przejazdu." },
    { num: 3, title: "Wybierasz odpowiednią ofertę i realizujesz przejazd", desc: "Porównujesz oferty i wybierasz najlepiej dopasowaną do Twoich potrzeb." },
];

const values = [
    { title: "Profesjonalizm", desc: "Współpraca z licencjonowanymi przewoźnikami. Każdy partner przechodzi przez proces weryfikacji przed dołączeniem do systemu." },
    { title: "Bezpieczeństwo", desc: "Uporządkowany proces i jasne zasady. Przejrzysty przebieg od złożenia zapytania do realizacji przejazdu." },
    { title: "Prostota", desc: "Minimalne zaangażowanie w organizację transportu. Jedno zapytanie trafia do wielu przewoźników jednocześnie." },
    { title: "Wygoda", desc: "Wszystko w jednym systemie — od złożenia zapytania, przez porównanie ofert, po potwierdzenie przejazdu." },
];

const forWhom = [
    "hoteli i obiektów noclegowych",
    "firm i klientów biznesowych",
    "organizatorów wydarzeń",
    "grup zorganizowanych",
];

export default function AboutPage() {
    return (
        <div>
            {/* HERO */}
            <div className="bg-[#1e2939] px-6 py-[72px] relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 65% 55% at 75% 55%, rgba(67,97,238,.16) 0%, transparent 70%)" }}
                />
                <div className="max-w-[1100px] mx-auto relative z-10">
                    <span className="inline-block text-[11px] font-[600] tracking-[.1em] uppercase text-white/40 mb-4">O nas</span>
                    <h1 className="text-[clamp(26px,3.8vw,44px)] font-[600] text-white leading-[1.17] tracking-[-0.025em] mb-[18px] max-w-[660px]">
                        Wayoo – system organizacji transportu grupowego<br />
                        i <em className="text-[#4361ee] not-italic">przewozów okazjonalnych</em>
                    </h1>
                    <p className="text-[16px] text-white/60 max-w-[540px] leading-[1.72]">
                        Tworzymy rozwiązanie, które upraszcza organizację transportu dla grup, łącząc zapotrzebowanie z profesjonalnymi przewoźnikami w jednym miejscu.
                    </p>
                </div>
            </div>

            {/* Czym jest Wayoo */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Czym jest Wayoo</Eyebrow>
                    <H2>Czym jest Wayoo i jak działa transport grupowy online?</H2>
                    <Lead>Wayoo to platforma wspierająca organizację transportu grupowego i przewozów okazjonalnych.</Lead>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <p className="text-[14px] text-[#6a7282] leading-[1.72] mb-[14px]">
                                Zamiast kontaktować się z wieloma firmami transportowymi — wystarczy jedno zapytanie. System dopasowuje je do dostępnych przewoźników, upraszczając cały proces.
                            </p>
                            <p className="text-[13px] font-[600] text-[#1a1a1a] mb-[10px]">Wayoo umożliwia:</p>
                            <BulletList items={["szybkie zamówienie transportu dla grup", "organizację przejazdów dla firm, hoteli i wydarzeń", "dostęp do sprawdzonych przewoźników"]} />
                        </div>
                        <div className="bg-white border border-[#e5e5e5] rounded-xl p-[26px] flex flex-col justify-center hover:shadow-[0_6px_28px_rgba(18,18,42,.07)] hover:-translate-y-0.5 transition-all duration-200">
                            <div className="text-[22px] mb-[14px]">🔄</div>
                            <h3 className="text-[15.5px] font-[600] text-[#1a1a1a] mb-2">Jedno zapytanie — wielu przewoźników</h3>
                            <p className="text-[13.5px] text-[#6b7280] leading-[1.68]">
                                Zamiast kontaktować się z wieloma firmami transportowymi — wystarczy jedno zapytanie. System dopasowuje je do dostępnych przewoźników i upraszcza cały proces organizacji.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Problem */}
            <div className="bg-[#f9fafb]">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Problem, który rozwiązujemy</Eyebrow>
                    <H2>Jak wygląda dziś organizacja transportu grupowego?</H2>
                    <Lead>W wielu przypadkach organizacja transportu dla grup nadal oznacza duże zaangażowanie i brak przejrzystości.</Lead>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Zły */}
                        <div className="bg-[#fff5f5] border border-[#fecaca] rounded-xl p-[26px]">
                            <p className="text-[11px] font-[700] tracking-[.07em] uppercase text-[#991b1b] mb-[14px]">Tradycyjny sposób</p>
                            {["szukanie przewoźników na własną rękę", "wiele telefonów i ustaleń", "brak uporządkowanego procesu"].map((item) => (
                                <div key={item} className="flex gap-[10px] items-start py-2 border-b border-black/6 last:border-b-0">
                                    <div className="w-5 h-5 rounded-full bg-[#fee2e2] text-[#991b1b] text-[9px] font-[800] flex items-center justify-center shrink-0 mt-[2px]">✕</div>
                                    <span className="text-[13.5px] text-[#6a7282] leading-[1.5]">{item}</span>
                                </div>
                            ))}
                        </div>
                        {/* Dobry */}
                        <div className="bg-[#1e2939] rounded-xl p-[26px]">
                            <p className="text-[11px] font-[700] tracking-[.07em] uppercase text-white/40 mb-[14px]">Wayoo eliminuje ten problem</p>
                            {["jedno zapytanie zamiast wielu telefonów", "organizacja transportu w jednym systemie", "przejrzysty proces od zapytania do przejazdu"].map((item) => (
                                <div key={item} className="flex gap-[10px] items-start py-2 border-b border-white/6 last:border-b-0">
                                    <div className="w-5 h-5 rounded-full bg-[#0B298F] text-white text-[9px] font-[800] flex items-center justify-center shrink-0 mt-[2px]">✓</div>
                                    <span className="text-[13.5px] text-white/75 leading-[1.5]">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Misja */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Misja</Eyebrow>
                    <H2>Nasza misja — uproszczenie transportu grupowego</H2>

                    <div className="border-2 border-[#0B298F] rounded-xl p-[34px] relative bg-white mt-6 max-w-[760px]">
                        <span className="absolute -top-[13px] left-6 bg-[#0B298F] text-white text-[10px] font-[800] tracking-[.09em] uppercase px-3 py-[3px] rounded-[20px]">
                            MISJA WAYOO
                        </span>
                        <p className="text-[16px] text-[#1a1a1a] leading-[1.78]">
                            Łączymy zapotrzebowanie na przewozy grupowe z profesjonalnymi firmami transportowymi.
                        </p>
                        <p className="text-[14px] text-[#6a7282] mt-3">Zamówienie transportu dla grup staje się szybkie i wygodne.</p>
                        <p className="text-[13px] font-[600] text-[#1a1a1a] mt-4 mb-2">Zapewniamy:</p>
                        <BulletList items={["bezpieczeństwo realizacji", "jasne zasady", "prosty proces organizacji przejazdu"]} />
                    </div>
                </div>
            </div>

            {/* Jak działa system */}
            <div className="bg-[#f9fafb]">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Jak działa system</Eyebrow>
                    <H2>Jak zamówić transport grupowy przez Wayoo?</H2>
                    <Lead>Cały proces w jednym miejscu, bez zbędnych formalności.</Lead>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 relative mt-1">
                        <div className="hidden sm:block absolute top-[22px] h-px bg-[#e5e5e5]" style={{ left: "calc(16.5% + 22px)", right: "calc(16.5% + 22px)" }} />
                        {steps.map((step) => (
                            <div key={step.num} className="px-6 text-center">
                                <div className="w-11 h-11 rounded-full bg-[#0B298F] text-white text-[16px] font-[700] flex items-center justify-center mx-auto mb-[18px] relative z-10">
                                    {step.num}
                                </div>
                                <h3 className="text-[15px] font-[600] text-[#1a1a1a] mb-2">{step.title}</h3>
                                <p className="text-[13.5px] text-[#6b7280] leading-[1.65]">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Wartości */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Standard Wayoo</Eyebrow>
                    <H2>Standard Wayoo</H2>
                    <Lead>To fundament działania Wayoo.</Lead>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {values.map((v) => (
                            <div key={v.title} className="bg-white border border-[#e5e5e5] border-t-[3px] border-t-[#0B298F] rounded-xl p-6">
                                <h4 className="text-[15px] font-[600] text-[#1a1a1a] mb-[7px]">{v.title}</h4>
                                <p className="text-[13.5px] text-[#6b7280] leading-[1.68]">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dla kogo */}
            <div className="bg-[#f9fafb]">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Dla kogo jest Wayoo</Eyebrow>
                    <H2>Dla kogo jest Wayoo?</H2>
                    <Lead>Wayoo wspiera organizację transportu wszędzie tam, gdzie potrzebny jest transport dla większej liczby osób.</Lead>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                        {forWhom.map((item) => (
                            <div key={item} className="bg-[#f9fafb] rounded-lg px-[18px] py-[14px] flex items-center gap-3 hover:bg-[#f3f4f6] transition-colors">
                                <div className="w-2 h-2 rounded-full bg-[#0B298F] shrink-0" />
                                <span className="text-[14px] font-[500] text-[#1a1a1a]">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Kierunek rozwoju */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Nasz kierunek rozwoju</Eyebrow>
                    <H2>Nasz kierunek rozwoju</H2>
                    <Lead>Budujemy ogólnopolski system transportu grupowego.</Lead>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <p className="text-[14px] text-[#6a7282] leading-[1.72] mb-[14px]">Budujemy ogólnopolski system transportu grupowego, który:</p>
                            <BulletList items={["porządkuje rynek przewozów okazjonalnych", "zwiększa dostępność usług transportowych", "tworzy nowy standard współpracy"]} />
                        </div>
                        <div>
                            <p className="text-[14px] font-[600] text-[#1a1a1a] leading-[1.72] mb-[14px]">Kierunek zmian w branży transportowej</p>
                            <p className="text-[14px] text-[#6a7282] leading-[1.72] mb-[14px]">W branży transportowej rośnie znaczenie:</p>
                            <BulletList items={["transparentności", "standaryzacji usług", "standardów ESG"]} />
                            <p className="text-[14px] text-[#6a7282] leading-[1.72] mt-4">
                                Wayoo wspiera przewoźników w dostosowaniu się do tych zmian i budowaniu nowoczesnej działalności.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="bg-[#f9fafb]">
                <div className="max-w-[1100px] mx-auto px-6 py-[80px] text-center">
                    <p className="text-[14px] text-[#6b7280] mb-[10px] font-[600] uppercase tracking-[.08em]">Wayoo — nowoczesny transport grupowy</p>
                    <h2 className="text-[clamp(26px,4vw,44px)] font-[700] tracking-[-0.03em] text-[#1a1a1a] leading-[1.18] mb-[14px]">
                        Tworzymy system, który<br />upraszcza organizację<br />
                        <em className="text-[#0B298F] not-italic">przewozów grupowych.</em>
                    </h2>
                    <p className="text-[16px] text-[#6b7280] mb-8">Wayoo. I transport staje się prosty.</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        <Link href="/" className="bg-[#0B298F] hover:bg-[#081D66] text-white text-[14px] font-[600] px-6 h-12 rounded-lg inline-flex items-center transition-colors">
                            Zarezerwuj transport →
                        </Link>
                        <Link href="/for-hotels" className="bg-transparent border border-[#e5e5e5] text-[#1a1a1a] text-[14px] font-[500] px-6 h-12 rounded-lg inline-flex items-center hover:bg-[#f3f4f6] transition-colors">
                            Oferta dla hoteli
                        </Link>
                        <Link href="/become-driver" className="bg-transparent border border-[#e5e5e5] text-[#1a1a1a] text-[14px] font-[500] px-6 h-12 rounded-lg inline-flex items-center hover:bg-[#f3f4f6] transition-colors">
                            Współpraca z Wayoo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
