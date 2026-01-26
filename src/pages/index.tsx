import SearchForm from "@/components/SearchForm";

export default function Home() {
  return (
    <main className="p-4 flex flex-col gap-4 max-w-[1250px] mx-auto">
      {/* Sekcja 1: Formularz */}
      <section className="border border-gray-300 p-4 h-[40vh] flex flex-col justify-center">
        <h2 className="mb-4">Wyszukaj</h2>
        <SearchForm />
      </section>

      {/* Sekcja 2: Ikonki */}
      <section className="border border-gray-300 p-4 h-[30vh]">
        <h2 className="mb-4">Kategorie</h2>
        <div className="flex justify-around">
          <div className="flex flex-col items-center p-4 border border-gray-300">
            <span className="text-3xl">🏠</span>
            <span>Lorem ipsum</span>
          </div>
          <div className="flex flex-col items-center p-4 border border-gray-300">
            <span className="text-3xl">🚗</span>
            <span>Dolor sit</span>
          </div>
          <div className="flex flex-col items-center p-4 border border-gray-300">
            <span className="text-3xl">💼</span>
            <span>Amet consectetur</span>
          </div>
          <div className="flex flex-col items-center p-4 border border-gray-300">
            <span className="text-3xl">🎯</span>
            <span>Adipiscing elit</span>
          </div>
        </div>
      </section>

      {/* Sekcja 3: Dlaczego warto */}
      <section className="border border-gray-300 p-4 h-[30vh]">
        <h2 className="mb-4">Dlaczego warto nam zaufać</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
      </section>
    </main>
  );
}
