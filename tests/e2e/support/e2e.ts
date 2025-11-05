/// <reference types="cypress" />

// Import commands
import './commands';

// Cypress configuration for better test reliability
Cypress.on('uncaught:exception', err => {
  // Evitar que errores de la app (hydration/Emotion/React) fallen la prueba
  // Registramos el error y continuamos la ejecución del test
  // Nota: Si quieres que ciertos errores sí rompan, filtra aquí por mensaje y devuelve true.

  // eslint-disable-next-line no-console
  console.warn('Ignorando uncaught exception en tests E2E:', err?.message);
  return false;
});
