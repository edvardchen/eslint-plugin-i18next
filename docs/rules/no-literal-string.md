# disallow literal string (no-literal-string)

This rule aims to avoid developers to display literal string directly to users without translating them.

## Rule Details

Example of incorrect code:

```jsx
/*eslint i18next/no-literal-string: "error"*/
<div>hello world</div>
```

Example of correct code:

```jsx
/*eslint i18next/no-literal-string: "error"*/
<div>{i18next.t('HELLO_KEY')}</div>
```

## Options

The option's typing definition looks like:

```typescript
type MySchema = {
  [key in
    | 'words'
    | 'jsx-components'
    | 'jsx-attributes'
    | 'callees'
    | 'object-properties'
    | 'class-properties']?: {
    include?: string[];
    exclude?: string[];
  };
} & {
  mode?: 'jsx-text-only' | 'jsx-only' | 'all';
  message?: string;
  'should-validate-template'?: boolean;
};
```

### `exclude` and `include`

Instead of expanding options immoderately, a standard and scalable way to set options is provided

You cam use `exclude` and `include` of each options to control which should be validated and which should be ignored.

The values of these two fields are treated as regular expressions.

1. If both are used, both conditions need to be satisfied
2. If both are emitted, it will be validated

For selectors,

- `words` controls plain text
- `jsx-components` controls JSX elements
- `jsx-attributes` controls JSX elements' attributes
- `callees` controls function calls
- `object-properties` controls objects' properties
- `class-properties` controls classes' properties

Other options,

- `mode` provides a straightforward way to decides the range you want to validate literal strings.
  It defaults to `jsx-text-only` which only forbids to write plain text in JSX markup
  - `jsx-only` validates the JSX attributes as well
  - `all` validates all literal strings
- `message` defines the custom error message
- `should-validate-template` decides if we should validate the string templates

You can see [the default options here](../../lib/options/defaults.json)

## When Not To Use It

Your project maybe not need to support multi-language or you don't care to spread literal string anywhere.
