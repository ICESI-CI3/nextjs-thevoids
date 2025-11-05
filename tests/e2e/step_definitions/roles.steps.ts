/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de roles', () => {
  cy.visit('/roles');
  cy.waitForAppReady();
});

When('el usuario hace clic en crear nuevo rol', () => {
  cy.contains(/create|new|add|crear|nuevo|agregar/i)
    .first()
    .click();
});

When(
  'el usuario completa el formulario de rol con nombre {string}',
  (nombre: string) => {
    cy.get('input[name="name"], input[name="roleName"], input[id*="name"]')
      .first()
      .clear()
      .type(nombre);
    // Agregar descripción si es requerida
    cy.get('input[name="description"], textarea[name="description"]')
      .first()
      .clear()
      .type('Descripción del rol');
  }
);

When('el usuario envía el formulario de rol', () => {
  cy.contains(/submit|save|create|guardar|crear/i).click();
});

Then('el rol debería aparecer en la lista de roles', () => {
  cy.contains(/success|created|éxito|creado|Editor/i, {
    timeout: 10000,
  }).should('be.visible');
});
