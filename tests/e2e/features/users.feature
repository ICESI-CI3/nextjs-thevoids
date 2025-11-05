Feature: Gestión de Usuarios
  Como administrador
  Quiero gestionar usuarios
  Para crear y visualizar usuarios en el sistema

  Scenario: Visualizar interfaz de creación de usuario
    Given el usuario está autenticado como administrador
    When el usuario navega a la página de usuarios
    And el usuario hace clic en crear nuevo usuario
    Then el usuario debería ver el formulario de usuario
