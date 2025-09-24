const { RuleTester } = require('eslint');
const rule = require('../../../../lib/rules/enforce-tfunction-type');
const tsParser = require('@typescript-eslint/parser');

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    sourceType: 'module',
    ecmaVersion: 2018,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

const cases = {
  valid: [
    // Already using TFunction
    {
      code: `
        import { TFunction } from 'i18next';
        const t: TFunction = (key) => key;
      `,
    },
    // Type alias using TFunction
    {
      code: `
        import { TFunction } from 'i18next';
        type TranslateFunction = TFunction;
        const t: TranslateFunction = (key) => key;
      `,
    },
    // Interface extending TFunction
    {
      code: `
        import { TFunction } from 'i18next';
        interface CustomTFunction extends TFunction {}
        const t: CustomTFunction = (key) => key;
      `,
    },
    // Non-translation function types
    {
      code: `
        type StringProcessor = (input: number) => string;
        const processor: StringProcessor = (input) => input.toString();
      `,
    },
    {
      code: `
        type EventHandler = (event: Event) => void;
        const handler: EventHandler = (event) => console.log(event);
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
  ],
};

ruleTester.run('enforce-tfunction-type', rule, cases);
