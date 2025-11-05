/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de colmenas', () => {
  cy.visit('/hives');
  cy.waitForAppReady();
});

When('el usuario hace clic en crear nueva colmena', () => {
  cy.contains('button', 'Crear Colmena').click();
});

Then('el usuario debería ver el formulario de colmena', () => {
  cy.contains('Crear Nueva Colmena').should('be.visible');
  cy.contains('label', 'Nombre de la colmena').should('exist');
});
