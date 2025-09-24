const RuleTester = require('eslint').RuleTester;
const rule = require('../../../../lib/rules/enforce-tfunction-type');
const tsParser = require('@typescript-eslint/parser');

const tsTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
    },
  },
});

tsTester.run('enforce-tfunction-type: edge-cases', rule, {
  valid: [
    // Already imported TFunction and using it correctly
    {
      code: `
        import { TFunction } from 'i18next';
        const translate: TFunction = (key) => key;
      `,
    },

    // Different return types should be ignored
    {
      code: `
        type NumberTranslator = (key: string) => number;
        const translate: NumberTranslator = (key) => key.length;
      `,
    },

    // Different first parameter type should be ignored
    {
      code: `
        type ObjectTranslator = (obj: object) => string;
        const translate: ObjectTranslator = (obj) => JSON.stringify(obj);
      `,
    },

    // Multiple parameters with first not being string should be ignored
    {
      code: `
        type MultiTranslator = (count: number, key: string) => string;
        const translate: MultiTranslator = (count, key) => key.repeat(count);
      `,
    },

    // Generic type should be ignored
    {
      code: `
        type GenericTranslator<T> = (input: T) => string;
        const translate: GenericTranslator<string> = (input) => input;
      `,
    },
  ],

  invalid: [
    // Should detect common translation function patterns
    {
      code: `
        type T = (key: string) => string;
      `,
      errors: [{ messageId: 'importTFunction' }],
      output: `
        import { TFunction } from 'i18next';
type T = TFunction;
      `,
    },

    // Should detect with different parameter names
    {
      code: `
        type T = (translationKey: string) => string;
      `,
      errors: [{ messageId: 'importTFunction' }],
      output: `
        import { TFunction } from 'i18next';
type T = TFunction;
      `,
    },

    {
      code: `
        type T = (i18nKey: string) => string;
      `,
      errors: [{ messageId: 'importTFunction' }],
      output: `
        import { TFunction } from 'i18next';
type T = TFunction;
      `,
    },

    // Should detect interface call signatures
    {
      code: `
        interface TranslatorInterface {
          (key: string): string;
        }
      `,
      errors: [{ messageId: 'importTFunction' }],
      output: `
        import { TFunction } from 'i18next';
type TranslatorInterface = TFunction;
      `,
    },

    // Should handle complex signatures with optional parameters
    {
      code: `
        type ComplexTranslator = (key: string, options?: { ns?: string }) => string;
      `,
      errors: [{ messageId: 'importTFunction' }],
      output: `
        import { TFunction } from 'i18next';
type ComplexTranslator = TFunction;
      `,
    },

    // Should handle arrow function type literals
    {
      code: `
        const t: (key: string) => string = (key) => key;
      `,
      errors: [{ messageId: 'importTFunction' }],
      output: `
        import { TFunction } from 'i18next';
const t: TFunction = (key) => key;
      `,
    },

    // Should handle when i18next import exists but no TFunction
    {
      code: `
        import { i18n, Resource } from 'i18next';
        type Translator = (key: string) => string;
      `,
      errors: [{ messageId: 'importTFunction' }],
      output: `
        import { i18n, Resource, TFunction } from 'i18next';
        type Translator = TFunction;
      `,
    },
  ],
});
