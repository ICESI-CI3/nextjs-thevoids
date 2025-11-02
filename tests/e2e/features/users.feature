# language: es
Característica: Gestión de Usuarios
  Como administrador del sistema
  Quiero gestionar los usuarios
  Para controlar el acceso y permisos en la plataforma

  Antecedentes:
    Dado que he iniciado sesión como administrador
    Y estoy en la página de usuarios

  Escenario: Visualizar lista de usuarios
    Entonces debería ver la tabla de usuarios
    Y debería ver las columnas "Nombre", "Email" y "Estado"

  Escenario: Crear un nuevo usuario
    Cuando hago clic en el botón "Crear Usuario"
    Entonces debería ver el formulario de creación
    Cuando completo el formulario con:
      | campo      | valor              |
      | name       | Nuevo Usuario      |
      | email      | nuevo@test.com     |
      | password   | password123        |
    Y hago clic en "Guardar"
    Entonces debería ver el mensaje "Usuario creado exitosamente"
    Y debería ver "Nuevo Usuario" en la lista de usuarios

  Escenario: Editar un usuario existente
    Dado que existe un usuario "Test User"
    Cuando hago clic en "Editar" para "Test User"
    Entonces debería ver el formulario de edición
    Cuando modifico el nombre a "Usuario Modificado"
    Y hago clic en "Guardar"
    Entonces debería ver el mensaje "Usuario actualizado exitosamente"
    Y debería ver "Usuario Modificado" en la lista

  Escenario: Eliminar un usuario
    Dado que existe un usuario "Usuario a Eliminar"
    Cuando hago clic en "Eliminar" para "Usuario a Eliminar"
    Entonces debería ver una confirmación de eliminación
    Cuando confirmo la eliminación
    Entonces debería ver el mensaje "Usuario eliminado exitosamente"
    Y no debería ver "Usuario a Eliminar" en la lista

  Escenario: Buscar usuarios
    Cuando ingreso "admin" en el campo de búsqueda
    Entonces debería ver solo usuarios que contengan "admin" en su nombre o email

  Escenario: Validación de campos obligatorios
    Cuando hago clic en el botón "Crear Usuario"
    Y intento guardar sin completar los campos obligatorios
    Entonces debería ver mensajes de validación
    Y no debería crearse el usuario

  Escenario: Activar/Desactivar usuario
    Dado que existe un usuario activo
    Cuando cambio el estado del usuario
    Entonces el usuario debería quedar inactivo
    Y debería reflejarse en la lista
