Feature: Asignación de Permisos a Roles
  Como administrador
  Quiero asignar permisos a roles
  Para gestionar las capacidades de cada rol

  Scenario: Asignar permiso a un rol
    Given el usuario está autenticado como administrador
    When el usuario navega a la página de asignación de permisos a roles
    Then el usuario debería ver la interfaz de asignación de permisos
