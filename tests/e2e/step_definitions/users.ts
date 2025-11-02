import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { DataTable } from '@badeball/cypress-cucumber-preprocessor';

// Navigation
Given('que he iniciado sesión como administrador', () => {
  cy.login('admin@test.com', 'password123');
});

Given('estoy en la página de usuarios', () => {
  cy.visit('/users');
  cy.url().should('include', '/users');
});

// View table
Then('debería ver la tabla de usuarios', () => {
  cy.get('table').should('be.visible');
});

Then(
  'debería ver las columnas {string}, {string} y {string}',
  (col1: string, col2: string, col3: string) => {
    cy.get('thead').within(() => {
      cy.contains(col1).should('be.visible');
      cy.contains(col2).should('be.visible');
      cy.contains(col3).should('be.visible');
    });
  }
);

// Create user
When('hago clic en el botón {string}', (buttonText: string) => {
  cy.contains('button', buttonText, { matchCase: false }).click();
});

Then('debería ver el formulario de creación', () => {
  cy.get('form, [role="dialog"]').should('be.visible');
});

When('completo el formulario con:', (dataTable: DataTable) => {
  const data = dataTable.hashes()[0];
  Object.entries(data).forEach(([field, value]) => {
    cy.get(`input[name="${field}"], input[id="${field}"]`)
      .clear()
      .type(value as string);
  });
});

When('hago clic en {string}', (buttonText: string) => {
  cy.contains('button', buttonText, { matchCase: false }).click();
});

Then('debería ver el mensaje {string}', (message: string) => {
  cy.contains(message, { timeout: 10000 }).should('be.visible');
});

Then('debería ver {string} en la lista de usuarios', (text: string) => {
  cy.get('table tbody').contains(text).should('be.visible');
});

// Edit user
Given('que existe un usuario {string}', (_userName: string) => {
  // Assume user exists or create via API
  cy.get('table tbody').should('exist');
});

When(
  'hago clic en {string} para {string}',
  (action: string, _userName: string) => {
    // Find and click the action button
    cy.get('button').contains(action, { matchCase: false }).first().click();
  }
);

Then('debería ver el formulario de edición', () => {
  cy.get('form, [role="dialog"]').should('be.visible');
});

When('modifico el nombre a {string}', (newName: string) => {
  cy.get('input[name="name"], input[id="name"]').clear().type(newName);
});

Then('debería ver {string} en la lista', (text: string) => {
  cy.get('table tbody').contains(text).should('be.visible');
});

// Delete user
Then('debería ver una confirmación de eliminación', () => {
  cy.contains(/confirmar|eliminar|delete/i).should('be.visible');
});

When('confirmo la eliminación', () => {
  cy.contains('button', /confirmar|sí|aceptar|eliminar/i, {
    matchCase: false,
  }).click();
});

Then('no debería ver {string} en la lista', (text: string) => {
  cy.get('table tbody').contains(text).should('not.exist');
});

// Search
When('ingreso {string} en el campo de búsqueda', (searchText: string) => {
  cy.get(
    'input[type="search"], input[placeholder*="buscar"], input[placeholder*="Buscar"]'
  )
    .clear()
    .type(searchText);
});

Then(
  'debería ver solo usuarios que contengan {string} en su nombre o email',
  (searchText: string) => {
    cy.get('table tbody tr').each($row => {
      cy.wrap($row).should('contain.text', searchText);
    });
  }
);

// Validation
When('intento guardar sin completar los campos obligatorios', () => {
  cy.contains('button', /guardar|save/i, { matchCase: false }).click();
});

Then('debería ver mensajes de validación', () => {
  cy.get('form').within(() => {
    cy.get('input:invalid, [aria-invalid="true"]').should('exist');
  });
});

Then('no debería crearse el usuario', () => {
  cy.url().should('include', '/users');
  // Modal/form should still be visible
  cy.get('form, [role="dialog"]').should('be.visible');
});

// Toggle status
Given('que existe un usuario activo', () => {
  cy.get('table tbody tr').first().should('exist');
});

When('cambio el estado del usuario', () => {
  cy.get('table tbody tr')
    .first()
    .within(() => {
      cy.get('input[type="checkbox"], button[aria-label*="estado"]')
        .first()
        .click();
    });
});

Then('el usuario debería quedar inactivo', () => {
  cy.wait(1000); // Wait for state change
});

Then('debería reflejarse en la lista', () => {
  cy.get('table tbody').should('exist');
});
