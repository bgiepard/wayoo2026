import { useState } from "react";

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

const steps = [
    { num: 1, title: "Klient składa zapytanie", desc: "Klient podaje trasę, termin i liczbę osób. Zapytanie trafia do systemu Wayoo." },
    { num: 2, title: "Otrzymujesz dopasowane zlecenia", desc: "Przeglądasz zapytania dopasowane do Twojej działalności i przesyłasz swoją ofertę przez panel." },
    { num: 3, title: "Wybierasz, realizujesz i rozwijasz bazę klientów", desc: "Akceptujesz zlecenie, realizujesz przejazd i budujesz swoją reputację w systemie Wayoo." },
];

const benefits = [
    { icon: "📩", title: "Dostęp do zapytań od klientów", desc: "Otrzymujesz realne zapytania dopasowane do Twojej działalności, bez konieczności samodzielnego pozyskiwania klientów." },
    { icon: "💰", title: "Brak stałych kosztów", desc: "Nie płacisz abonamentu. Rozliczenie tylko za zrealizowane przewozy — opłata serwisowa pobierana jest wyłącznie od wykonanych usług." },
    { icon: "⚙️", title: "Panel przewoźnika", desc: "Zarządzasz zapytaniami, historią zleceń i danymi firmy w jednym miejscu." },
    { icon: "🎯", title: "Lepsze wykorzystanie floty", desc: "Zwiększasz liczbę realizacji i ograniczasz puste przebiegi." },
    { icon: "🛡️", title: "Bezpieczne i uporządkowane środowisko", desc: "Działasz w systemie opartym o jasne zasady i standardy współpracy." },
    { icon: "🌱", title: "Gotowość na zmiany w branży", desc: "W branży transportowej coraz większe znaczenie mają standardy ESG, transparentność i uporządkowane procesy. Wayoo wspiera przewoźników w dostosowaniu się do tych zmian." },
];

const requirements = [
    "prowadzą zarejestrowaną działalność",
    "posiadają licencję na przewóz osób",
];

const pills = [
    "sam decydujesz, które zlecenia realizujesz",
    "sam ustalasz ceny i warunki",
    "brak opłat stałych",
    "opłata serwisowa tylko od wykonanych usług",
];

export default function BecomeDriverPage() {
    const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", area: "", hasLicense: false });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div>
            {/* HERO */}
            <div className="bg-dark px-6 py-[72px] text-center relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 65% 55% at 75% 55%, rgba(67,97,238,.16) 0%, transparent 70%)" }}
                />
                <div className="max-w-[1100px] mx-auto relative z-10">
                    <span className="inline-block text-[11px] font-[600] tracking-[.1em] uppercase text-white/40 mb-4">
                        Dla przewoźników
                    </span>
                    <h1 className="text-[clamp(26px,3.8vw,44px)] font-[600] text-white leading-[1.17] tracking-[-0.025em] mb-[18px] mx-auto">
                        Dołącz do systemu Wayoo<br />
                        i realizuj <em className="text-blue-alt not-italic">więcej zleceń transportowych</em>
                    </h1>
                    <p className="text-[16px] text-white/60 max-w-[600px] mx-auto mb-8 leading-[1.72]">
                        Łączymy profesjonalnych przewoźników z klientami szukającymi grupowego transportu okazjonalnego w oparciu o bezpieczeństwo, jakość i jasne zasady.
                    </p>
                    <a
                        href="#rejestracja"
                        className="bg-navy hover:bg-navy-dark text-white text-[15px] font-[600] px-7 h-[50px] rounded-lg inline-flex items-center transition-colors"
                    >
                        Zgłoś swoją firmę →
                    </a>
                </div>
            </div>

            {/* Jak działa */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Jak to działa</Eyebrow>
                    <H2>Jak działa Wayoo?</H2>
                    <Lead>Trzy kroki od rejestracji do pierwszego zlecenia.</Lead>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 relative mt-1">
                        <div className="hidden sm:block absolute top-[22px] h-px bg-chrome" style={{ left: "calc(16.5% + 22px)", right: "calc(16.5% + 22px)" }} />
                        {steps.map((step) => (
                            <div key={step.num} className="px-6 text-center">
                                <div className="w-11 h-11 rounded-full bg-navy text-white text-[16px] font-[700] flex items-center justify-center mx-auto mb-[18px] relative z-10">
                                    {step.num}
                                </div>
                                <h3 className="text-[15px] font-[600] text-foreground mb-2">{step.title}</h3>
                                <p className="text-[13.5px] text-muted leading-[1.65]">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dlaczego warto */}
            <div className="bg-faint">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Dlaczego warto</Eyebrow>
                    <H2>Dlaczego warto?</H2>
                    <Lead>Dołącz do systemu Wayoo i skorzystaj z realnych zleceń bez stałych kosztów.</Lead>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {benefits.map((b) => (
                            <div key={b.title} className="bg-white border border-chrome rounded-xl p-[26px] hover:shadow-[0_6px_28px_rgba(18,18,42,.07)] hover:-translate-y-0.5 transition-all duration-200">
                                <div className="text-[22px] mb-[14px]">{b.icon}</div>
                                <h3 className="text-[15.5px] font-[600] text-foreground mb-2">{b.title}</h3>
                                <p className="text-[13.5px] text-muted leading-[1.68]">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Standard i bezpieczeństwo */}
            <div className="bg-white">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Standard i bezpieczeństwo</Eyebrow>
                    <H2>Współpracujemy wyłącznie z profesjonalnymi firmami</H2>
                    <Lead>Dbamy o bezpieczeństwo klientów, przewoźników i przebieg realizacji.</Lead>

                    <p className="text-[14px] text-muted mb-4">Do systemu przyjmujemy tylko przewoźników, którzy:</p>

                    <div className="bg-faint rounded-xl p-6 max-w-[560px]">
                        {requirements.map((req, i) => (
                            <div key={req} className={`flex gap-3 items-center py-[10px] ${i < requirements.length - 1 ? "border-b border-chrome" : ""}`}>
                                <div className="w-[22px] h-[22px] rounded-full bg-emerald-light flex items-center justify-center shrink-0">
                                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                                        <path d="M2 6l3 3 5-5" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-[14px] text-foreground">{req}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Jasne zasady */}
            <div className="bg-faint">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Jasne zasady</Eyebrow>
                    <H2>Przejrzyste warunki współpracy</H2>

                    <div className="flex flex-wrap gap-[10px] mt-6">
                        {pills.map((pill) => (
                            <div key={pill} className="flex items-center gap-2 bg-white border border-chrome rounded-lg px-4 py-[10px]">
                                <div className="w-[7px] h-[7px] rounded-full bg-navy shrink-0" />
                                <span className="text-[13.5px] text-foreground">{pill}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Formularz */}
            <div className="bg-white" id="rejestracja">
                <div className="max-w-[1100px] mx-auto px-6 py-[72px]">
                    <Eyebrow>Rejestracja</Eyebrow>
                    <H2>Zgłoś swoją firmę</H2>
                    <Lead>Wypełnij formularz — skontaktujemy się i przedstawimy szczegóły współpracy.</Lead>

                    {sent ? (
                        <div className="bg-emerald-light border border-[#6ee7b7] rounded-xl p-8 text-center max-w-[560px]">
                            <p className="text-[16px] font-[600] text-[#065f46]">Zgłoszenie wysłane!</p>
                            <p className="text-[14px] text-[#065f46]/70 mt-2">Skontaktujemy się z Tobą wkrótce.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white border border-chrome rounded-xl p-8 max-w-[560px]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: "Imię i nazwisko", key: "name", type: "text", placeholder: "Jan Kowalski" },
                                    { label: "Nazwa firmy", key: "company", type: "text", placeholder: "Transport Kowalski Sp. z o.o." },
                                    { label: "Telefon", key: "phone", type: "tel", placeholder: "+48 500 000 000" },
                                    { label: "E-mail", key: "email", type: "email", placeholder: "jan@firma.pl" },
                                ].map((field) => (
                                    <div key={field.key} className="flex flex-col gap-[6px]">
                                        <label className="text-[12px] font-[600] text-muted">{field.label}</label>
                                        <input
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            value={form[field.key as keyof typeof form] as string}
                                            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                                            className="bg-faint border border-chrome rounded-lg px-[14px] py-[11px] text-[14px] text-foreground outline-none focus:border-navy focus:shadow-[0_0_0_3px_rgba(11,41,143,.11)] transition-all"
                                        />
                                    </div>
                                ))}
                                <div className="flex flex-col gap-[6px] sm:col-span-2">
                                    <label className="text-[12px] font-[600] text-muted">Obszar działania</label>
                                    <input
                                        type="text"
                                        placeholder="np. Mazowieckie, Małopolskie, cała Polska..."
                                        value={form.area}
                                        onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                                        className="bg-faint border border-chrome rounded-lg px-[14px] py-[11px] text-[14px] text-foreground outline-none focus:border-navy focus:shadow-[0_0_0_3px_rgba(11,41,143,.11)] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-[10px] mt-4">
                                <input
                                    type="checkbox"
                                    id="hasLicense"
                                    checked={form.hasLicense}
                                    onChange={(e) => setForm((f) => ({ ...f, hasLicense: e.target.checked }))}
                                    className="w-[17px] h-[17px] accent-[#0B298F] mt-[2px] shrink-0 cursor-pointer"
                                />
                                <label htmlFor="hasLicense" className="text-[13px] text-muted leading-[1.5] cursor-pointer">
                                    Posiadam działalność i licencję na przewóz osób
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-navy hover:bg-navy-dark text-white text-[14px] font-[600] h-12 rounded-lg flex items-center justify-center mt-5 transition-colors"
                            >
                                Wyślij zgłoszenie →
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
