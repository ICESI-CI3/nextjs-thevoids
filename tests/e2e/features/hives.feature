Feature: Gestión de Colmenas
  Como usuario autenticado
  Quiero gestionar colmenas
  Para poder crear y visualizar colmenas en la aplicación

  Scenario: Crear una nueva colmena
    Given el usuario está autenticado
    When el usuario navega a la página de colmenas
    And el usuario hace clic en crear nueva colmena
    And el usuario completa el formulario de colmena con nombre "Mi Colmena"
    And el usuario envía el formulario de colmena
    Then la colmena debería aparecer en la lista de colmenas
