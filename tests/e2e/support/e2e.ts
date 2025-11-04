/// <reference types="cypress" />

// Import commands
import './commands';

// Cypress configuration for better test reliability
Cypress.on('uncaught:exception', err => {
  // Returning false here prevents Cypress from failing the test
  // Only ignore specific errors if needed
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  return true;
});
