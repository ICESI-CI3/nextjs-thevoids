/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de mis colmenas', () => {
  cy.visit('/myHives');
  cy.waitForAppReady();
});

Then('el usuario debería ver la lista de sus colmenas', () => {
  // Verificar que la página cargue y muestre contenido
  cy.url().should('include', '/myHives');
  cy.get('body').should('be.visible');
});
