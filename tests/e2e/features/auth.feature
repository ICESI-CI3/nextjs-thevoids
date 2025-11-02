# language: es
Característica: Autenticación de usuarios
  Como usuario del sistema
  Quiero poder iniciar y cerrar sesión
  Para acceder a las funcionalidades del sistema de forma segura

  Antecedentes:
    Dado que el sistema está funcionando correctamente

  Escenario: Inicio de sesión exitoso
    Dado que estoy en la página de login
    Cuando ingreso el email "admin@test.com"
    Y ingreso la contraseña "password123"
    Y hago clic en el botón de iniciar sesión
    Entonces debería ser redirigido al dashboard
    Y debería ver mi nombre de usuario en la barra de navegación

  Escenario: Inicio de sesión con credenciales incorrectas
    Dado que estoy en la página de login
    Cuando ingreso el email "wrong@test.com"
    Y ingreso la contraseña "wrongpassword"
    Y hago clic en el botón de iniciar sesión
    Entonces debería ver un mensaje de error
    Y debería permanecer en la página de login

  Escenario: Validación de campos requeridos
    Dado que estoy en la página de login
    Cuando dejo el campo email vacío
    Y dejo el campo contraseña vacío
    Y hago clic en el botón de iniciar sesión
    Entonces debería ver mensajes de validación en los campos

  Escenario: Cierre de sesión
    Dado que he iniciado sesión como "admin@test.com"
    Cuando hago clic en el botón de cerrar sesión
    Entonces debería ser redirigido a la página de login
    Y no debería tener acceso a páginas protegidas
