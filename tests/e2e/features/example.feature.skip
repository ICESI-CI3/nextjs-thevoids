Feature: Login de Usuario
  Como usuario de HabitHive
  Quiero poder iniciar sesión
  Para acceder a mi cuenta

  Background:
    Given el usuario navega a la página de login

  Scenario: Login exitoso con credenciales válidas - Usuario normal
    When el usuario ingresa el email "john@habithive.com"
    And el usuario ingresa la contraseña "Password123!"
    And el usuario hace clic en el botón de login
    Then el usuario debería ser redirigido al dashboard
    And el usuario debería ver su nombre en la barra de navegación

  Scenario: Login exitoso con credenciales válidas - Administrador
    When el usuario ingresa el email "admin@habithive.com"
    And el usuario ingresa la contraseña "Password123!"
    And el usuario hace clic en el botón de login
    Then el usuario debería ser redirigido al dashboard
    And el usuario debería ver su nombre en la barra de navegación

  Scenario: Login fallido con credenciales inválidas
    When el usuario ingresa el email "invalid@example.com"
    And el usuario ingresa la contraseña "wrongpassword"
    And el usuario hace clic en el botón de login
    Then el usuario debería ver un mensaje de error
    And el usuario debería permanecer en la página de login
