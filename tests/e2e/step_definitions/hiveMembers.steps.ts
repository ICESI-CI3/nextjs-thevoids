/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de miembros de colmena', () => {
  cy.visit('/hiveMembers');
  cy.waitForAppReady();
});

Then('el usuario debería ver la lista de miembros', () => {
  cy.url().should('include', '/hiveMembers');
  cy.get('body').should('be.visible');
});
