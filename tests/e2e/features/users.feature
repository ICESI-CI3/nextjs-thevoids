Feature: Gestión de Usuarios
  Como administrador
  Quiero gestionar usuarios
  Para crear y visualizar usuarios en el sistema

  Scenario: Crear un nuevo usuario
    Given el usuario está autenticado como administrador
    When el usuario navega a la página de usuarios
    And el usuario hace clic en crear nuevo usuario
    And el usuario completa el formulario de usuario con email "nuevo@test.com"
    And el usuario envía el formulario de usuario
    Then el usuario debería aparecer en la lista de usuarios
