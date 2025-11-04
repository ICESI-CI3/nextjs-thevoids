/// <reference types="cypress" />

import { Before, After } from '@badeball/cypress-cucumber-preprocessor';

// Hook que se ejecuta antes de cada escenario
Before(() => {
  // Limpiar el estado antes de cada prueba
  cy.clearSession();
});

// Hook que se ejecuta después de cada escenario
After(() => {
  // Opcional: Capturar screenshot en caso de fallo
  // Este hook puede ser usado para limpieza adicional
});
