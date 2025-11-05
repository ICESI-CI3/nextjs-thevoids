/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de transacciones', () => {
  cy.visit('/transactions');
  cy.waitForAppReady();
});

Then('el usuario debería ver la lista de transacciones', () => {
  cy.url().should('include', '/transactions');
  cy.get('body').should('be.visible');
});
