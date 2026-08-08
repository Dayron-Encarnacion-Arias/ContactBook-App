# ContactBook API

API RESTful para gestionar una libreta de contactos. Construida con Node.js y Express.

## Instalación
1. Clona el repositorio.
2. Ejecuta `npm install`.
3. Crea un archivo `.env` basado en `.env.example`.
4. Ejecuta `npm run dev` (o `node server.js`).

## Usuario de Prueba (Admin)
Al iniciar el servidor, se siembra el siguiente usuario automáticamente:
- **Email:** admin@contactbook.com
- **Password:** admin123
- **Rol:** admin

*Nota sobre GET /contacts:* Decidí dejar el endpoint `GET /contacts` público (sin JWT), pero lo protegí con un middleware de ruta personalizado que exige el header `x-api-client` para demostrar la aplicación del middleware de ruta específico de la Unidad 2.

## Endpoints Principales
- `POST /auth/register` (Público)
- `POST /auth/login` (Público)
- `GET /contacts` (Público, requiere header `x-api-client`)
- `GET /contacts/:id` (Público)
- `POST /contacts` (Requiere Token)
- `PUT /contacts/:id` (Requiere Token)
- `DELETE /contacts/:id` (Requiere Token y Rol 'admin')