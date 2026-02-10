import SearchForm from "@/components/SearchForm";

export default function Home() {
    return (
        <main className="flex flex-col gap-8">
            {/* Sekcja 1: Formularz */}
            <section className="flex flex-col justify-center bg-sky-900">
                <div className="w-full max-w-[1150px] mx-auto pb-[120px] pt-[120px] px-4">
                    <h1 className="text-center font-[400] text-[42px] mb-12 text-white">Zarezerwuj <span
                        className="text-[#FFC428]">transport grupowy</span> w kilka minut.</h1>
                    <SearchForm/>
                </div>
            </section>

            {/*Sekcja 2: Jak działa Wayoo?*/}
            <section className="flex flex-col justify-center">
                <div className="w-full max-w-[1150px] mx-auto px-4 pt-[64px] pb-[96px]">
                    <h2 className="text-[#0B298F] text-[33px] text-center mb-[64px]">Jak działa Wayoo?</h2>
                    <span>....</span>
                </div>
            </section>

            {/*Sekcja 3: Dlaczego warto wypróbować Wayoo?*/}
            <section className="flex flex-col justify-center border-y-[1px] border-[#FFC428] bg-[#E7EAF4]">
                <div className="w-full max-w-[1150px] mx-auto px-4 pt-[64px] pb-[96px]">
                    <h2 className="text-[#0B298F] text-[33px] text-center mb-[64px]">Dlaczego warto wypróbować Wayoo?</h2>
                    <span>....</span>
                </div>
            </section>
        </main>
    );
}
