/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de roles', () => {
  cy.visit('/roles');
  cy.waitForAppReady();
});

When('el usuario hace clic en crear nuevo rol', () => {
  cy.contains('button', 'Nuevo Rol').click();
});

Then('el usuario debería ver el formulario de rol', () => {
  cy.contains('Nuevo Rol').should('be.visible');
  cy.contains('label', 'Nombre').should('be.visible');
  cy.contains('label', 'Descripción').should('be.visible');
});
