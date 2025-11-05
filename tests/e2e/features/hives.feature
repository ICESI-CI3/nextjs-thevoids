Feature: Gestión de Colmenas
  Como usuario autenticado
  Quiero gestionar colmenas
  Para poder crear y visualizar colmenas en la aplicación

  Scenario: Visualizar interfaz de creación de colmena
    Given el usuario está autenticado
    When el usuario navega a la página de colmenas
    And el usuario hace clic en crear nueva colmena
    Then el usuario debería ver el formulario de colmena
