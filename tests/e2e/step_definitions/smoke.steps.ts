/// <reference types="cypress" />

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('que la aplicación está funcionando', () => {
  // Verificar que podemos conectarnos
  cy.log('La aplicación está lista para pruebas');
});

When('visito la página principal', () => {
  cy.visit('/');
});

Then('la página debería cargar correctamente', () => {
  cy.get('body').should('be.visible');
  cy.url().should('include', 'localhost');
});
