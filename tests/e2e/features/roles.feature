Feature: Gestión de Roles
  Como administrador
  Quiero gestionar roles
  Para crear y visualizar roles en el sistema

  Scenario: Crear un nuevo rol
    Given el usuario está autenticado como administrador
    When el usuario navega a la página de roles
    And el usuario hace clic en crear nuevo rol
    And el usuario completa el formulario de rol con nombre "Editor"
    And el usuario envía el formulario de rol
    Then el rol debería aparecer en la lista de roles
