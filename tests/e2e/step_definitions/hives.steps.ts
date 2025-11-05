/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de colmenas', () => {
  cy.visit('/hives');
  cy.waitForAppReady();
});

When('el usuario hace clic en crear nueva colmena', () => {
  cy.contains(/create|new|add|crear|nuevo|agregar/i)
    .first()
    .click();
});

When(
  'el usuario completa el formulario de colmena con nombre {string}',
  (nombre: string) => {
    cy.get('input[name="name"], input[name="title"], input[id*="name"]')
      .first()
      .clear()
      .type(nombre);
  }
);

When('el usuario envía el formulario de colmena', () => {
  cy.contains(/submit|save|create|guardar|crear/i).click();
});

Then('la colmena debería aparecer en la lista de colmenas', () => {
  cy.contains(/success|created|éxito|creado|Mi Colmena/i, {
    timeout: 10000,
  }).should('be.visible');
});
