/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de hábitos', () => {
  cy.visit('/habits');
  // Esperar a que cargue el encabezado de la página de hábitos
  cy.contains('h1', /hábitos/i, { timeout: 10000 }).should('be.visible');
  cy.waitForAppReady();
});

When('el usuario hace clic en crear nuevo hábito', () => {
  // Preferir un selector estable via data-testid, con fallback al texto
  cy.get('body').then($body => {
    const selector = '[data-testid="create-habit-button"]';
    if ($body.find(selector).length) {
      cy.get(selector).click();
    } else {
      cy.contains('button', /crear/i, { timeout: 10000 }).click();
    }
  });
});

When(
  'el usuario completa el formulario de hábito con nombre {string}',
  (nombre: string) => {
    // Ajustar selectores según tu formulario
    cy.get('input[name="name"], input[name="title"], input[id*="name"]')
      .first()
      .clear()
      .type(nombre);
  }
);

When('el usuario envía el formulario de hábito', () => {
  // Buscar botón de submit/guardar
  cy.contains(/submit|save|create|guardar|crear/i).click();
});

Then('el hábito debería aparecer en la lista de hábitos', () => {
  // Verificar que se muestre un mensaje de éxito o la lista se actualice
  cy.contains(/success|created|éxito|creado|Hacer ejercicio/i, {
    timeout: 10000,
  }).should('be.visible');
});
