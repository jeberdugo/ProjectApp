# Project Management Application

Una aplicación completa de gestión de proyectos tipo Trello construida con Spring Boot, que incluye autenticación JWT, gestión de roles y permisos, y operaciones CRUD completas para proyectos, tareas y etiquetas.

## 🚀 Características

- **Autenticación JWT** con refresh tokens
- **Sistema de roles y permisos** granulares
- **Gestión de proyectos** con miembros y roles
- **Gestión de tareas** con asignación y estados
- **Sistema de etiquetas** para categorización
- **API REST** documentada con Swagger
- **Seguridad** configurada con Spring Security

## 🛠️ Tecnologías

- **Backend**: Spring Boot 3.x
- **Base de datos**: H2 (desarrollo) / PostgreSQL (producción)
- **Seguridad**: Spring Security + JWT
- **Documentación**: Swagger/OpenAPI 3
- **Build**: Maven

## 📋 Prerrequisitos

- Java 17 o superior
- Maven 3.6+
- IDE (IntelliJ IDEA, Eclipse, VS Code)

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd projectapp
   ```

2. **Compilar el proyecto**
   ```bash
   mvn clean install
   ```

3. **Ejecutar la aplicación**
   ```bash
   mvn spring-boot:run
   ```

4. **Acceder a la aplicación**
   - API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui/index.html
   - H2 Console: http://localhost:8080/h2-console

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token

### Proyectos
- `GET /api/projects` - Obtener proyectos del usuario
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/{id}` - Obtener proyecto específico
- `PUT /api/projects/{id}` - Actualizar proyecto
- `DELETE /api/projects/{id}` - Eliminar proyecto

### Miembros del Proyecto
- `GET /api/projects/{id}/members` - Obtener miembros
- `POST /api/projects/{id}/members` - Agregar miembro
- `PUT /api/projects/{id}/members/{username}/role` - Actualizar rol
- `DELETE /api/projects/{id}/members/{username}` - Remover miembro

### Tareas
- `GET /api/tasks` - Obtener todas las tareas
- `POST /api/tasks` - Crear tarea
- `GET /api/tasks/{id}` - Obtener tarea específica
- `GET /api/tasks/project/{projectId}` - Obtener tareas del proyecto
- `GET /api/tasks/my-tasks` - Obtener tareas asignadas al usuario
- `PUT /api/tasks/{id}` - Actualizar tarea
- `DELETE /api/tasks/{id}` - Eliminar tarea

### Etiquetas
- `GET /api/labels` - Obtener todas las etiquetas
- `POST /api/labels` - Crear etiqueta
- `GET /api/labels/{id}` - Obtener etiqueta específica
- `GET /api/labels/project/{projectId}` - Obtener etiquetas del proyecto
- `PUT /api/labels/{id}` - Actualizar etiqueta
- `DELETE /api/labels/{id}` - Eliminar etiqueta

## 🔐 Sistema de Roles

### Roles de Usuario
- **ADMIN**: Acceso completo al sistema
- **USER**: Usuario estándar

### Roles de Proyecto
- **OWNER**: Propietario del proyecto (solo puede ser el creador)
- **ADMIN**: Administrador del proyecto
- **PROJECT_MANAGER**: Gerente del proyecto
- **TEAM_MEMBER**: Miembro del equipo
- **VIEWER**: Solo puede ver

## 📝 Ejemplos de Uso

### 1. Registrar un usuario
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 2. Iniciar sesión
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "admin",
    "password": "password123"
  }'
```

### 3. Crear un proyecto
```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Mi Proyecto",
    "description": "Descripción del proyecto",
    "status": "ACTIVE"
  }'
```

### 4. Crear una tarea
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Implementar API",
    "description": "Crear endpoints REST",
    "projectId": 1,
    "status": "TODO",
    "priority": "HIGH"
  }'
```

## 🗄️ Estructura de la Base de Datos

### Tablas Principales
- **users**: Usuarios del sistema
- **roles**: Roles de usuario
- **user_roles**: Relación usuario-rol
- **projects**: Proyectos
- **tasks**: Tareas
- **labels**: Etiquetas
- **task_labels**: Relación tarea-etiqueta
- **user_projects**: Relación usuario-proyecto con roles
- **refresh_tokens**: Tokens de renovación

## 🔒 Seguridad

- **JWT Authentication**: Tokens de acceso y renovación
- **Password Encryption**: BCrypt para contraseñas
- **Role-based Access Control**: Permisos basados en roles
- **Project-level Permissions**: Permisos granulares por proyecto
- **CSRF Protection**: Deshabilitado para API REST
- **Session Management**: Stateless con JWT

## 🧪 Testing

```bash
# Ejecutar tests unitarios
mvn test

# Ejecutar tests de integración
mvn verify
```

## 📦 Despliegue

### Desarrollo
```bash
mvn spring-boot:run
```

### Producción
```bash
mvn clean package
java -jar target/projectapp-0.0.1-SNAPSHOT.jar
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o preguntas, contacta a:
- Email: support@example.com
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**¡Disfruta usando tu aplicación de gestión de proyectos! 🎉** 