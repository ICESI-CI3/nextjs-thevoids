Feature: Gestión de Todos los Progresos
  Como usuario autenticado
  Quiero ver todos los progresos
  Para visualizar el progreso de todos los usuarios

  Scenario: Visualizar todos los progresos
    Given el usuario está autenticado
    When el usuario navega a la página de progresos
    Then el usuario debería ver la lista de progresos
