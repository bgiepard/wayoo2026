import Link from "next/link";

const cards = [
    { icon: "✈️", title: "Transfery lotniskowe", desc: "Wygodny przejazd z lotniska lub na lotnisko dla całej grupy." },
    { icon: "🏨", title: "Pobyty hotelowe", desc: "Transport między miejscem noclegu a atrakcjami lub innymi punktami podróży." },
    { icon: "🎪", title: "Konferencje i eventy", desc: "Zbiorowy przejazd uczestników wydarzeń bez konieczności koordynacji wielu pojazdów." },
    { icon: "💼", title: "Wyjazdy firmowe", desc: "Sprawna organizacja transportu dla całych zespołów pracowników." },
];

const steps = [
    {
        num: 1,
        title: "Opisz planowaną podróż",
        desc: "Podaj miejsce wyjazdu, miejsce docelowe, datę i godzinę podróży oraz liczbę pasażerów. Dzięki temu możliwe jest dopasowanie transportu do potrzeb każdej podróży.",
    },
    {
        num: 2,
        title: "Otrzymaj propozycje przejazdu",
        desc: "Po przesłaniu zapytania przewoźnicy szybko przygotowują wycenę na podstawie trasy, terminu i liczby pasażerów. W krótkim czasie możesz otrzymać nawet kilka propozycji.",
    },
    {
        num: 3,
        title: "Zorganizuj transport dla swojej grupy",
        desc: "Oferty możesz porównać m.in. pod względem ceny, opinii innych użytkowników Wayoo oraz zdjęć pojazdów. Decyzję podejmujesz szybko i wygodnie.",
    },
];

const useCases = [
    {
        icon: "🏨",
        title: "Pobyt w hotelu lub pensjonacie",
        desc: "Coraz częściej goście podróżują w grupach – rodzinnych, turystycznych lub firmowych. Organizacja wspólnego transportu do miejsca noclegowego, na lotnisko lub do atrakcji w okolicy może być wtedy dużym ułatwieniem.",
    },
    {
        icon: "🗺️",
        title: "Wyjazdy turystyczne",
        desc: "Grupy turystyczne często potrzebują transportu pomiędzy miastami, atrakcjami turystycznymi lub miejscem noclegu. Wspólny przejazd pozwala wygodnie podróżować całej grupie.",
    },
    {
        icon: "🎪",
        title: "Wydarzenia i konferencje",
        desc: "Konferencje, wydarzenia sportowe czy imprezy okolicznościowe często wymagają transportu dla uczestników. Wspólny przejazd może znacznie uprościć logistykę takiego wyjazdu.",
    },
    {
        icon: "💼",
        title: "Wyjazdy firmowe",
        desc: "Firmy organizujące szkolenia, konferencje lub wyjazdy integracyjne często potrzebują transportu dla zespołów pracowników. Odpowiednio dopasowany przejazd pozwala sprawnie zorganizować podróż całej grupy.",
    },
];

const leftList = ["gości hotelowych", "grup turystycznych", "wydarzeń i konferencji", "wyjazdów firmowych"];
const rightList = ["wycieczek turystycznych", "pobytów hotelowych", "wydarzeń i konferencji", "wyjazdów firmowych", "podróży rodzinnych i prywatnych"];

function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="m-0 p-0 list-none">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-[10px] py-2 border-b border-[#e5e5e5] last:border-b-0 text-[14px] text-[#6a7282] leading-[1.6]">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#0B298F] shrink-0 mt-[7px]" />
                    {item}
                </li>
            ))}
        </ul>
    );
}

export default function TravelerPage() {
    return (
        <div>
            {/* HERO */}
            <div className="bg-[#1e2939] px-6 py-[72px] relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 65% 55% at 75% 55%, rgba(67,97,238,.16) 0%, transparent 70%)" }}
                />
                <div className="max-w-[1100px] mx-auto relative z-10">
                    <span className="inline-block text-[11px] font-[600] tracking-[.1em] uppercase text-white/40 mb-4">
                        Dla podróżujących
                    </span>
                    <h1 className="text-[clamp(26px,3.8vw,44px)] font-[600] text-white leading-[1.17] tracking-[-0.025em] mb-[18px] max-w-[660px]">
                        Wygodna organizacja transportu<br />
                        dla <em className="text-[#4361ee] not-italic">podróży grupowych</em>
                    </h1>
                    <p className="text-[16px] text-white/60 max-w-[540px] mb-8 leading-[1.72]">
                        Podróżujesz z rodziną albo w większej grupie? Wayoo pomaga w organizacji transportu dopasowanego do planu podróży. Wystarczy określić trasę, termin oraz liczbę pasażerów, aby zamówić przejazd idealny dla Was.
                    </p>

                    {/* Search bar — prowadzi do strony głównej */}
                    <div className="flex bg-white/7 border border-white/14 rounded-lg p-[5px] gap-[2px] max-w-[580px]">
                        <div className="flex-1 px-[13px] py-[9px] border-r border-white/10">
                            <div className="text-[10px] font-[700] tracking-[.06em] text-white/40 uppercase">Trasa</div>
                            <div className="text-[13px] text-white/70 mt-[2px]">Wybierz punkty trasy</div>
                        </div>
                        <div className="flex-1 px-[13px] py-[9px] border-r border-white/10">
                            <div className="text-[10px] font-[700] tracking-[.06em] text-white/40 uppercase">Termin</div>
                            <div className="text-[13px] text-white/70 mt-[2px]">Wybierz termin wyjazdu</div>
                        </div>
                        <div className="flex-1 px-[13px] py-[9px]">
                            <div className="text-[10px] font-[700] tracking-[.06em] text-white/40 uppercase">Pasażerowie</div>
                            <div className="text-[13px] text-white/70 mt-[2px]">1 os.</div>
                        </div>
                        <Link
                            href="/"
                            className="bg-[#0B298F] hover:bg-[#081D66] text-white text-[14px] font-[600] rounded-lg px-6 flex items-center whitespace-nowrap transition-colors"
                        >
                            Dalej →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Transport dopasowany */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <h2 className="text-[clamp(22px,3vw,32px)] font-[600] tracking-[-0.022em] text-[#1a1a1a] leading-[1.22] mb-3">
                        Transport dopasowany do planu podróży
                    </h2>
                    <p className="text-[16px] text-[#6b7280] max-w-[580px] mb-11 leading-[1.72]">
                        Podczas planowania wyjazdu często pojawia się pytanie o transport – szczególnie gdy podróż dotyczy większej grupy osób.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <p className="text-[14px] text-[#6a7282] leading-[1.72] mb-4">
                                Wayoo powstało, aby uprościć organizację takich przejazdów. Platforma umożliwia opisanie planowanej podróży w jednym miejscu i ułatwia znalezienie transportu dopasowanego do potrzeb grupy.
                            </p>
                            <p className="text-[14px] text-[#6a7282] leading-[1.72] mb-4">
                                Dzięki temu organizacja transportu może być prostsza zarówno dla podróżujących, jak i dla obiektów noclegowych, które chcą pomóc swoim gościom w zaplanowaniu przejazdu.
                            </p>
                            <p className="text-[13px] font-[600] text-[#1a1a1a] mb-[10px]">Dotyczy to m.in.:</p>
                            <BulletList items={["wyjazdów turystycznych", "pobytów w hotelach i pensjonatach", "wydarzeń i konferencji", "wyjazdów firmowych", "rodzinnych podróży"]} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {cards.map((card) => (
                                <div
                                    key={card.title}
                                    className="bg-white border border-[#e5e5e5] rounded-xl p-[26px] hover:shadow-[0_6px_28px_rgba(18,18,42,.07)] hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <div className="text-[22px] mb-[14px]">{card.icon}</div>
                                    <h3 className="text-[15.5px] font-[600] text-[#1a1a1a] mb-2">{card.title}</h3>
                                    <p className="text-[13.5px] text-[#6b7280] leading-[1.68]">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Jak to działa */}
            <div className="bg-[#f9fafb]">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <p className="text-[11px] font-[700] tracking-[.1em] uppercase text-[#0B298F] mb-[10px]">Jak to działa</p>
                    <h2 className="text-[clamp(22px,3vw,32px)] font-[600] tracking-[-0.022em] text-[#1a1a1a] leading-[1.22] mb-3">
                        Jak zamówić transport dla swojej grupy?
                    </h2>
                    <p className="text-[16px] text-[#6b7280] max-w-[580px] mb-11 leading-[1.72]">
                        Cały proces w jednym miejscu, bez zbędnych formalności.
                    </p>

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

            {/* Zastosowania */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <p className="text-[11px] font-[700] tracking-[.1em] uppercase text-[#0B298F] mb-[10px]">Transport dopasowany do każdej podróży</p>
                    <h2 className="text-[clamp(22px,3vw,32px)] font-[600] tracking-[-0.022em] text-[#1a1a1a] leading-[1.22] mb-3">
                        Wayoo pomaga w organizacji transportu w wielu sytuacjach
                    </h2>
                    <p className="text-[16px] text-[#6b7280] max-w-[580px] mb-11 leading-[1.72]">
                        Szczególnie wtedy, gdy podróż dotyczy kilku lub kilkunastu osób.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {useCases.map((uc) => (
                            <div key={uc.title} className="bg-[#f9fafb] rounded-xl p-[22px] flex gap-[14px] hover:bg-[#f3f4f6] transition-colors">
                                <div className="w-[42px] h-[42px] rounded-[10px] bg-white border border-[#e5e5e5] flex items-center justify-center text-[20px] shrink-0">
                                    {uc.icon}
                                </div>
                                <div>
                                    <h4 className="text-[14px] font-[600] text-[#1a1a1a] mb-[6px]">{uc.title}</h4>
                                    <p className="text-[13px] text-[#6b7280] leading-[1.65]">{uc.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dlaczego wcześniej */}
            <div className="bg-[#f9fafb]">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <p className="text-[11px] font-[700] tracking-[.1em] uppercase text-[#0B298F] mb-[10px]">Planowanie z wyprzedzeniem</p>
                    <h2 className="text-[clamp(22px,3vw,32px)] font-[600] tracking-[-0.022em] text-[#1a1a1a] leading-[1.22] mb-11">
                        Dlaczego warto zaplanować transport wcześniej
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                        <div>
                            <p className="text-[14px] text-[#6a7282] leading-[1.72] mb-4">
                                Zaplanowanie transportu z wyprzedzeniem pozwala lepiej dopasować przejazd do planu podróży oraz liczby uczestników.
                            </p>
                            <p className="text-[13px] font-[600] text-[#1a1a1a] mb-[10px]">Jest to szczególnie pomocne w przypadku:</p>
                            <BulletList items={leftList} />
                            <p className="text-[14px] text-[#6a7282] leading-[1.72] mt-4">
                                Dzięki temu podróż może przebiegać sprawniej i wygodniej dla wszystkich uczestników.
                            </p>
                        </div>
                        <div>
                            <p className="text-[13px] font-[600] text-[#1a1a1a] mb-[10px]">Transport grupowy najczęściej organizowany jest dla:</p>
                            <BulletList items={rightList} />
                            <p className="text-[14px] text-[#6a7282] leading-[1.72] mt-4">
                                W takich sytuacjach transport dopasowany do liczby pasażerów oraz planu podróży znacząco ułatwia organizację wyjazdu.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <div className="bg-[#0B298F] rounded-xl px-10 py-[50px] text-center">
                        <h2 className="text-[clamp(22px,3vw,32px)] font-[600] text-white leading-[1.22] tracking-[-0.022em]">
                            Z Wayoo organizacja transportu dla Twojej grupy staje się prostsza.
                        </h2>
                        <p className="text-white/70 max-w-[460px] mx-auto mt-[10px] mb-7 text-[15px]">
                            Wystarczy jedno zapytanie — resztą zajmują się przewoźnicy.
                        </p>
                        <Link
                            href="/"
                            className="bg-white text-[#0B298F] font-[700] px-6 rounded-lg inline-flex items-center h-12 hover:opacity-90 transition-opacity text-[14px]"
                        >
                            Zarezerwuj teraz →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
