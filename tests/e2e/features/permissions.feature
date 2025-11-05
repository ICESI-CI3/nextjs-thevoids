Feature: Gestión de Permisos
  Como administrador
  Quiero visualizar permisos
  Para ver los permisos disponibles en el sistema

  Scenario: Visualizar lista de permisos
    Given el usuario está autenticado como administrador
    When el usuario navega a la página de permisos
    Then el usuario debería ver la lista de permisos
