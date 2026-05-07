import React, { useState, useEffect } from 'react';
import {
  AddIcon, BellIcon, ChildIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon,
  CloseIcon, DotsCircleIcon, GoogleIcon, LocateIcon, LocationMarkerIcon, MapIcon,
  PassengersIcon, PlusIcon, RemoveRouteStopIcon, RouteEndIcon, RouteIcon,
  RouteStartIcon, RouteStopIcon, DatesIcon, WhyIcon1, WhyIcon2, WhyIcon3, WhyIcon4,
  LinkedInIcon, FacebookIcon, YouTubeIcon, InstagramIcon, MapPinIcon, PhoneIcon,
  MailIcon, DraftOriginIcon, DraftWaypointIcon, DraftDestinationIcon, DraftCalendarIcon,
  DraftClockIcon, DraftUsersIcon, DraftChildSeatIcon, DraftEditIcon,
  DraftCheckBadgeIcon, DraftCheckIcon,
} from '@/components/icons';

const NAVY = '#0B298F';

const NAV_SECTIONS = [
  { id: 'colors',     label: 'Kolory',            num: '01' },
  { id: 'typography', label: 'Typografia',         num: '02' },
  { id: 'buttons',    label: 'Przyciski',          num: '03' },
  { id: 'forms',      label: 'Formularze',         num: '04' },
  { id: 'icons',      label: 'Ikony',              num: '05' },
  { id: 'cards',      label: 'Karty i odznaki',    num: '06' },
  { id: 'spacing',    label: 'Odstępy i cienie',   num: '07' },
];

function Token({ code }: { code: string }) {
  return (
    <code style={{ fontFamily: 'ui-monospace, "Cascadia Code", monospace' }}
      className="text-[11px] bg-accent-glow text-accent border border-badge-info-border px-2 py-0.5 rounded-md whitespace-nowrap">
      {code}
    </code>
  );
}

function SectionHeading({ id, num, title, desc }: { id: string; num: string; title: string; desc?: string }) {
  return (
    <div id={id} className="scroll-mt-8 mb-8 flex items-start gap-4">
      <span style={{ fontFamily: 'ui-monospace, monospace', color: NAVY }}
        className="text-xs font-bold opacity-30 mt-1 select-none">{num}</span>
      <div className="flex-1 border-b border-chrome pb-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {desc && <p className="text-sm text-muted mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

function Preview({ children, gray = false }: { children: React.ReactNode; gray?: boolean }) {
  return (
    <div className={`rounded-xl border border-chrome p-6 ${gray ? 'bg-disabled' : 'bg-white'}`}>
      {children}
    </div>
  );
}

function SubLabel({ text }: { text: string }) {
  return (
    <div style={{ fontFamily: 'ui-monospace, monospace' }}
      className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-2.5">
      {text}
    </div>
  );
}

function Swatch({ bg, name, variable, hex }: { bg: string; name: string; variable?: string; hex: string }) {
  return (
    <div>
      <div className="h-14 w-full rounded-xl border border-chrome mb-2.5" style={{ background: bg }} />
      <div className="text-sm font-medium text-foreground leading-tight">{name}</div>
      {variable && (
        <div style={{ fontFamily: 'ui-monospace, monospace' }} className="text-[11px] text-accent mt-0.5">
          {variable}
        </div>
      )}
      <div style={{ fontFamily: 'ui-monospace, monospace' }} className="text-[11px] text-muted">
        {hex}
      </div>
    </div>
  );
}

type IconEntry = { Icon: React.ComponentType<{ className?: string }>; name: string };

const ICONS: IconEntry[] = [
  { Icon: AddIcon,              name: 'AddIcon' },
  { Icon: BellIcon,             name: 'BellIcon' },
  { Icon: ChildIcon,            name: 'ChildIcon' },
  { Icon: ChevronDownIcon,      name: 'ChevronDownIcon' },
  { Icon: ChevronLeftIcon,      name: 'ChevronLeftIcon' },
  { Icon: ChevronRightIcon,     name: 'ChevronRightIcon' },
  { Icon: CloseIcon,            name: 'CloseIcon' },
  { Icon: DotsCircleIcon,       name: 'DotsCircleIcon' },
  { Icon: GoogleIcon,           name: 'GoogleIcon' },
  { Icon: LocateIcon,           name: 'LocateIcon' },
  { Icon: LocationMarkerIcon,   name: 'LocationMarkerIcon' },
  { Icon: MapIcon,              name: 'MapIcon' },
  { Icon: PassengersIcon,       name: 'PassengersIcon' },
  { Icon: PlusIcon,             name: 'PlusIcon' },
  { Icon: RemoveRouteStopIcon,  name: 'RemoveRouteStopIcon' },
  { Icon: RouteEndIcon,         name: 'RouteEndIcon' },
  { Icon: RouteIcon,            name: 'RouteIcon' },
  { Icon: RouteStartIcon,       name: 'RouteStartIcon' },
  { Icon: RouteStopIcon,        name: 'RouteStopIcon' },
  { Icon: DatesIcon,            name: 'DatesIcon' },
  { Icon: WhyIcon1,             name: 'WhyIcon1' },
  { Icon: WhyIcon2,             name: 'WhyIcon2' },
  { Icon: WhyIcon3,             name: 'WhyIcon3' },
  { Icon: WhyIcon4,             name: 'WhyIcon4' },
  { Icon: LinkedInIcon,         name: 'LinkedInIcon' },
  { Icon: FacebookIcon,         name: 'FacebookIcon' },
  { Icon: YouTubeIcon,          name: 'YouTubeIcon' },
  { Icon: InstagramIcon,        name: 'InstagramIcon' },
  { Icon: MapPinIcon,           name: 'MapPinIcon' },
  { Icon: PhoneIcon,            name: 'PhoneIcon' },
  { Icon: MailIcon,             name: 'MailIcon' },
  { Icon: DraftOriginIcon,      name: 'DraftOriginIcon' },
  { Icon: DraftWaypointIcon,    name: 'DraftWaypointIcon' },
  { Icon: DraftDestinationIcon, name: 'DraftDestinationIcon' },
  { Icon: DraftCalendarIcon,    name: 'DraftCalendarIcon' },
  { Icon: DraftClockIcon,       name: 'DraftClockIcon' },
  { Icon: DraftUsersIcon,       name: 'DraftUsersIcon' },
  { Icon: DraftChildSeatIcon,   name: 'DraftChildSeatIcon' },
  { Icon: DraftEditIcon,        name: 'DraftEditIcon' },
  { Icon: DraftCheckBadgeIcon,  name: 'DraftCheckBadgeIcon' },
  { Icon: DraftCheckIcon,       name: 'DraftCheckIcon' },
];

export default function DesignSystemPage() {
  const [active, setActive] = useState('colors');

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-15% 0px -75% 0px' },
    );
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif', minHeight: '100vh' }}>

      {/* Internal-only banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 text-center py-1.5">
        <span className="text-[11px] font-medium text-amber-700 tracking-wide">
          ⚠ Tylko do użytku wewnętrznego — nie linkować produkcyjnie
        </span>
      </div>

      <div className="flex pt-[33px]">

        {/* ── Sidebar ───────────────────────────────── */}
        <aside
          className="w-56 flex-shrink-0 fixed left-0 top-[33px] bottom-0 overflow-y-auto z-40 flex flex-col"
          style={{ backgroundColor: NAVY }}
        >
          {/* Logo area */}
          <div className="px-6 pt-7 pb-5">
            <div className="flex items-baseline gap-2">
              <span className="text-white font-bold text-xl tracking-tight">WAYOO</span>
              <span style={{ fontFamily: 'ui-monospace, monospace' }}
                className="text-[10px] font-semibold text-white/30 uppercase tracking-widest leading-none">
                DS
              </span>
            </div>
            <div className="text-white/40 text-[11px] mt-1">Design System · v1.0</div>
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-white/10 mb-4" />

          {/* Nav */}
          <nav className="flex-1 px-3 pb-8">
            {NAV_SECTIONS.map(({ id, label, num }) => {
              const isActive = active === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setActive(id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all ${
                    isActive
                      ? 'bg-white/15 text-white font-medium'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/8'
                  }`}
                >
                  <span style={{ fontFamily: 'ui-monospace, monospace' }}
                    className={`text-[10px] font-bold tabular-nums transition-opacity ${isActive ? 'opacity-100 text-accent' : 'opacity-40'}`}>
                    {num}
                  </span>
                  {label}
                </a>
              );
            })}
          </nav>

          {/* Bottom accent */}
          <div className="px-6 pb-6">
            <div className="text-white/20 text-[10px]">
              wayoo2026 · pasażer
            </div>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────── */}
        <main className="flex-1 ml-56 px-14 py-12 max-w-[860px]">

          {/* Page title */}
          <div className="mb-14">
            <h1 className="text-[2.25rem] font-bold text-foreground tracking-tight leading-tight">
              Design System
            </h1>
            <p className="text-muted mt-2 text-base">
              Źródło prawdy o wizualnym języku aplikacji Wayoo dla pasażerów.
            </p>
          </div>

          {/* ── 01 COLORS ──── */}
          <section className="mb-16">
            <SectionHeading id="colors" num="01" title="Kolory"
              desc="CSS custom properties zdefiniowane w globals.css" />
            <div className="grid grid-cols-4 gap-5 mb-6">
              <Swatch bg="var(--background)"  name="Background"    variable="var(--background)"    hex="#FCFDFD" />
              <Swatch bg="var(--foreground)"  name="Foreground"    variable="var(--foreground)"    hex="#1a1a1a" />
              <Swatch bg="var(--muted)"       name="Muted"         variable="var(--muted)"         hex="#6b7280" />
              <Swatch bg="var(--border)"      name="Border"        variable="var(--border)"        hex="#e5e5e5" />
              <Swatch bg="var(--accent)"      name="Accent"        variable="var(--accent)"        hex="#2563eb" />
              <Swatch bg="var(--accent-light)" name="Accent Light" variable="var(--accent-light)"  hex="#eff6ff" />
              <Swatch bg={NAVY}               name="Header Navy"   variable="—"                    hex="#0B298F" />
            </div>
            <div className="rounded-xl border border-badge-info-border bg-accent-glow p-4">
              <div style={{ fontFamily: 'ui-monospace, monospace' }} className="text-[11px] text-accent space-y-1">
                <div>{`/* Użycie jako inline style: */`}</div>
                <div>{`style={{ backgroundColor: 'var(--accent)' }}`}</div>
                <div className="mt-2">{`/* Użycie jako wartość Tailwind (Tailwind 4): */`}</div>
                <div>{`className="bg-accent text-navy"`}</div>
              </div>
            </div>
          </section>

          {/* ── 02 TYPOGRAPHY ── */}
          <section className="mb-16">
            <SectionHeading id="typography" num="02" title="Typografia"
              desc="Font: DM Sans · załadowany przez next/font/google w _app.tsx" />
            <div className="space-y-0">
              {([
                { el: 'h1', size: '2rem',    weight: 700, label: 'Nagłówek H1', tw: 'text-[2rem] font-bold' },
                { el: 'h2', size: '1.5rem',  weight: 600, label: 'Nagłówek H2', tw: 'text-2xl font-semibold' },
                { el: 'h3', size: '1.25rem', weight: 600, label: 'Nagłówek H3', tw: 'text-xl font-semibold' },
                { el: 'h4', size: '1rem',    weight: 600, label: 'Nagłówek H4', tw: 'text-base font-semibold' },
              ] as const).map(({ size, weight, label, tw }) => (
                <div key={label} className="flex items-center justify-between py-4 border-b border-surface">
                  <span style={{ fontSize: size, fontWeight: weight, color: '#1a1a1a', lineHeight: 1.3 }}>
                    {label}
                  </span>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-6">
                    <Token code={tw} />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between py-4 border-b border-surface">
                <p style={{ fontSize: '1rem', fontWeight: 400, color: '#1a1a1a', lineHeight: 1.6 }}>
                  Tekst akapitu — pasażer wybiera ofertę i płaci online.
                </p>
                <div className="flex-shrink-0 ml-6"><Token code="text-base text-[--foreground]" /></div>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-surface">
                <p style={{ fontSize: '1rem', fontWeight: 400, color: '#6b7280', lineHeight: 1.6 }}>
                  Tekst pomocniczy (muted) — podpis, opis dodatkowy.
                </p>
                <div className="flex-shrink-0 ml-6"><Token code="text-base text-[--muted]" /></div>
              </div>
              <div className="flex items-center justify-between py-4">
                <p style={{ fontSize: '0.75rem', fontWeight: 400, color: '#6b7280' }}>
                  Caption / metadane · 15 maja 2026 · #REQ-0042
                </p>
                <div className="flex-shrink-0 ml-6"><Token code="text-xs text-[--muted]" /></div>
              </div>
            </div>
          </section>

          {/* ── 03 BUTTONS ── */}
          <section className="mb-16">
            <SectionHeading id="buttons" num="03" title="Przyciski"
              desc="4 warianty × stany: default, hover, disabled, loading" />

            <div className="space-y-7">
              <div>
                <SubLabel text="Warianty — domyślne" />
                <Preview gray>
                  <div className="flex flex-wrap items-center gap-3">
                    <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[.98]"
                      style={{ backgroundColor: 'var(--accent)' }}>
                      Zarezerwuj
                    </button>
                    <button className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-gray-hover active:scale-[.98] bg-white"
                      style={{ border: '1.5px solid var(--border)', color: 'var(--foreground)' }}>
                      Anuluj
                    </button>
                    <button className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-accent-glow active:scale-[.98]"
                      style={{ color: 'var(--accent)' }}>
                      Szczegóły →
                    </button>
                    <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[.98] bg-red-600">
                      Usuń zlecenie
                    </button>
                  </div>
                </Preview>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Token code="Primary: bg-accent text-white rounded-xl" />
                  <Token code="Secondary: border-[--border] bg-white" />
                  <Token code="Ghost: text-[--accent] (no border/bg)" />
                  <Token code="Danger: bg-red-600 text-white" />
                </div>
              </div>

              <div>
                <SubLabel text="Stan disabled" />
                <Preview gray>
                  <div className="flex flex-wrap items-center gap-3">
                    <button disabled className="px-5 py-2.5 rounded-xl text-sm font-medium text-white opacity-40 cursor-not-allowed"
                      style={{ backgroundColor: 'var(--accent)' }}>
                      Zarezerwuj
                    </button>
                    <button disabled className="px-5 py-2.5 rounded-xl text-sm font-medium opacity-40 cursor-not-allowed bg-white"
                      style={{ border: '1.5px solid var(--border)', color: 'var(--foreground)' }}>
                      Anuluj
                    </button>
                  </div>
                </Preview>
                <Token code="disabled: opacity-40 cursor-not-allowed" />
              </div>

              <div>
                <SubLabel text="Stan loading" />
                <Preview gray>
                  <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 cursor-wait"
                    style={{ backgroundColor: 'var(--accent)' }}>
                    <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Ładowanie…
                  </button>
                </Preview>
                <Token code="animate-spin w-4 h-4 opacity-25/75 (spinner pattern)" />
              </div>

              <div>
                <SubLabel text="Z ikoną" />
                <Preview gray>
                  <div className="flex flex-wrap gap-3 items-center">
                    <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-all hover:opacity-90"
                      style={{ backgroundColor: 'var(--accent)' }}>
                      <PlusIcon className="w-4 h-4" />
                      Dodaj zlecenie
                    </button>
                    <button className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:bg-gray-hover bg-white"
                      style={{ border: '1.5px solid var(--border)', color: 'var(--foreground)' }}>
                      <BellIcon className="w-4 h-4" />
                      Powiadomienia
                    </button>
                  </div>
                </Preview>
                <Token code="flex items-center gap-2 + <Icon className='w-4 h-4' />" />
              </div>
            </div>
          </section>

          {/* ── 04 FORMS ── */}
          <section className="mb-16">
            <SectionHeading id="forms" num="04" title="Formularze"
              desc="Input, select — stany: default, focus, error, disabled" />
            <div className="grid grid-cols-2 gap-6">

              {/* Default */}
              <div>
                <SubLabel text="Default" />
                <label className="block text-sm font-medium text-foreground mb-1.5">Skąd jedziesz?</label>
                <div className="relative">
                  <LocationMarkerIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input type="text" placeholder="Wpisz miasto lub adres" readOnly
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white"
                    style={{ border: '1.5px solid var(--border)', outline: 'none', color: 'var(--foreground)' }} />
                </div>
                <div className="mt-2"><Token code="border-[--border] rounded-xl pl-10 py-3" /></div>
              </div>

              {/* Focus */}
              <div>
                <SubLabel text="Focus" />
                <label className="block text-sm font-medium text-foreground mb-1.5">Dokąd jedziesz?</label>
                <div className="relative">
                  <LocationMarkerIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-accent" />
                  <input type="text" defaultValue="Kraków, ul. Floriańska 1" readOnly
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white"
                    style={{
                      border: '1.5px solid var(--accent)', outline: 'none',
                      color: 'var(--foreground)', boxShadow: '0 0 0 3px #eff6ff',
                    }} />
                </div>
                <div className="mt-2"><Token code="border-[--accent] shadow-[0_0_0_3px_var(--accent-light)]" /></div>
              </div>

              {/* Error */}
              <div>
                <SubLabel text="Error" />
                <label className="block text-sm font-medium text-foreground mb-1.5">Liczba pasażerów</label>
                <input type="text" defaultValue="15" readOnly
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white"
                  style={{
                    border: '1.5px solid #dc2626', outline: 'none',
                    color: 'var(--foreground)', boxShadow: '0 0 0 3px #fee2e2',
                  }} />
                <p className="text-xs text-red-600 mt-1.5">Maksymalna liczba pasażerów to 8.</p>
                <div className="mt-1.5"><Token code="border-red-500 shadow-[0_0_0_3px_#fee2e2]" /></div>
              </div>

              {/* Disabled */}
              <div>
                <SubLabel text="Disabled" />
                <label className="block text-sm font-medium text-muted mb-1.5">Status zlecenia</label>
                <input type="text" defaultValue="Opublikowane" disabled
                  className="w-full px-4 py-3 rounded-xl text-sm bg-disabled cursor-not-allowed opacity-60"
                  style={{ border: '1.5px solid var(--border)', outline: 'none', color: 'var(--muted)' }} />
                <div className="mt-2"><Token code="bg-disabled opacity-60 cursor-not-allowed" /></div>
              </div>

              {/* Select */}
              <div className="col-span-2">
                <SubLabel text="Select" />
                <label className="block text-sm font-medium text-foreground mb-1.5">Typ pojazdu</label>
                <div className="relative">
                  <select className="w-full appearance-none px-4 py-3 rounded-xl text-sm bg-white pr-10"
                    style={{ border: '1.5px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}>
                    <option>Sedan (do 4 osób)</option>
                    <option>Van (do 8 osób)</option>
                    <option>Minibus (do 16 osób)</option>
                  </select>
                  <ChevronDownIcon className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
                <div className="mt-2"><Token code="appearance-none pr-10 + ChevronDownIcon absolute right-3.5" /></div>
              </div>
            </div>
          </section>

          {/* ── 05 ICONS ── */}
          <section className="mb-16">
            <SectionHeading id="icons" num="05" title="Ikony"
              desc={`${ICONS.length} ikon SVG · import z '@/components/icons' · prop: className`} />
            <div className="grid grid-cols-8 gap-1 mb-5">
              {ICONS.map(({ Icon, name }) => (
                <div key={name}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-accent-glow transition-colors group cursor-default">
                  <div className="w-8 h-8 flex items-center justify-center text-foreground group-hover:text-accent transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span style={{ fontFamily: 'ui-monospace, monospace' }}
                    className="text-[9px] text-muted text-center leading-tight break-all">
                    {name}
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-chrome bg-disabled p-4">
              <div style={{ fontFamily: 'ui-monospace, monospace' }} className="text-[11px] text-muted space-y-1">
                <div className="text-foreground font-medium">Użycie:</div>
                <div>{`import { BellIcon } from '@/components/icons';`}</div>
                <div>{`<BellIcon className="w-5 h-5 text-[--accent]" />`}</div>
                <div className="mt-2 text-muted">
                  Uwaga: WhyIcon1-4 i GoogleIcon mają hardcoded kolory — className nie zmieni ich barwy.
                </div>
              </div>
            </div>
          </section>

          {/* ── 06 CARDS & BADGES ── */}
          <section className="mb-16">
            <SectionHeading id="cards" num="06" title="Karty i odznaki"
              desc="Kontenery, badge'y statusów, alerty" />
            <div className="space-y-8">

              {/* Card example */}
              <div>
                <SubLabel text="Karta (Card)" />
                <div className="bg-white rounded-2xl p-5 max-w-sm"
                  style={{ border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-foreground text-base">Warszawa → Kraków</div>
                      <div className="text-sm text-muted mt-0.5">3 maja 2026 · 09:00</div>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                      Opublikowane
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1.5"><PassengersIcon className="w-4 h-4" /> 3 os.</span>
                    <span className="flex items-center gap-1.5"><ChildIcon className="w-4 h-4" /> 1 fotelik</span>
                    <span className="flex items-center gap-1.5"><DatesIcon className="w-4 h-4" /> dziś</span>
                  </div>
                </div>
                <div className="mt-2.5"><Token code="rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border-[--border]" /></div>
              </div>

              {/* Badges */}
              <div>
                <SubLabel text="Odznaki statusów (Badge)" />
                <Preview gray>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-badge-success-bg text-badge-success">Opłacone · paid</span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-badge-warning-bg text-badge-warning">Oczekuje · new</span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full text-accent"
                      style={{ backgroundColor: 'var(--accent-light)' }}>Opublikowane · published</span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-badge-error-bg text-badge-error">Anulowane · canceled</span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-light text-muted">Szkic · draft</span>
                  </div>
                </Preview>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Token code="success: bg-badge-success-bg text-badge-success" />
                  <Token code="warning: bg-badge-warning-bg text-badge-warning" />
                  <Token code="info: bg-[--accent-light] text-[--accent]" />
                  <Token code="error: bg-badge-error-bg text-red-600" />
                  <Token code="neutral: bg-gray-light text-[--muted]" />
                </div>
              </div>

              {/* Alerts */}
              <div>
                <SubLabel text="Alerty" />
                <div className="space-y-3">
                  {([
                    {
                      bg: '#eff6ff', border: '#dbeafe', icon: '→', iconColor: '#2563eb',
                      titleColor: '#1e40af', msgColor: '#3b82f6',
                      title: 'Twoje zlecenie zostało opublikowane',
                      msg: 'Kierowcy mogą składać oferty przez 24 godziny.',
                    },
                    {
                      bg: '#f0fdf4', border: '#bbf7d0', icon: '✓', iconColor: '#16a34a',
                      titleColor: '#15803d', msgColor: '#22c55e',
                      title: 'Płatność zakończona pomyślnie',
                      msg: 'Kierowca otrzymał potwierdzenie rezerwacji.',
                    },
                    {
                      bg: '#fef9c3', border: '#fde68a', icon: '⚠', iconColor: '#a16207',
                      titleColor: '#92400e', msgColor: '#b45309',
                      title: 'Brak ofert dla tej trasy',
                      msg: 'Spróbuj zmienić datę lub trasę zlecenia.',
                    },
                    {
                      bg: '#fee2e2', border: '#fecaca', icon: '✕', iconColor: '#dc2626',
                      titleColor: '#b91c1c', msgColor: '#ef4444',
                      title: 'Błąd płatności',
                      msg: 'Karta została odrzucona. Spróbuj inną metodą.',
                    },
                  ]).map(({ bg, border, icon, iconColor, titleColor, msgColor, title, msg }) => (
                    <div key={title} className="flex items-start gap-3 p-4 rounded-xl"
                      style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
                      <span style={{ color: iconColor }} className="text-base leading-none mt-0.5 flex-shrink-0 font-bold">{icon}</span>
                      <div>
                        <div className="text-sm font-medium" style={{ color: titleColor }}>{title}</div>
                        <div className="text-xs mt-0.5" style={{ color: msgColor }}>{msg}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── 07 SPACING & SHADOWS ── */}
          <section className="mb-16">
            <SectionHeading id="spacing" num="07" title="Odstępy i cienie"
              desc="Skala spacing Tailwind używana w projekcie + zaokrąglenia + cienie" />
            <div className="space-y-10">

              {/* Spacing */}
              <div>
                <SubLabel text="Skala odstępów" />
                <div className="space-y-3">
                  {([
                    { label: '4px',  tw: 'p-1 / gap-1'  },
                    { label: '8px',  tw: 'p-2 / gap-2'  },
                    { label: '12px', tw: 'p-3 / gap-3'  },
                    { label: '16px', tw: 'p-4 / gap-4'  },
                    { label: '20px', tw: 'p-5 / gap-5'  },
                    { label: '24px', tw: 'p-6 / gap-6'  },
                    { label: '32px', tw: 'p-8 / gap-8'  },
                    { label: '48px', tw: 'p-12 / gap-12' },
                  ]).map(({ label, tw }) => (
                    <div key={label} className="flex items-center gap-5">
                      <div className="w-12 text-right text-xs text-muted"
                        style={{ fontFamily: 'ui-monospace, monospace' }}>{label}</div>
                      <div className="h-5 rounded-sm bg-accent opacity-20 flex-shrink-0"
                        style={{ width: label }} />
                      <Token code={tw} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Border radius */}
              <div>
                <SubLabel text="Zaokrąglenia (Border Radius)" />
                <div className="flex flex-wrap gap-8">
                  {([
                    { label: 'rounded',    r: '4px',    desc: '4px' },
                    { label: 'rounded-lg', r: '8px',    desc: '8px' },
                    { label: 'rounded-xl', r: '12px',   desc: '12px' },
                    { label: 'rounded-2xl',r: '16px',   desc: '16px' },
                    { label: 'rounded-full', r: '9999px', desc: '∞' },
                  ]).map(({ label, r, desc }) => (
                    <div key={label} className="flex flex-col items-center gap-2.5">
                      <div className="w-14 h-14 bg-accent opacity-20 flex-shrink-0"
                        style={{ borderRadius: r }} />
                      <div className="text-center">
                        <Token code={label} />
                        <div className="text-[10px] text-muted mt-1">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shadows */}
              <div>
                <SubLabel text="Cienie (Box Shadow)" />
                <div className="flex flex-wrap gap-8">
                  {([
                    { label: 'shadow-sm', s: '0 1px 3px rgba(0,0,0,0.08)' },
                    { label: 'card shadow', s: '0 2px 10px rgba(0,0,0,0.06)' },
                    { label: 'shadow-lg', s: '0 8px 24px rgba(0,0,0,0.10)' },
                    { label: 'shadow-xl', s: '0 16px 40px rgba(0,0,0,0.12)' },
                  ]).map(({ label, s }) => (
                    <div key={label} className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 bg-white rounded-xl" style={{ boxShadow: s }} />
                      <Token code={label} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-chrome pt-8 pb-16 mt-4">
            <p className="text-xs text-muted text-center">
              Wayoo Design System · wayoo2026 (pasażer) · Ostatnia aktualizacja: maj 2026
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
