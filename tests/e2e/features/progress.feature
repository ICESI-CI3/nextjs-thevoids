Feature: Gestión de Progreso Individual
  Como usuario autenticado
  Quiero gestionar mi progreso
  Para registrar y visualizar mi progreso en hábitos

  Scenario: Visualizar progreso individual
    Given el usuario está autenticado
    When el usuario navega a la página de progreso
    Then el usuario debería ver la interfaz de progreso
