# Ponti - Tu Compañero de Carrera Digital

Aplicación universitaria que unifica la experiencia estudiantil, proporcionando un ecosistema digital completo para estudiantes de la Universidad Pontificia Bolivariana.

## 🏗️ Arquitectura del Proyecto

Este proyecto está dividido en dos servicios principales:

- **ponti-frontend**: Aplicación Web Progresiva (PWA) construida con Next.js 15, TypeScript, Tailwind CSS y shadcn/ui
- **ponti-api**: API RESTful construida con Node.js, Express, TypeScript y MongoDB

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker y Docker Compose
- Node.js 18+ (opcional, para desarrollo local)
- pnpm (opcional, para desarrollo local)

### Ejecución (Recomendado)

1. **Clona el repositorio y navega al directorio:**
   ```bash
   cd /home/nekstoreo/Workspace/Ponti
   ```

2. **Inicia MongoDB con Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Ejecuta la API localmente:**
   ```bash
   cd ponti-api
   pnpm install
   pnpm dev
   ```

   Esto iniciará:
   - **MongoDB**: localhost:27017 (en Docker)
   - **Ponti API**: http://localhost:3001 (local)
   - **Mongo Express** (opcional): `docker-compose --profile admin up -d`


### Desarrollo Local

#### Frontend (Ponti PWA)
```bash
cd ponti-frontend
pnpm install
pnpm dev
```
Accede en: http://localhost:3000

#### Backend (Ponti API)
```bash
cd ponti-api
pnpm install
pnpm dev
```
Accede en: http://localhost:3001

## 📋 Estado del Sprint 1

### ✅ Completado
- ✅ Configuración del entorno y proyecto base
- ✅ Inicialización de proyectos ponti-frontend y ponti-api
- ✅ Configuración de Next.js con TypeScript, Tailwind CSS y shadcn/ui
- ✅ Configuración de Node.js con Express, TypeScript, Mongoose y dotenv
- ✅ Creación de Dockerfile para la API
- ✅ Creación de docker-compose.yml con servicios de API y MongoDB

### 🔄 Próximos Pasos
- 🔄 Implementar autenticación JWT
- 🔄 Crear modelos de base de datos (Usuario, Horario, etc.)
- 🔄 Desarrollar endpoints de API
- 🔄 Crear interfaz de dashboard y horario
- 🔄 Integrar frontend con backend

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS utilitario
- **shadcn/ui** - Componentes UI de alta calidad
- **Lucide React** - Iconos

### Backend
- **Node.js 18** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Hashing de contraseñas

### DevOps
- **Docker** - Contenedorización de MongoDB
- **Docker Compose** - Orquestación de base de datos

## 📁 Estructura del Proyecto

```
Ponti/
├── ponti-frontend/          # Aplicación PWA
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # Componentes React
│   │   └── lib/           # Utilidades
│   └── package.json
├── ponti-api/              # API REST
│   ├── src/
│   │   ├── config/        # Configuración BD
│   │   ├── controllers/   # Controladores API
│   │   ├── models/        # Modelos Mongoose
│   │   ├── routes/        # Rutas API
│   │   └── middleware/    # Middleware Express
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Orquestación Docker
└── docs/                   # Documentación del proyecto
```

## 🔧 Scripts Disponibles

### Docker (MongoDB)
```bash
# Iniciar MongoDB
docker-compose up -d

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener MongoDB
docker-compose down

# Limpiar volúmenes (borra datos)
docker-compose down -v

# Iniciar con Mongo Express (admin interface)
docker-compose --profile admin up -d
```

### Desarrollo Local
```bash
# Frontend
cd ponti-frontend && pnpm dev

# Backend
cd ponti-api && pnpm dev
```

## 🌐 Endpoints de la API

### Health Check
- `GET /health` - Verificar estado de la API

### Próximos Endpoints
- `POST /auth/login` - Autenticación de usuario
- `GET /auth/me` - Información del usuario autenticado
- `GET /schedule` - Obtener horario académico
- `GET /dashboard` - Obtener datos del dashboard

---

**Proyecto desarrollado para la Universidad Pontificia Bolivariana**
