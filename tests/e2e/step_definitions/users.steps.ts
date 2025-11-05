/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de usuarios', () => {
  cy.visit('/users');
  cy.waitForAppReady();
});

When('el usuario hace clic en crear nuevo usuario', () => {
  cy.contains(/create|new|add|crear|nuevo|agregar/i)
    .first()
    .click();
});

When(
  'el usuario completa el formulario de usuario con email {string}',
  (email: string) => {
    cy.get('input[name="email"], input[type="email"]')
      .first()
      .clear()
      .type(email);
    // Completar campos adicionales requeridos con valores por defecto
    cy.get('input[name="name"], input[name="firstName"]')
      .first()
      .clear()
      .type('Usuario Test');
    cy.get('input[name="password"]').first().clear().type('Password123!');
  }
);

When('el usuario envía el formulario de usuario', () => {
  cy.contains(/submit|save|create|guardar|crear/i).click();
});

Then('el usuario debería aparecer en la lista de usuarios', () => {
  cy.contains(/success|created|éxito|creado|nuevo@test.com/i, {
    timeout: 10000,
  }).should('be.visible');
});
