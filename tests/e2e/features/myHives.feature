Feature: Mis Colmenas
  Como usuario autenticado
  Quiero ver mis colmenas
  Para visualizar las colmenas en las que participo

  Scenario: Visualizar mis colmenas
    Given el usuario está autenticado
    When el usuario navega a la página de mis colmenas
    Then el usuario debería ver la lista de sus colmenas
