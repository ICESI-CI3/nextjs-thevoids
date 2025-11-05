/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de usuarios', () => {
  cy.visit('/users');
  cy.waitForAppReady();
});

When('el usuario hace clic en crear nuevo usuario', () => {
  cy.contains('button', 'Nuevo Usuario').click();
});

Then('el usuario debería ver el formulario de usuario', () => {
  cy.contains('Nuevo Usuario').should('be.visible');
  cy.contains('label', 'Nombre').should('exist');
  cy.contains('label', 'Email').should('exist');
  cy.contains('label', 'Contraseña').should('exist');
});
