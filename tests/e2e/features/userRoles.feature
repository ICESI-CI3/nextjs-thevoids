Feature: Asignación de Roles a Usuarios
  Como administrador
  Quiero asignar roles a usuarios
  Para gestionar los permisos de cada usuario

  Scenario: Asignar rol a un usuario
    Given el usuario está autenticado como administrador
    When el usuario navega a la página de asignación de roles a usuarios
    Then el usuario debería ver la interfaz de asignación de roles
