# HabitHive

Una plataforma moderna para gestionar hábitos, colmenas y más, construida con Next.js, TypeScript, Material-UI y Tailwind CSS.

## 🚀 Tecnologías

- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript
- **UI**: Material-UI (MUI) + Tailwind CSS
- **Estado**: React Context
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

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run start        # Inicia servidor de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint
npm run lint:fix     # Ejecuta ESLint y corrige errores automáticamente
npm run format       # Formatea código con Prettier
npm run format:check # Verifica formato con Prettier
npm run type-check   # Verifica tipos TypeScript

# Git Hooks (automáticos)
# pre-commit: lint-staged (lint + format)
# pre-push: build (verifica que compile)
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
├── app/                    # Next.js App Router
│   ├── components/         # Componentes React
│   ├── globals.css         # Estilos globales
│   └── layout.tsx          # Layout principal
├── .husky/                 # Git hooks
├── .vscode/                # Configuración VS Code
├── eslint.config.mjs       # Configuración ESLint
├── .prettierrc             # Configuración Prettier
└── package.json            # Dependencias y scripts
```

## 🎨 Características de UI

- **Tema Dinámico**: Modo claro/oscuro con persistencia
- **Diseño Responsivo**: Optimizado para móvil y desktop
- **Material Design**: Componentes consistentes con MUI
- **Gradientes Modernos**: Tema verde personalizado
- **Animaciones Suaves**: Transiciones y efectos hover

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
