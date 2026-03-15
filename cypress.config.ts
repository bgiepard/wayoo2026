import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    env: {
      // dane testowe — nadpisz przez cypress.env.json (gitignored)
      TEST_USER_EMAIL: "pasazer@wp.pl",
      TEST_USER_PASSWORD: "pasazer",
    },
  },
});
