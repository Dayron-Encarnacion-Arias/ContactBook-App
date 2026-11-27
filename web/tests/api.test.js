import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiRequest, ApiError } from '../src/api.js';

// Simula la respuesta de fetch sin llamar a una API real
function mockFetch(status, body) {
    const fetchMock = vi.fn().mockResolvedValue({
        status,
        ok: status >= 200 && status < 300,
        json: () => Promise.resolve(body),
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('apiRequest', () => {
    it('devuelve los datos cuando la API responde bien', async () => {
        mockFetch(200, { data: ['Ana'] });

        const data = await apiRequest('/contacts');

        expect(data).toEqual({ data: ['Ana'] });
    });

    it('envía el token en el header Authorization', async () => {
        const fetchMock = mockFetch(200, {});

        await apiRequest('/contacts', { token: 'abc123' });

        const [, options] = fetchMock.mock.calls[0];
        expect(options.headers.Authorization).toBe('Bearer abc123');
    });

    it('lanza ApiError con el código cuando la API falla', async () => {
        mockFetch(401, { message: 'No autorizado' });

        await expect(apiRequest('/contacts')).rejects.toBeInstanceOf(ApiError);
        await expect(apiRequest('/contacts')).rejects.toMatchObject({ status: 401 });
    });
});