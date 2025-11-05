Feature: Gestión de Transacciones
  Como usuario autenticado
  Quiero ver las transacciones
  Para revisar el historial de transacciones

  Scenario: Visualizar transacciones
    Given el usuario está autenticado
    When el usuario navega a la página de transacciones
    Then el usuario debería ver la lista de transacciones
