import type { ESLint, Linter } from 'eslint';

declare const plugin: ESLint.Plugin & {
    configs: {
        'flat/recommended': Linter.Config;
        'recommended': ESLint.ConfigData;
    }
};

export = plugin;
