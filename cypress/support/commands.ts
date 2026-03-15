/// <reference types="cypress" />

/**
 * Loguje użytkownika przez LoginModal (musi być otwarty na stronie).
 * Używa danych z cypress.env.json lub parametrów.
 */
Cypress.Commands.add("loginViaModal", (email?: string, password?: string) => {
  const userEmail = email ?? Cypress.env("TEST_USER_EMAIL");
  const userPassword = password ?? Cypress.env("TEST_USER_PASSWORD");

  cy.get("[data-cy=input-email]").type(userEmail);
  cy.get("[data-cy=input-password]").type(userPassword);
  cy.get("[data-cy=btn-auth-submit]").click();
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginViaModal(email?: string, password?: string): Chainable<void>;
    }
  }
}
