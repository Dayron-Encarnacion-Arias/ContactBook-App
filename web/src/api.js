// La URL de la API se fija al compilar (ARG VITE_API_URL en el Dockerfile)
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

// Error con el código HTTP para poder reaccionar a un 401
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'x-api-client': 'contactbook-web' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(`No se pudo conectar con la API en ${API_URL}`, 0);
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.message || data?.error || `Error ${response.status}`, response.status);
  }
  return data;
}
