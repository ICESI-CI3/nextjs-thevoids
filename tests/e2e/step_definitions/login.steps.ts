/// <reference types="cypress" />

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('el usuario navega a la página de login', () => {
  cy.visit('/login');
  cy.waitForAppReady();
});

When('el usuario ingresa el email {string}', (email: string) => {
  cy.get('input[name="email"]').clear().type(email);
});

When('el usuario ingresa la contraseña {string}', (password: string) => {
  cy.get('input[name="password"]').clear().type(password);
});

When('el usuario hace clic en el botón de login', () => {
  cy.get('button[type="submit"]').click();
});

Then('el usuario debería ser redirigido al dashboard', () => {
  cy.url().should('not.include', '/login');
  // Ajusta esta ruta según tu aplicación
  cy.url().should('include', '/');
});

Then('el usuario debería ver su nombre en la barra de navegación', () => {
  // Ajusta el selector según tu aplicación
  cy.get('nav').should('be.visible');
});

Then('el usuario debería ver un mensaje de error', () => {
  // Ajusta el selector según cómo muestras los errores en tu aplicación
  cy.contains(/error|invalid|incorrect/i).should('be.visible');
});

Then('el usuario debería permanecer en la página de login', () => {
  cy.url().should('include', '/login');
});
