/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de permisos', () => {
  cy.visit('/permissions');
  cy.waitForAppReady();
});

Then('el usuario debería ver la lista de permisos', () => {
  cy.url().should('include', '/permissions');
  cy.get('.MuiDataGrid-root').should('be.visible');
});
