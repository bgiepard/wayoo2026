import SearchForm from "@/components/SearchForm";

export default function Home() {
  return (
    <main className="py-8 px-4 flex flex-col gap-8 max-w-[1250px] mx-auto">
      {/* Sekcja 1: Formularz */}
      <section className="bg-white rounded-lg p-8 min-h-[40vh] flex flex-col justify-center shadow-sm">
        <h2 className="mb-6 text-lg">Dokad chcesz pojechac?</h2>
        <SearchForm />
      </section>

      {/* Sekcja 2: Kategorie */}
      <section className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="mb-6">Popularne kierunki</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <span className="text-3xl mb-2">🏔️</span>
            <span className="text-sm">Zakopane</span>
          </div>
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <span className="text-3xl mb-2">🏖️</span>
            <span className="text-sm">Gdansk</span>
          </div>
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <span className="text-3xl mb-2">🏰</span>
            <span className="text-sm">Krakow</span>
          </div>
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <span className="text-3xl mb-2">🌆</span>
            <span className="text-sm">Warszawa</span>
          </div>
        </div>
      </section>

      {/* Sekcja 3: Dlaczego warto */}
      <section className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="mb-4">Dlaczego wayoo?</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="font-medium mb-1">Wygodnie</p>
            <p className="text-sm text-gray-500">Przejazd door-to-door bez przesiadek</p>
          </div>
          <div>
            <p className="font-medium mb-1">Bezpiecznie</p>
            <p className="text-sm text-gray-500">Zweryfikowani kierowcy</p>
          </div>
          <div>
            <p className="font-medium mb-1">Elastycznie</p>
            <p className="text-sm text-gray-500">Ty wybierasz termin i trase</p>
          </div>
        </div>
      </section>
    </main>
  );
}
