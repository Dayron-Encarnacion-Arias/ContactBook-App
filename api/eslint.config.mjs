import js from '@eslint/js';
import globals from 'globals';

export default [
    // Carpetas que ESLint no debe revisar
    { ignores: ['node_modules/', 'logs/', 'coverage/'] },

    js.configs.recommended,

    // Código de la API: CommonJS (require / module.exports) en Node
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: globals.node,
        },
        rules: {
            // Express necesita "next" en los manejadores de errores aunque no se use,
            // y los catch pueden ignorar el error
            'no-unused-vars': ['error', { argsIgnorePattern: '^next$', caughtErrors: 'none' }],
        },
    },

    // Tests: módulos ES (import / export)
    {
        files: ['tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
        },
    },
];