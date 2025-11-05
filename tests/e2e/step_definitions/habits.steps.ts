/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de hábitos', () => {
  cy.visit('/habits');
  cy.waitForAppReady();
});

When('el usuario hace clic en crear nuevo hábito', () => {
  cy.contains('button', 'Crear Hábito').click();
});

Then('el usuario debería ver el formulario de hábito', () => {
  cy.contains('Crear Nuevo Hábito').should('be.visible');
  cy.contains('label', 'Título del hábito').should('be.visible');
});
