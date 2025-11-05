Feature: Gestión de Roles
  Como administrador
  Quiero gestionar roles
  Para crear y visualizar roles en el sistema

  Scenario: Visualizar interfaz de creación de rol
    Given el usuario está autenticado como administrador
    When el usuario navega a la página de roles
    And el usuario hace clic en crear nuevo rol
    Then el usuario debería ver el formulario de rol
