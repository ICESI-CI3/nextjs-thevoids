# language: es
Característica: Gestión de Roles y Permisos
  Como administrador del sistema
  Quiero gestionar roles y asignar permisos
  Para controlar el acceso granular a las funcionalidades

  Antecedentes:
    Dado que he iniciado sesión como administrador

  Escenario: Crear un nuevo rol
    Dado que estoy en la página de roles
    Cuando hago clic en "Crear Rol"
    Y completo el nombre del rol como "Editor"
    Y agrego la descripción "Rol para editores de contenido"
    Y hago clic en "Guardar"
    Entonces debería ver "Rol creado exitosamente"
    Y debería ver "Editor" en la lista de roles

  Escenario: Asignar permisos a un rol
    Dado que estoy en la página de permisos de roles
    Y existe un rol "Editor"
    Cuando selecciono el rol "Editor"
    Y selecciono los permisos:
      | permiso         |
      | users.read      |
      | users.write     |
      | roles.read      |
    Y hago clic en "Guardar Permisos"
    Entonces debería ver "Permisos asignados exitosamente"
    Y el rol "Editor" debería tener 3 permisos asignados

  Escenario: Visualizar todos los permisos disponibles
    Dado que estoy en la página de permisos
    Entonces debería ver la lista completa de permisos
    Y cada permiso debería mostrar su nombre y descripción

  Escenario: Editar un rol existente
    Dado que estoy en la página de roles
    Y existe un rol "Moderador"
    Cuando edito el rol "Moderador"
    Y cambio la descripción a "Rol actualizado para moderadores"
    Y hago clic en "Guardar"
    Entonces debería ver "Rol actualizado exitosamente"

  Escenario: Eliminar un rol sin usuarios asignados
    Dado que estoy en la página de roles
    Y existe un rol "Rol Temporal" sin usuarios asignados
    Cuando elimino el rol "Rol Temporal"
    Y confirmo la eliminación
    Entonces debería ver "Rol eliminado exitosamente"
    Y no debería ver "Rol Temporal" en la lista

  Escenario: Prevenir eliminación de rol con usuarios asignados
    Dado que estoy en la página de roles
    Y existe un rol "Admin" con usuarios asignados
    Cuando intento eliminar el rol "Admin"
    Entonces debería ver un mensaje de advertencia
    Y el rol "Admin" no debería ser eliminado

  Escenario: Filtrar roles por permisos
    Dado que estoy en la página de permisos de roles
    Cuando filtro por el permiso "users.write"
    Entonces debería ver solo roles que tienen ese permiso asignado
