Feature: Gestión de Hábitos
  Como usuario autenticado
  Quiero gestionar hábitos
  Para poder crear y visualizar hábitos en la aplicación

  Scenario: Crear un nuevo hábito
    Given el usuario está autenticado
    When el usuario navega a la página de hábitos
    And el usuario hace clic en crear nuevo hábito
    And el usuario completa el formulario de hábito con nombre "Hacer ejercicio"
    And el usuario envía el formulario de hábito
    Then el hábito debería aparecer en la lista de hábitos
