/// <reference types="cypress" />

/* eslint-disable @typescript-eslint/no-namespace */

// Custom commands for authentication
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    void cy.url().should('not.include', '/login');
  });
});

Cypress.Commands.add('logout', () => {
  cy.window().then(win => {
    win.localStorage.removeItem('token');
    win.localStorage.removeItem('user');
    win.localStorage.removeItem('permissions');
  });
});

// Custom command to clear session
Cypress.Commands.add('clearSession', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      clearSession(): Chainable<void>;
    }
  }
}

export {};
