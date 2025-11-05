/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de permisos', () => {
  cy.visit('/permissions');
  cy.waitForAppReady();
});

When('el usuario hace clic en crear nuevo permiso', () => {
  cy.contains(/create|new|add|crear|nuevo|agregar/i)
    .first()
    .click();
});

When(
  'el usuario completa el formulario de permiso con nombre {string}',
  (nombre: string) => {
    cy.get(
      'input[name="name"], input[name="permissionName"], input[id*="name"]'
    )
      .first()
      .clear()
      .type(nombre);
    // Agregar descripción si es requerida
    cy.get('input[name="description"], textarea[name="description"]')
      .first()
      .clear()
      .type('Descripción del permiso');
  }
);

When('el usuario envía el formulario de permiso', () => {
  cy.contains(/submit|save|create|guardar|crear/i).click();
});

Then('el permiso debería aparecer en la lista de permisos', () => {
  cy.contains(/success|created|éxito|creado|edit_content/i, {
    timeout: 10000,
  }).should('be.visible');
});
