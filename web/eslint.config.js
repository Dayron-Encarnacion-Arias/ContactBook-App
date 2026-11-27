import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    // Carpetas que ESLint no debe revisar
    { ignores: ['dist/', 'node_modules/', 'coverage/'] },

    js.configs.recommended,

    // Código de React (navegador)
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: { 'react-hooks': reactHooks },
        rules: {
            ...reactHooks.configs.recommended.rules,
            // Los componentes se usan dentro de JSX: ESLint no los ve como "usados"
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
        },
    },

    // Archivos de configuración y tests: corren en Node
    {
        files: ['vite.config.js', 'eslint.config.js', 'tests/**/*.js'],
        languageOptions: { globals: globals.node },
    },
];