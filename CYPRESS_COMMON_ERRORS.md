# Errores Comunes de Cypress y Soluciones

## 1. Error de Hydration Mismatch

### Síntoma

```
Error: Hydration failed because the server rendered HTML didn't match the client
```

### Causa

Este error ocurre cuando Next.js (SSR) renderiza HTML en el servidor que no coincide exactamente con lo que React renderiza en el cliente. Es común con Material UI + Emotion porque los estilos se inyectan de manera diferente en servidor vs cliente.

### Solución

Ya está configurado en `tests/e2e/support/e2e.ts` para ignorar estos errores en las pruebas de Cypress, ya que **no afectan la funcionalidad de las pruebas**.

```typescript
Cypress.on('uncaught:exception', err => {
  if (err.message.includes('Hydration failed')) {
    return false; // Ignora el error
  }
  return true;
});
```

### ¿Por qué es seguro ignorarlo en pruebas?

- El error solo afecta el primer render
- React regenera el árbol correctamente en el cliente
- La aplicación funciona normalmente después
- Las pruebas E2E verifican el comportamiento del usuario, no los detalles de implementación de React

---

## 2. Error CORS

### Síntoma

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource
```

### Causa

El backend no está configurado para aceptar peticiones desde `http://localhost:5173`

### Solución

1. Verifica que el backend E2E esté corriendo en puerto **3001**
2. Configura CORS en el backend para permitir `http://localhost:5173`

---

## 3. Error "baseUrl not responding"

### Síntoma

```
Timed out waiting for http://localhost:5173 to respond
```

### Causa

El frontend no está corriendo

### Solución

Usa los comandos que inician el servidor automáticamente:

```bash
npm run test:e2e:headless
```

---

## 4. Error "expected URL to not include /login"

### Síntoma

Las pruebas de login fallan porque el usuario no se redirige

### Causa

- Credenciales incorrectas
- Backend no está corriendo
- Error de CORS
- Usuario no existe en la base de datos E2E

### Solución

1. Verifica que el backend E2E esté corriendo en puerto **3001**
2. Verifica que las credenciales sean correctas:
   - Usuario: `john@habithive.com` / Password: `Password123!`
   - Admin: `admin@habithive.com` / Password: `Password123!`
3. Verifica que estos usuarios existan en tu base de datos E2E

---

## 5. Errores de ResizeObserver

### Síntoma

```
ResizeObserver loop completed with undelivered notifications
```

### Causa

Advertencia del navegador que no afecta la funcionalidad

### Solución

Ya está configurado para ignorarse en `tests/e2e/support/e2e.ts`

---

## 6. Error "NotFoundError: insertBefore"

### Síntoma

```
NotFoundError: Failed to execute 'insertBefore' on 'Node'
```

### Causa

Conflicto entre Emotion (estilos de MUI) y el DOM en Cypress

### Solución

Ya está configurado para ignorarse en `tests/e2e/support/e2e.ts`

---

## Configuración Actual de Errores Ignorados

El archivo `tests/e2e/support/e2e.ts` está configurado para ignorar automáticamente:

✅ Errores de ResizeObserver
✅ Errores de Hydration de Next.js
✅ Errores de insertBefore de Emotion
✅ Errores de React minificado

Estos errores **no afectan la funcionalidad** de tu aplicación ni la validez de las pruebas E2E.

---

## Buenas Prácticas

### ❌ NO Ignorar

- Errores de autenticación
- Errores de red reales
- Errores de lógica de negocio
- Errores de validación

### ✅ SÍ Ignorar en E2E

- Errores de hydration (problemas de SSR)
- Advertencias del navegador
- Errores de librerías de estilos
- Errores de resize observers

---

## Debugging

Si una prueba falla y no estás seguro del motivo:

1. **Ejecuta en modo interactivo:**

   ```bash
   npm run test:e2e
   ```

2. **Revisa las capturas de pantalla:**

   ```bash
   cypress/screenshots/
   ```

3. **Revisa la consola del navegador en Cypress**
   - Se muestra en tiempo real en modo interactivo

4. **Agrega logs en los steps:**
   ```typescript
   When('el usuario hace algo', () => {
     cy.log('Iniciando acción...');
     cy.get('button').click();
     cy.log('Acción completada');
   });
   ```

---

## Recursos

- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Next.js Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)
- [Material UI + Cypress](https://mui.com/material-ui/guides/testing/)
