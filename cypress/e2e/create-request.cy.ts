/// <reference types="cypress" />

// Pomocnicze: wpisuje tekst w PlaceAutocomplete i klika pierwszą sugestię
function fillPlace(inputId: string, query: string) {
  cy.get(`#${inputId}`).clear().type(query);
  cy.get("[data-cy=place-suggestions] button", { timeout: 10000 }).first().click();
}

describe("Tworzenie zlecenia", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("wypełnia trasę ręcznie, wybiera termin i pasażerów, loguje się i tworzy zlecenie", () => {
    // ─── 1. Strona główna ───────────────────────────────────────────────────
    cy.visit("/");

    // ─── 2. Otwórz modal trasy ──────────────────────────────────────────────
    cy.get("[data-cy=btn-route]:visible").click();

    // ─── 3. Wypełnij trasę: Warszawa → Kraków → Katowice → Wrocław ─────────
    fillPlace("route-origin", "Warszawa");

    // Dodaj przystanek 1: Kraków
    cy.get("[data-cy=btn-add-waypoint]").click();
    fillPlace("route-waypoint-0", "Kraków");

    // Dodaj przystanek 2: Katowice
    cy.get("[data-cy=btn-add-waypoint]").click();
    fillPlace("route-waypoint-1", "Katowice");

    // Cel: Wrocław
    fillPlace("route-destination", "Wrocław");

    // Potwierdź trasę → przejście do DateTimeModal
    cy.get("[data-cy=btn-modal-confirm]").click();

    // ─── 4. Wybierz termin (losowy dzień w przyszłości) ─────────────────────
    // Przejdź do następnego miesiąca i wybierz dzień 15
    cy.get("[data-cy=btn-next-month]").click();
    cy.get("[data-cy=datepicker-day-15]").not("[disabled]").click();

    // Ustaw godzinę: domyślnie 12, klikamy w dół 2x → 10:00
    cy.get("[data-cy=timepicker-hour-down]").click().click();

    // Minuty: domyślnie 0, klikamy w górę 3x → 30
    cy.get("[data-cy=timepicker-minute-up]").click().click().click();

    // Potwierdź datę → przejście do PassengersModal
    cy.get("[data-cy=btn-modal-confirm]").click();

    // ─── 5. Wybierz pasażerów: 3 dorosłych, 2 dzieci, z fotelikami ─────────
    // Dorośli: domyślnie 1, klikamy + 2x → 3
    cy.get("[data-cy=adults-increment]").click().click();

    // Dzieci: 0 → 2
    cy.get("[data-cy=children-increment]").click().click();

    // Zaznacz foteliki
    cy.get("[data-cy=checkbox-child-seats]").check();

    // Wiek dziecka 1: wybierz 5 lat
    cy.get("[data-cy=age-dropdown-0]").click();
    cy.contains("5 lat").click();

    // Wiek dziecka 2: wybierz 3 lata
    cy.get("[data-cy=age-dropdown-1]").click();
    cy.contains("3 lata").click();

    // Potwierdź pasażerów
    cy.get("[data-cy=btn-modal-confirm]").click();

    // ─── 6. Prześlij formularz → strona podglądu zlecenia ───────────────────
    cy.get("[data-cy=btn-search-submit]:visible").click();
    cy.url().should("include", "/request/draft/details");

    // ─── 7. Kliknij "Sprawdź oferty" → otwiera się LoginModal ──────────────
    cy.get("[data-cy=btn-publish]").click();

    // ─── 8. Zaloguj się ─────────────────────────────────────────────────────
    cy.loginViaModal();

    // ─── 9. Po zalogowaniu kliknij ponownie "Sprawdź oferty" ────────────────
    cy.get("[data-cy=btn-publish]").click();

    // ─── 10. Redirect na stronę ofert ───────────────────────────────────────
    cy.url().should("match", /\/request\/.+\/offers/, { timeout: 15000 });
  });
});
