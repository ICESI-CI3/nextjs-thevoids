Feature: Gestión de Hábitos
  Como usuario autenticado
  Quiero gestionar hábitos
  Para poder crear y visualizar hábitos en la aplicación

  Scenario: Visualizar interfaz de creación de hábito
    Given el usuario está autenticado
    When el usuario navega a la página de hábitos
    And el usuario hace clic en crear nuevo hábito
    Then el usuario debería ver el formulario de hábito
