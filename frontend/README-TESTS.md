# Pruebas Unitarias con Jest

Este proyecto incluye una configuración completa de pruebas unitarias usando Jest y React Testing Library.

## Configuración

### Dependencias instaladas:
- `jest`: Framework de testing
- `jest-environment-jsdom`: Entorno DOM para Jest
- `@testing-library/react`: Utilidades para testing de React
- `@testing-library/jest-dom`: Matchers adicionales para Jest
- `@testing-library/user-event`: Simulación de eventos de usuario
- `@types/jest`: Tipos de TypeScript para Jest

### Archivos de configuración:
- `jest.config.js`: Configuración principal de Jest
- `jest.setup.js`: Setup global para las pruebas
- `__tests__/`: Directorio con todas las pruebas

## Scripts disponibles

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con reporte de cobertura
npm run test:coverage
```

## Estructura de pruebas

```
__tests__/
├── components/          # Pruebas de componentes
│   ├── auth-guard.test.tsx
│   ├── project-dialog.test.tsx
│   └── task-dialog.test.tsx
├── contexts/           # Pruebas de contextos
│   └── auth-context.test.tsx
├── hooks/              # Pruebas de hooks personalizados
│   ├── use-project-filters.test.ts
│   └── use-task-filters.test.ts
├── lib/                # Pruebas de utilidades
│   ├── api.test.ts
│   └── utils.test.ts
└── pages/              # Pruebas de páginas
    └── login.test.tsx
```

## Pruebas implementadas

### Componentes
- **AuthGuard**: Verificación de estados de autenticación y redirecciones
- **ProjectDialog**: Creación y edición de proyectos
- **TaskDialog**: Creación y edición de tareas

### Contextos
- **AuthContext**: Manejo de autenticación, login, registro y logout

### Hooks
- **useProjectFilters**: Filtrado y ordenamiento de proyectos
- **useTaskFilters**: Filtrado de tareas por múltiples criterios

### Servicios
- **ApiService**: Llamadas HTTP, autenticación y manejo de errores

### Utilidades
- **cn function**: Combinación de clases CSS con Tailwind

### Páginas
- **LoginPage**: Formulario de login y manejo de estados

## Mocks configurados

- `next/navigation`: Router de Next.js
- `localStorage`: Almacenamiento local del navegador
- `fetch`: Llamadas HTTP
- `window.matchMedia`: Media queries para responsive design

## Cobertura de código

Las pruebas cubren:
- Renderizado de componentes
- Interacciones de usuario
- Estados de carga y error
- Validación de formularios
- Filtrado y búsqueda
- Autenticación y autorización
- Llamadas a API
- Manejo de errores

## Ejecutar pruebas

```bash
# Instalar dependencias
npm install

# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas específicas
npm test auth-guard

# Ejecutar con cobertura
npm run test:coverage
```

## Mejores prácticas implementadas

1. **Aislamiento**: Cada prueba es independiente
2. **Mocking**: Dependencias externas mockeadas
3. **Cleanup**: Estado limpio entre pruebas
4. **Descriptivo**: Nombres claros y descriptivos
5. **Cobertura**: Testing de casos felices y de error
6. **Async/Await**: Manejo correcto de operaciones asíncronas