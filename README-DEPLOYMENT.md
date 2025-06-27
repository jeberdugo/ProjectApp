# Guía de Despliegue - ProjectApp

## Configuración Completa

### 1. Compilar Frontend y Backend Juntos

#### Opción A: Compilación Manual (Recomendada)
```bash
# 1. Compilar el frontend
cd frontend
npm install
npm run build

# 2. Copiar archivos estáticos
cd ..
mkdir -p src/main/resources/static
cp -r frontend/out/* src/main/resources/static/

# 3. Compilar y ejecutar Spring Boot
mvn clean package
mvn spring-boot:run
```

#### Opción B: Script Automático
```bash
# Ejecutar el script de compilación
chmod +x build-frontend.sh
./build-frontend.sh

# Compilar y ejecutar
mvn clean package
mvn spring-boot:run
```

### 2. Acceder a la Aplicación

- **Aplicación Web**: http://localhost:8080
- **API REST**: http://localhost:8080/api/*
- **Documentación API**: http://localhost:8080/swagger-ui/index.html

### 3. Configuración de Base de Datos

Asegúrate de tener PostgreSQL ejecutándose:
```bash
# Crear base de datos
createdb projectsapp

# O usar Docker
docker run --name postgres-projectapp -e POSTGRES_DB=projectsapp -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=admin -p 5432:5432 -d postgres
```

### 4. Estructura del Proyecto

```
ProjectApp/
├── frontend/           # Aplicación React/Next.js
│   ├── out/           # Archivos compilados (generados)
│   └── package.json
├── src/main/resources/static/  # Archivos estáticos servidos por Spring Boot
├── pom.xml            # Configuración Maven
└── build-frontend.sh  # Script de compilación
```

### 5. Desarrollo

Para desarrollo separado:
```bash
# Terminal 1: Backend
mvn spring-boot:run

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 6. Producción

Para producción, el frontend se sirve como contenido estático desde Spring Boot en el puerto 8080.

## Notas Importantes

- El frontend se configura para exportación estática (`output: 'export'`)
- Spring Security permite acceso a archivos estáticos
- El WebController redirige rutas SPA al index.html
- CORS configurado para localhost:8080