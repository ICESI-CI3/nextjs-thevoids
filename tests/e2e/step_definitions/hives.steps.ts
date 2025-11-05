/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('el usuario navega a la página de colmenas', () => {
  cy.visit('/hives');
  cy.waitForAppReady();
});

When('el usuario hace clic en crear nueva colmena', () => {
  cy.contains('button', 'Crear Colmena').click();
});

When('el usuario completa el formulario de colmena con nombre {string}', (nombre: string) => {
  // Esperar a que el diálogo esté visible
  cy.contains('Crear Nueva Colmena').should('be.visible');

  // Completar el campo nombre
  cy.contains('label', 'Nombre de la colmena')
    .parent()
    .parent()
    .find('input')
    .first()
    .type(nombre, {force: true});
});

When('el usuario envía el formulario de colmena', () => {
  cy.get('.MuiDialogActions-root')
    .contains('button', 'Crear')
    .click({force: true});
});

Then('la colmena debería aparecer en la lista de colmenas', () => {
  // Esperar el mensaje de éxito (aparece cuando el diálogo se cierra)
  cy.contains('.MuiAlert-root', /Colmena creada|hábitos asociados correctamente/i, { timeout: 15000 })
    .should('be.visible');
});
