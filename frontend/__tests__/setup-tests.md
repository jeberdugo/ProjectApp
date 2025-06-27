# Configuración de Pruebas Unitarias

## Instalación de dependencias

Para instalar las dependencias necesarias para las pruebas, ejecuta:

```bash
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest jest jest-environment-jsdom
```

## Estructura completa implementada

### Archivos de configuración:
- ✅ `jest.config.js` - Configuración principal de Jest
- ✅ `jest.setup.js` - Setup global con mocks
- ✅ `package.json` - Scripts de testing agregados

### Pruebas de componentes:
- ✅ `__tests__/components/auth-guard.test.tsx`
- ✅ `__tests__/components/project-dialog.test.tsx`
- ✅ `__tests__/components/task-dialog.test.tsx`
- ✅ `__tests__/components/kanban-board.test.tsx`
- ✅ `__tests__/components/project-filters.test.tsx`

### Pruebas de contextos:
- ✅ `__tests__/contexts/auth-context.test.tsx`

### Pruebas de hooks:
- ✅ `__tests__/hooks/use-project-filters.test.ts`
- ✅ `__tests__/hooks/use-task-filters.test.ts`

### Pruebas de servicios:
- ✅ `__tests__/lib/api.test.ts`
- ✅ `__tests__/lib/utils.test.ts`

### Pruebas de páginas:
- ✅ `__tests__/pages/login.test.tsx`

## Comandos disponibles

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage
```

## Características implementadas

### Mocks configurados:
- Next.js navigation
- localStorage
- fetch API
- window.matchMedia
- API service

### Tipos de pruebas:
- Renderizado de componentes
- Interacciones de usuario
- Estados de carga y error
- Validación de formularios
- Filtrado y búsqueda
- Drag and drop
- Autenticación
- Llamadas a API

### Cobertura:
- Componentes principales
- Hooks personalizados
- Contextos de React
- Servicios API
- Utilidades
- Páginas principales

## Próximos pasos

1. Instalar dependencias con el comando npm
2. Ejecutar `npm test` para verificar que todas las pruebas pasen
3. Revisar cobertura con `npm run test:coverage`
4. Agregar más pruebas según sea necesario

## Documentación

Ver `README-TESTS.md` para documentación completa sobre las pruebas implementadas.