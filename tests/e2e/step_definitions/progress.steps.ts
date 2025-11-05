/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de progreso', () => {
  cy.visit('/progress');
  cy.waitForAppReady();
});

Then('el usuario debería ver la interfaz de progreso', () => {
  cy.url().should('include', '/progress');
  cy.get('body').should('be.visible');
});
