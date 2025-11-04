Feature: Smoke Test
  Como desarrollador
  Quiero verificar que Cypress y Cucumber funcionan correctamente
  Para asegurar que la configuración es correcta

  Scenario: Verificación básica de la aplicación
    Given que la aplicación está funcionando
    When visito la página principal
    Then la página debería cargar correctamente
