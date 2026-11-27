import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('API de ContactBook', () => {
    it('GET / responde que la API está funcionando', async () => {
        const res = await request(app).get('/');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
    });

    it('una ruta que no existe devuelve 404', async () => {
        const res = await request(app).get('/ruta-que-no-existe');

        expect(res.status).toBe(404);
    });
});