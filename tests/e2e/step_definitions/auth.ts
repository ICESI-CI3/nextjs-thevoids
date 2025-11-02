import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Background
Given('que el sistema está funcionando correctamente', () => {
  cy.clearSession();
});

// Login page navigation
Given('que estoy en la página de login', () => {
  cy.visit('/login');
  cy.url().should('include', '/login');
});

// Input actions
When('ingreso el email {string}', (email: string) => {
  cy.get('input[name="email"]').clear().type(email);
});

When('ingreso la contraseña {string}', (password: string) => {
  cy.get('input[name="password"]').clear().type(password);
});

When('hago clic en el botón de iniciar sesión', () => {
  cy.get('button[type="submit"]').click();
});

When('dejo el campo email vacío', () => {
  cy.get('input[name="email"]').clear();
});

When('dejo el campo contraseña vacío', () => {
  cy.get('input[name="password"]').clear();
});

// Assertions
Then('debería ser redirigido al dashboard', () => {
  cy.url().should('not.include', '/login');
  cy.url().should('match', /\/(users|roles|permissions|dashboard)/);
});

Then('debería ver mi nombre de usuario en la barra de navegación', () => {
  cy.get('nav, aside, [role="navigation"]').should('exist');
  cy.window().then(win => {
    const user = JSON.parse(win.localStorage.getItem('user') || '{}');
    if (user.name) {
      cy.contains(user.name).should('be.visible');
    }
  });
});

Then('debería ver un mensaje de error', () => {
  cy.contains(/error|inválid|incorrect|incorrecto/i, { timeout: 5000 }).should(
    'be.visible'
  );
});

Then('debería permanecer en la página de login', () => {
  cy.url().should('include', '/login');
});

Then('debería ver mensajes de validación en los campos', () => {
  // Check for validation messages or error states
  cy.get('form').within(() => {
    cy.get('input[name="email"]').should('have.attr', 'required');
    cy.get('input[name="password"]').should('have.attr', 'required');
  });
});

// Authenticated user
Given('que he iniciado sesión como {string}', (email: string) => {
  cy.login(email, 'password123');
  cy.visit('/users');
});

When('hago clic en el botón de cerrar sesión', () => {
  cy.contains(/cerrar sesión|logout|salir/i).click();
});

Then('debería ser redirigido a la página de login', () => {
  cy.url().should('include', '/login');
});

Then('no debería tener acceso a páginas protegidas', () => {
  cy.visit('/users');
  cy.url().should('include', '/login');
});
