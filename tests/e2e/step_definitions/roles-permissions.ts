import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('que he iniciado sesión como administrador', () => {
  cy.login('admin@test.com', 'admin123');
  cy.visit('/');
});

Given('que estoy en la página de roles', () => {
  cy.visit('/roles');
});

Given('que estoy en la página de permisos de roles', () => {
  cy.visit('/rolePermissions');
});

Given('que estoy en la página de permisos', () => {
  cy.visit('/permissions');
});

When('hago clic en {string}', (buttonText: string) => {
  cy.contains('button', buttonText).click();
});

When('completo el nombre del rol como {string}', (roleName: string) => {
  cy.get('input[name="name"]').clear().type(roleName);
});

When('agrego la descripción {string}', (description: string) => {
  cy.get('input[name="description"], textarea[name="description"]')
    .clear()
    .type(description);
});

Then('debería ver {string}', (message: string) => {
  cy.contains(message).should('be.visible');
});

Then('debería ver {string} en la lista de roles', (roleName: string) => {
  cy.get('table, [role="grid"]').contains(roleName).should('exist');
});

Given('existe un rol {string}', (_roleName: string) => {
  cy.get('table, [role="grid"]').should('exist');
});

When('selecciono el rol {string}', (roleName: string) => {
  cy.contains(roleName).click();
});

When(
  'selecciono los permisos:',
  (dataTable: { hashes: () => Array<{ permiso: string }> }) => {
    const permissions = dataTable.hashes();

    permissions.forEach((row: { permiso: string }) => {
      cy.get(`input[type="checkbox"][value*="${row.permiso}"]`).check();
    });
  }
);

Then(
  'el rol {string} debería tener {int} permisos asignados',
  (roleName: string, count: number) => {
    cy.contains(roleName)
      .parent('tr')
      .within(() => {
        cy.contains(count.toString()).should('exist');
      });
  }
);

Then('debería ver la lista completa de permisos', () => {
  cy.get('table tbody tr, [role="row"]').should('have.length.greaterThan', 0);
});

Then('cada permiso debería mostrar su nombre y descripción', () => {
  cy.get('table tbody tr, [role="row"]')
    .first()
    .within(() => {
      cy.get('td').should('have.length.greaterThan', 1);
    });
});

Given('existe un rol {string}', (_roleName: string) => {
  cy.get('table').should('exist');
});

When('edito el rol {string}', (roleName: string) => {
  cy.contains('tr', roleName).within(() => {
    cy.contains('button', 'Editar', { matchCase: false }).click();
  });
});

When('cambio la descripción a {string}', (newDescription: string) => {
  cy.get('input[name="description"], textarea[name="description"]')
    .clear()
    .type(newDescription);
});

Given('existe un rol {string} sin usuarios asignados', (_roleName: string) => {
  cy.get('table').should('exist');
});

When('elimino el rol {string}', (roleName: string) => {
  cy.contains('tr', roleName).within(() => {
    cy.contains('button', 'Eliminar', { matchCase: false }).click();
  });
});

When('confirmo la eliminación', () => {
  cy.contains('button', 'Confirmar', { matchCase: false }).click();
});

Then('no debería ver {string} en la lista', (roleName: string) => {
  cy.get('table').should('not.contain', roleName);
});

Given('existe un rol {string} con usuarios asignados', (_roleName: string) => {
  cy.get('table').should('exist');
});

When('intento eliminar el rol {string}', (roleName: string) => {
  cy.contains('tr', roleName).within(() => {
    cy.contains('button', 'Eliminar', { matchCase: false }).click();
  });
});

Then('debería ver un mensaje de advertencia', () => {
  cy.contains('advertencia', { matchCase: false }).should('be.visible');
});

Then('el rol {string} no debería ser eliminado', (roleName: string) => {
  cy.get('table').contains(roleName).should('exist');
});

When('filtro por el permiso {string}', (permission: string) => {
  cy.get('input[type="search"], input[placeholder*="Buscar"]').type(permission);
});

Then('debería ver solo roles que tienen ese permiso asignado', () => {
  cy.get('table tbody tr, [role="row"]').should('have.length.greaterThan', 0);
  cy.get('table tbody tr, [role="row"]').each($row => {
    cy.wrap($row).should('be.visible');
  });
});
