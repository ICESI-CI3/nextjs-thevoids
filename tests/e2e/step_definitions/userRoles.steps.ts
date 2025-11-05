/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de asignación de roles a usuarios', () => {
  cy.visit('/userRoles');
  cy.waitForAppReady();
});

Then('el usuario debería ver la interfaz de asignación de roles', () => {
  cy.url().should('include', '/userRoles');
  cy.get('body').should('be.visible');
});
