/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de progresos', () => {
  cy.visit('/progresses');
  cy.waitForAppReady();
});

Then('el usuario debería ver la lista de progresos', () => {
  cy.url().should('include', '/progresses');
  cy.get('body').should('be.visible');
});
