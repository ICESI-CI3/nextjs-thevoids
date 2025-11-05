/// <reference types="cypress" />

import { Given } from '@badeball/cypress-cucumber-preprocessor';

Given('el usuario está autenticado', () => {
  // Login simple - ajustar credenciales según tu ambiente
  cy.visit('/login');
  cy.get('input[name="email"]').clear().type('john@habithive.com');
  cy.get('input[name="password"]').clear().type('Password123!');
  cy.get('button[type="submit"]').click();
  // Esperar a que se redirija del login
  cy.url().should('not.include', '/login');
  cy.waitForAppReady();
});

Given('el usuario está autenticado como administrador', () => {
  // Login como admin - ajustar credenciales según tu ambiente
  cy.visit('/login');
  cy.get('input[name="email"]').clear().type('admin@habithive.com');
  cy.get('input[name="password"]').clear().type('Password123!');
  cy.get('button[type="submit"]').click();
  // Esperar a que se redirija del login
  cy.url().should('not.include', '/login');
  cy.waitForAppReady();
});
