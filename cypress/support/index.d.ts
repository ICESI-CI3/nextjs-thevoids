/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login a user
     * @example cy.login('user@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>;

    /**
     * Custom command to logout a user
     * @example cy.logout()
     */
    logout(): Chainable<void>;

    /**
     * Custom command to clear session (cookies and localStorage)
     * @example cy.clearSession()
     */
    clearSession(): Chainable<void>;
  }
}

export {};
