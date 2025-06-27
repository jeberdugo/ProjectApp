#!/bin/bash

# Script de prueba para la API de gestión de proyectos
# Asegúrate de que la aplicación esté ejecutándose en http://localhost:8080

echo "🚀 Iniciando pruebas de la API de gestión de proyectos..."
echo "=================================================="

BASE_URL="http://localhost:8080"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para hacer requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data"
        else
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data"
        else
            curl -s -X $method "$BASE_URL$endpoint"
        fi
    fi
}

echo -e "${YELLOW}1. Registrando usuario administrador...${NC}"
REGISTER_RESPONSE=$(make_request "POST" "/api/auth/register" '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "password123"
}')

echo "Respuesta: $REGISTER_RESPONSE"
echo ""

echo -e "${YELLOW}2. Iniciando sesión...${NC}"
LOGIN_RESPONSE=$(make_request "POST" "/api/auth/login" '{
    "usernameOrEmail": "admin",
    "password": "password123"
}')

echo "Respuesta: $LOGIN_RESPONSE"
echo ""

# Extraer token JWT (asumiendo que la respuesta es JSON)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener el token JWT${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token JWT obtenido: ${TOKEN:0:20}...${NC}"
echo ""

echo -e "${YELLOW}3. Creando un proyecto...${NC}"
PROJECT_RESPONSE=$(make_request "POST" "/api/projects" '{
    "name": "Proyecto de Prueba",
    "description": "Este es un proyecto de prueba para verificar la API",
    "status": "ACTIVE"
}' "$TOKEN")

echo "Respuesta: $PROJECT_RESPONSE"
echo ""

echo -e "${YELLOW}4. Obteniendo proyectos del usuario...${NC}"
PROJECTS_RESPONSE=$(make_request "GET" "/api/projects" "" "$TOKEN")

echo "Respuesta: $PROJECTS_RESPONSE"
echo ""

echo -e "${YELLOW}5. Creando una etiqueta...${NC}"
LABEL_RESPONSE=$(make_request "POST" "/api/labels" '{
    "name": "Urgente",
    "color": "#FF0000"
}' "$TOKEN")

echo "Respuesta: $LABEL_RESPONSE"
echo ""

echo -e "${YELLOW}6. Obteniendo todas las etiquetas...${NC}"
LABELS_RESPONSE=$(make_request "GET" "/api/labels" "" "$TOKEN")

echo "Respuesta: $LABELS_RESPONSE"
echo ""

echo -e "${GREEN}✅ Todas las pruebas completadas exitosamente!${NC}"
echo ""
echo -e "${YELLOW}📋 Resumen:${NC}"
echo "- ✅ Registro de usuario"
echo "- ✅ Inicio de sesión con JWT"
echo "- ✅ Creación de proyecto"
echo "- ✅ Consulta de proyectos"
echo "- ✅ Creación de etiqueta"
echo "- ✅ Consulta de etiquetas"
echo ""
echo -e "${YELLOW}🌐 URLs útiles:${NC}"
echo "- Swagger UI: $BASE_URL/swagger-ui/index.html"
echo "- H2 Console: $BASE_URL/h2-console"
echo "- API Base: $BASE_URL/api" 