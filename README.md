# ContactBook

Libreta de contactos con **React** (frontend), **Node.js + Express** (API) y **MongoDB** (base de datos), contenerizada con Docker Compose para que corra igual en cualquier máquina.

[![CI](https://github.com/Dayron-Encarnacion-Arias/ContactBook-App/actions/workflows/ci.yml/badge.svg)](https://github.com/Dayron-Encarnacion-Arias/ContactBook-App/actions/workflows/ci.yml)
[![CD](https://github.com/Dayron-Encarnacion-Arias/ContactBook-App/actions/workflows/cd.yml/badge.svg)](https://github.com/Dayron-Encarnacion-Arias/ContactBook-App/actions/workflows/cd.yml)

## Pipeline CI/CD

El proyecto usa GitHub Actions con dos workflows en `.github/workflows/`.

### En cada pull request hacia `main` (`ci.yml`)

| Job | Qué hace |
|---|---|
| `api` | `npm ci`, `npm run lint` (ESLint) y `npm test` (Vitest + Supertest) en `api/` |
| `web` | `npm ci`, `npm run lint`, `npm test` y `npm run build` en `web/` |
| `docker` | Cuando `api` y `web` pasan, construye las imágenes con `docker compose build` |

Los tres checks son **obligatorios**: la rama `main` tiene una regla que exige pull request, que `api`, `web` y `docker` estén en verde y bloquea el force push. Un PR con un check en rojo no se puede fusionar.

### Al hacer merge a `main` o crear un tag `v*.*.*` (`cd.yml`)

Una matriz construye y publica las dos imágenes en GitHub Container Registry, con caché de capas `type=gha`:

- `ghcr.io/dayron-encarnacion-arias/contactbook-api`
- `ghcr.io/dayron-encarnacion-arias/contactbook-web`

| Evento | Tags publicados |
|---|---|
| Merge a `main` | `sha-<commit>` y `latest` |
| Tag de Git `v1.0.0` | `1.0.0` y `1.0` |

```bash
docker pull ghcr.io/dayron-encarnacion-arias/contactbook-api:latest
docker pull ghcr.io/dayron-encarnacion-arias/contactbook-web:1.0.0
```

### Secrets y variables

- El login a GHCR usa `secrets.GITHUB_TOKEN`, el token automático de GitHub Actions: no hay tokens personales en el repositorio.
- `VITE_API_URL` es una **variable del repositorio** (`Settings › Secrets and variables › Actions › Variables`) que llega al build del frontend como `build-arg`.
- Ningún secreto se escribe en los workflows ni se imprime en los logs.

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

## Capturas

En [`docs/capturas/`](docs/capturas/):

| Archivo | Qué muestra |
|---|---|
| `01-docker-compose-ps.png` | `docker compose ps` con mongo, api y web en estado `healthy` |
| `02-contactbook-localhost-8080.png` | ContactBook en http://localhost:8080 con contactos creados |
| `03-tema-cereza.png`, `04-tema-medianoche.png` | Otros esmaltes (temas) de la interfaz |
| `05-nuevo-contacto.png` | Formulario para pegar un contacto nuevo |

## El diseño: la puerta de la nevera

La interfaz imita la puerta de la nevera, donde en casa se pegan los números que importan:

- Cada contacto es una nota sostenida por un **imán del color de su categoría** (azul personal, ámbar trabajo, magenta otro), con la inicial grabada.
- **Esmaltes** (temas): Menta, Mantequilla, Cereza y Medianoche, más un dial **«A tu gusto»** que repinta toda la página en vivo. Toda la paleta sale de tres números OKLCH, y el cambio de esmalte se «vierte» de arriba abajo.
- Al **buscar o filtrar**, las notas que no coinciden se despegan y caen y las demás se reacomodan (View Transitions).
- Las **palabras guía** fijas arriba muestran el primer y el último nombre a la vista, como en un diccionario.
- Lo **recién pegado** queda marcado hasta que lo ves.
- Respeta `prefers-reduced-motion`.

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
