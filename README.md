# HabitHive

Una plataforma moderna para gestionar hábitos, colmenas y más, construida con Next.js, TypeScript, Material-UI y Tailwind CSS.

## 🚀 Tecnologías

- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript
- **UI**: Material-UI (MUI) + Tailwind CSS
- **Estado**: React Context
- **Testing**: Jest + React Testing Library + Cypress (E2E)
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

## 🛠️ Desarrollo

### Instalación

```bash
npm install
```

### Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo (puerto 5173)
npm run build        # Construye para producción
npm run start        # Inicia servidor de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint
npm run lint:fix     # Ejecuta ESLint y corrige errores automáticamente
npm run format       # Formatea código con Prettier
npm run format:check # Verifica formato con Prettier
npm run type-check   # Verifica tipos TypeScript

# Testing
npm run test              # Ejecuta tests unitarios
npm run test:watch        # Ejecuta tests en modo watch
npm run test:coverage     # Genera reporte de cobertura
npm run test:e2e          # Abre Cypress (modo interactivo)
npm run test:e2e:headless # Ejecuta tests E2E en modo headless

# Git Hooks (automáticos)
# pre-commit: lint-staged (lint + format)
```

### Configuración de VS Code

Se recomienda instalar las siguientes extensiones:

- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Tailwind CSS IntelliSense** - Autocompletado CSS
- **TypeScript Importer** - Importaciones inteligentes

Las configuraciones de VS Code están incluidas en `.vscode/settings.json`.

## 📁 Estructura del Proyecto

```
habithive/
├── app/                           # Next.js App Router
│   ├── (habitHive)/               # Grupo de rutas - Gestión de hábitos
│   │   ├── habits/                # Página de hábitos
│   │   ├── hives/                 # Página de colmenas
│   │   ├── hiveMembers/           # Página de miembros
│   │   ├── payments/              # Página de pagos
│   │   ├── progresses/            # Página de progresos
│   │   └── transactions/          # Página de transacciones
│   ├── (userManagement)/          # Grupo de rutas - Gestión de usuarios
│   │   ├── login/                 # Página de login
│   │   ├── users/                 # Página de usuarios
│   │   ├── roles/                 # Página de roles
│   │   ├── permissions/           # Página de permisos
│   │   ├── rolePermissions/       # Asignación permisos a roles
│   │   └── userRoles/             # Asignación roles a usuarios
│   ├── globals.css                # Estilos globales
│   ├── layout.tsx                 # Layout principal
│   └── page.tsx                   # Página principal (dashboard)
├── lib/                           # Librerías y utilidades
│   ├── api/                       # Clientes API
│   │   ├── auth.ts                # API de autenticación
│   │   ├── client.ts              # Cliente HTTP base
│   │   ├── users.ts               # API de usuarios
│   │   ├── roles.ts               # API de roles
│   │   ├── permissions.ts         # API de permisos
│   │   ├── rolePermissions.ts     # API de permisos de roles
│   │   └── userRoles.ts           # API de roles de usuarios
│   ├── components/                # Componentes compartidos
│   │   ├── AppProviders.tsx       # Providers de la app
│   │   ├── DataTable.tsx          # Tabla de datos genérica
│   │   ├── FormBuilder.tsx        # Constructor de formularios
│   │   ├── Modal.tsx              # Modal reutilizable
│   │   ├── MuiThemeProvider.tsx   # Provider de tema MUI
│   │   ├── Navbar.tsx             # Barra de navegación
│   │   ├── PageHeader.tsx         # Encabezado de página
│   │   ├── ProtectedRoute.tsx     # Protección de rutas
│   │   ├── ThemeContext.tsx       # Contexto de tema
│   │   └── ThemeUpdater.tsx       # Actualizador de tema
│   ├── contexts/                  # Contextos React
│   │   ├── AuthContext.tsx        # Contexto de autenticación
│   │   └── DataContext.tsx        # Contexto de datos
│   └── utils.ts                   # Utilidades generales
├── tests/                         # Tests
│   └── e2e/                       # Tests End-to-End
│       ├── features/              # Archivos .feature (Gherkin)
│       │   ├── auth.feature       # Tests de autenticación
│       │   ├── users.feature      # Tests de usuarios
│       │   ├── roles-permissions.feature  # Tests de roles
│       │   ├── permissions.feature        # Tests de permisos
│       │   ├── rolePermissions.feature    # Tests asignación permisos
│       │   └── userRoles.feature          # Tests asignación roles
│       ├── step_definitions/      # Implementación de pasos
│       │   ├── auth.ts            # Steps de autenticación
│       │   ├── users.ts           # Steps de usuarios
│       │   ├── roles-permissions.ts  # Steps de roles
│       │   ├── permissions.ts     # Steps de permisos
│       │   └── userRoles.ts       # Steps de roles de usuarios
│       ├── support/               # Soporte y configuración
│       │   ├── commands.ts        # Comandos personalizados
│       │   └── e2e.ts             # Setup global
│       ├── README.md              # Documentación E2E
│       ├── TEST_SUMMARY.md        # Resumen de tests
│       └── QUICK_START.md         # Guía rápida
├── coverage/                      # Reportes de cobertura
├── cypress/                       # Cypress (screenshots, videos)
├── .husky/                        # Git hooks
├── .vscode/                       # Configuración VS Code
├── cypress.config.ts              # Configuración Cypress
├── jest.config.ts                 # Configuración Jest
├── jest.setup.ts                  # Setup Jest
├── eslint.config.mjs              # Configuración ESLint
├── .prettierrc                    # Configuración Prettier
├── .cypress-cucumber-preprocessorrc.json  # Config Cucumber
├── run-e2e-tests.ps1              # Script helper E2E
└── package.json                   # Dependencias y scripts
```

## 🎨 Características de UI

- **Tema Dinámico**: Modo claro/oscuro con persistencia
- **Diseño Responsivo**: Optimizado para móvil y desktop
- **Material Design**: Componentes consistentes con MUI
- **Gradientes Modernos**: Tema verde personalizado
- **Animaciones Suaves**: Transiciones y efectos hover

## 🧪 Testing

### Tests Unitarios (Jest + React Testing Library)

El proyecto incluye tests unitarios completos con cobertura superior al 80% en todos los archivos.

```bash
# Ejecutar todos los tests
npm run test

# Modo watch (desarrollo)
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

**Cobertura Actual:**

- ✅ Statements: 97.72%
- ✅ Branches: 91.1%
- ✅ Functions: 88.8%
- ✅ Lines: 97.72%

### Tests End-to-End (Cypress + Cucumber)

El proyecto incluye **42 escenarios E2E** que cubren todas las funcionalidades principales:

**Features implementadas:**

- ✅ Autenticación (4 escenarios)
- ✅ Gestión de Usuarios (7 escenarios)
- ✅ Gestión de Roles (7 escenarios)
- ✅ Gestión de Permisos (6 escenarios)
- ✅ Asignación de Permisos a Roles (6 escenarios)
- ✅ Asignación de Roles a Usuarios (7 escenarios)

**Ejecutar tests E2E:**

```bash
# Modo interactivo (recomendado para desarrollo)
npm run test:e2e

# Modo headless (para CI/CD)
npm run test:e2e:headless

# Con script helper
.\run-e2e-tests.ps1
```

**Documentación E2E:**

- 📖 [Guía Completa](tests/e2e/README.md)
- 📊 [Resumen de Tests](tests/e2e/TEST_SUMMARY.md)
- 🚀 [Guía Rápida](tests/e2e/QUICK_START.md)

## 🔧 Calidad de Código

### Linting y Formateo Automático

Los commits automáticamente ejecutan:

1. **ESLint**: Verifica reglas de código
2. **Prettier**: Formatea el código
3. **TypeScript**: Verifica tipos

### Reglas Configuradas

- **ESLint**: Reglas recomendadas de TypeScript + Next.js
- **Prettier**: Configuración consistente (semicolons, single quotes, etc.)
- **Husky**: Hooks de pre-commit y pre-push

## 📝 Contribución

1. Crea una rama desde `main`
2. Realiza tus cambios
3. Los commits ejecutarán automáticamente linting y formateo
4. Crea un Pull Request

## 📄 Licencia

Este proyecto es privado y propiedad de ICESI-CI3.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
