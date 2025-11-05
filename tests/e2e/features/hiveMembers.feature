Feature: Gestión de Miembros de Colmena
  Como usuario autenticado
  Quiero gestionar miembros de colmena
  Para administrar quién pertenece a cada colmena

  Scenario: Visualizar miembros de colmena
    Given el usuario está autenticado
    When el usuario navega a la página de miembros de colmena
    Then el usuario debería ver la lista de miembros
