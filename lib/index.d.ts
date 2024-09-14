import type { ESLint } from 'eslint';

declare const plugin: ESLint.Plugin & {
    configs: {
        'flat/recommended': ESLint.ConfigData
    }
};

export = plugin;
