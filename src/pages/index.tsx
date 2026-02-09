import SearchForm from "@/components/SearchForm";

export default function Home() {
  return (
    <main className="py-8 px-4 flex flex-col gap-8 max-w-[1250px] mx-auto">
      {/* Sekcja 1: Formularz */}
      <section className="p-8 min-h-[40vh] flex flex-col justify-center border-2 border-red-700">
        <h1 className="text-center font-[400]">Zarezerwuj transport grupowy w kilka minut.</h1>
        <SearchForm />
      </section>
    </main>
  );
}
