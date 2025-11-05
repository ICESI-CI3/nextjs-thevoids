# Configuración de Puertos - Desarrollo vs E2E

## Puertos Utilizados

| Entorno           | Frontend | Backend |
| ----------------- | -------- | ------- |
| **Desarrollo**    | 5173     | 3000    |
| **E2E (Cypress)** | 5173     | 3001    |

## Variables de Entorno

### Desarrollo Normal

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000  # Por defecto
```

### Pruebas E2E

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001  # Configurado automáticamente
```

## Comandos

### Desarrollo Normal

```bash
# Inicia el frontend apuntando al backend en puerto 3000
npm run dev
```

### Pruebas E2E

```bash
# Inicia el frontend apuntando al backend en puerto 3001
npm run dev:e2e

# O usa los comandos todo-en-uno que ya incluyen dev:e2e:
npm run test:e2e          # Modo interactivo
npm run test:e2e:headless # Modo headless
npm run test:e2e:smoke    # Solo smoke test
```

## Requisitos Previos para E2E

Antes de ejecutar las pruebas E2E, asegúrate de:

1. **Backend E2E corriendo en puerto 3001**

   ```bash
   # En el proyecto del backend, ejecutar:
   # (Ajusta según tu backend)
   npm run dev:e2e  # o el comando equivalente que use puerto 3001
   ```

2. **Backend tiene CORS configurado** para aceptar peticiones desde `http://localhost:5173`

## Flujo de Trabajo

### Para Desarrollo Normal

```bash
# Terminal 1: Backend en 3000
cd ../proyecto_backend
npm run dev

# Terminal 2: Frontend en 5173
cd ../proyecto_front
npm run dev
```

### Para Pruebas E2E

```bash
# Terminal 1: Backend E2E en 3001
cd ../proyecto_backend
npm run dev:e2e  # o el comando equivalente

# Terminal 2: Ejecutar pruebas (inicia frontend automáticamente)
cd ../proyecto_front
npm run test:e2e:headless
```

## Archivos de Configuración

- **`.env.test`** - Variables de entorno para pruebas E2E
- **`cypress.env.json`** - Configuración específica de Cypress (no subir a git)
- **`cypress.env.example.json`** - Ejemplo de configuración (sí subir a git)

## Credenciales de Prueba

Usuario normal:

- Email: `john@habithive.com`
- Password: `Password123!`

Administrador:

- Email: `admin@habithive.com`
- Password: `Password123!`

## Troubleshooting

### Error: "CORS request did not succeed"

**Causa:** El backend E2E (puerto 3001) no está corriendo o no tiene CORS configurado.

**Solución:**

1. Verificar que el backend E2E esté corriendo en puerto 3001
2. Verificar configuración de CORS en el backend

### Error: "baseUrl not responding"

**Causa:** El frontend no está corriendo.

**Solución:** Usa los comandos `test:e2e:*` que inician el servidor automáticamente.

### Las pruebas fallan con credenciales

**Causa:** Las credenciales no existen en la base de datos E2E.

**Solución:** Verificar que la base de datos E2E tenga los usuarios de prueba creados.
