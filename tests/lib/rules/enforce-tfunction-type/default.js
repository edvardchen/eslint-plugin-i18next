const RuleTester = require('eslint').RuleTester;
const path = require('path');
const rule = require('../../../../lib/rules/enforce-tfunction-type');
const tsParser = require('@typescript-eslint/parser');
const testFile = require('../../helpers/testFile-enforce-tfunction');

const tsTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
    },
  },
});

tsTester.run('enforce-tfunction-type', rule, {
  valid: [
    // Fixture-based test for comprehensive valid cases
    {
      ...testFile('valid-samples.ts'),
      filename: path.resolve(
        __dirname,
        '../../fixtures/enforce-tfunction-type/valid-samples.ts'
      ),
      languageOptions: {
        parserOptions: {
          project: path.resolve(__dirname, 'tsconfig.json'),
          tsconfigRootDir: __dirname,
        },
      },
    },

    // Additional inline tests for edge cases
    // Function with different parameter name
    {
      code: `
        type StringFunction = (translationKey: number) => string;
        const fn: StringFunction = (translationKey) => translationKey.toString();
      `,
    },
    // Function returning non-string
    {
      code: `
        type BooleanFunction = (key: string) => boolean;
        const fn: BooleanFunction = (key) => key.length > 0;
      `,
    },
    // Multiple parameters but not TFunction-like
    {
      code: `
        type MultiParamFunction = (a: string, b: string) => string;
        const fn: MultiParamFunction = (a, b) => a + b;
      `,
    },
  ],

  invalid: [
    // Type alias that matches TFunction signature
    {
      code: `
        type CustomTranslate = (key: string) => string;
        const t: CustomTranslate = (key) => key;
      `,
      errors: [
        {
          messageId: 'importTFunction',
          line: 2,
        },
      ],
      output: `
        import { TFunction } from 'i18next';
type CustomTranslate = TFunction;
        const t: CustomTranslate = (key) => key;
      `,
    },

    // Interface with call signature matching TFunction
    {
      code: `
        interface ITranslate {
          (key: string): string;
        }
        const t: ITranslate = (key) => key;
      `,
      errors: [
        {
          messageId: 'importTFunction',
          line: 2,
        },
      ],
      output: `
        import { TFunction } from 'i18next';
type ITranslate = TFunction;
        const t: ITranslate = (key) => key;
      `,
    },

    // Variable with inline type annotation
    {
      code: `
        const t: (key: string) => string = (key) => key;
      `,
      errors: [
        {
          messageId: 'importTFunction',
          line: 2,
        },
      ],
      output: `
        import { TFunction } from 'i18next';
const t: TFunction = (key) => key;
      `,
    },

    // With existing i18next import but no TFunction
    {
      code: `
        import { i18n } from 'i18next';
        type CustomTranslate = (key: string) => string;
        const t: CustomTranslate = (key) => key;
      `,
      errors: [
        {
          messageId: 'importTFunction',
          line: 3,
        },
      ],
      output: `
        import { i18n, TFunction } from 'i18next';
        type CustomTranslate = TFunction;
        const t: CustomTranslate = (key) => key;
      `,
    },

    // Complex TFunction-like signature
    {
      code: `
        type TranslateWithOptions = (key: string, options?: any) => string;
        const t: TranslateWithOptions = (key, options) => key;
      `,
      errors: [
        {
          messageId: 'importTFunction',
          line: 2,
        },
      ],
      output: `
        import { TFunction } from 'i18next';
type TranslateWithOptions = TFunction;
        const t: TranslateWithOptions = (key, options) => key;
      `,
    },

    // Different parameter name but same signature
    {
      code: `
        type TranslateFn = (translationKey: string) => string;
        const t: TranslateFn = (translationKey) => translationKey;
      `,
      errors: [
        {
          messageId: 'importTFunction',
          line: 2,
        },
      ],
      output: `
        import { TFunction } from 'i18next';
type TranslateFn = TFunction;
        const t: TranslateFn = (translationKey) => translationKey;
      `,
    },

    // Interface with multiple call signatures (should still detect the TFunction-like one)
    {
      code: `
        interface MultiInterface {
          (key: string): string;
          someMethod(): void;
        }
        const t: MultiInterface = (key) => key;
      `,
      errors: [
        {
          messageId: 'importTFunction',
          line: 2,
        },
      ],
      output: `
        import { TFunction } from 'i18next';
type MultiInterface = TFunction;
        const t: MultiInterface = (key) => key;
      `,
    },
  ],
});
