/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de asignación de permisos a roles', () => {
  cy.visit('/rolePermissions');
  cy.waitForAppReady();
});

Then('el usuario debería ver la interfaz de asignación de permisos', () => {
  cy.url().should('include', '/rolePermissions');
  cy.get('body').should('be.visible');
});
