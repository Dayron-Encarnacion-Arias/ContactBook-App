# ContactBook

Libreta de contactos con **React** (frontend), **Node.js + Express** (API) y **MongoDB** (base de datos), contenerizada con Docker Compose para que corra igual en cualquier máquina.

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine) con **Docker Compose v2** (`docker compose version`).
- Git.
- Los puertos **3000** y **8080** libres en la máquina.

No hace falta instalar Node ni MongoDB: todo corre en contenedores.

## Levantar el proyecto desde cero

```bash
# 1. Clonar el repositorio
git clone https://github.com/Dayron-Encarnacion-Arias/contactbook-api.git
cd contactbook-api

# 2. Crear el .env a partir de la plantilla (y cambiar los valores)
cp .env.example .env          # en PowerShell: Copy-Item .env.example .env

# 3. Construir las imágenes y levantar los tres servicios
docker compose up -d --build

# 4. Comprobar el estado (mongo debe salir "healthy")
docker compose ps
```

La API espera a que Mongo esté `healthy` antes de arrancar y, al iniciar, siembra el usuario admin con `ADMIN_EMAIL` y `ADMIN_PASSWORD` del `.env`.

## Puertos y URLs

| Servicio | URL | Descripción |
|---|---|---|
| web | http://localhost:8080 | Frontend en React servido por Nginx |
| api | http://localhost:3000 | API REST (`GET /` responde que está funcionando) |
| mongo | — | Sin puerto publicado: solo accesible dentro de la red de Compose como `mongo:27017` |

Para probarlo: abre http://localhost:8080, entra con el admin del `.env` (o crea una cuenta) y agrega un contacto.

## Detener y borrar los datos

```bash
# Detener los contenedores (los datos de Mongo se conservan en el volumen)
docker compose down

# Detener y BORRAR los datos (elimina el volumen mongo-data)
docker compose down -v

# Ver los logs de un servicio
docker compose logs -f api
```

## Variables de entorno

Todas están en [`.env.example`](.env.example); el `.env` real está en `.gitignore` y nunca se sube.

| Variable | Uso |
|---|---|
| `MONGO_USER`, `MONGO_PASSWORD` | Usuario root que crea Mongo la primera vez y con el que se conecta la API |
| `MONGO_DB` | Nombre de la base de datos |
| `JWT_SECRET` | Secreto para firmar los tokens |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Usuario admin sembrado al iniciar la API |
| `CORS_ORIGIN` | Origen del frontend que puede llamar a la API |
| `VITE_API_URL` | URL de la API vista desde el navegador; se incrusta al compilar React (si cambia, hay que reconstruir `web`) |

> Si cambias `MONGO_USER` o `MONGO_PASSWORD` después del primer arranque, borra el volumen (`docker compose down -v`): Mongo solo crea el usuario root cuando la carpeta de datos está vacía.

## Estructura

```
├── api/                 # API Node.js + Express + Mongoose
│   ├── Dockerfile       # multi-stage, node:22-alpine, USER node
│   ├── .dockerignore
│   └── src/
├── web/                 # Frontend React + Vite
│   ├── Dockerfile       # multi-stage: build con Node, se sirve con Nginx
│   ├── .dockerignore
│   ├── nginx.conf       # try_files para las rutas de React Router
│   └── src/
├── docs/capturas/       # Evidencia: docker compose ps y la app funcionando
├── docker-compose.yml
├── .env.example
└── README.md
```

## Endpoints de la API

- `POST /auth/register` (público)
- `POST /auth/login` (público, devuelve el token)
- `GET /contacts` (público, requiere el header `x-api-client`)
- `GET /contacts/:id` (público)
- `POST /contacts` (requiere token)
- `PUT /contacts/:id` (requiere token)
- `DELETE /contacts/:id` (requiere token y rol `admin`)

## Desarrollo sin Docker (opcional)

Con un MongoDB local corriendo:

```bash
cd api && npm install && MONGO_URI=mongodb://localhost:27017/contactbook JWT_SECRET=dev npm run dev
cd web && npm install && npm run dev   # http://localhost:5173
```
