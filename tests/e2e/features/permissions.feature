Feature: Gestión de Permisos
  Como administrador
  Quiero gestionar permisos
  Para crear y visualizar permisos en el sistema

  Scenario: Crear un nuevo permiso
    Given el usuario está autenticado como administrador
    When el usuario navega a la página de permisos
    And el usuario hace clic en crear nuevo permiso
    And el usuario completa el formulario de permiso con nombre "edit_content"
    And el usuario envía el formulario de permiso
    Then el permiso debería aparecer en la lista de permisos
