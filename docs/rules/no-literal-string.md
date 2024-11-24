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
  framework: 'react' | 'vue';
  mode?: 'jsx-text-only' | 'jsx-only' | 'all' | 'vue-template-ony';
  message?: string;
  'should-validate-template'?: boolean;
};
```

### `exclude` and `include`

Instead of expanding options immoderately, a standard and scalable way to set options is provided

You can use `exclude` and `include` of each options to control which should be validated and which should be ignored.

The values of these two fields are treated as regular expressions.

1. If both are used, both conditions need to be satisfied
2. If both are emitted, it will be validated

### Option `words`

`words` decides whether literal strings are allowed (in any situation), solely based on **the content of the string**

e.g. if `.*foo.*` is excluded, the following literals are allowed no matter where they are used

```js
method('afoo');
const message = 'foob';

<Component value="foo" />;
```

### Selector options

- `jsx-components` decides whether literal strings as children within a component are allowed, based on the component name

  e.g. by default, `Trans` is excluded, so `Hello World` in the following is allowed.

  ```jsx
  <Trans i18nKey="greeting">Hello World</Trans>
  ```

- `jsx-attributes` decides whether literal strings are allowed as JSX attribute values, based on the name of the attribute

  e.g. if `data-testid` is excluded, `important-button` in the following is allowed

  ```jsx
  <button data-testid="important-button" onClick={handleClick}>
    {t('importantButton.label')}
  </button>
  ```

- `callees` decides whether literal strings are allowed as function arguments, based on the identifier of the function being called

  e.g. if `window.open` is excluded, `http://example.com` in the following is allowed

  ```js
  window.open('http://example.com');
  ```

  `callees` also covers object constructors, such as `new Error('string')` or `new URL('string')`

- `object-properties` decides whether literal strings are allowed as object property values, based on the property key

  e.g. if `fieldName` is excluded but `label` is not, `currency_code` is allowed but `Currency` is not:

  ```js
  const fieldConfig = {
    fieldName: 'currency_code',
    label: 'Currency',
  };
  ```

- `class-properties` decides whether literal strings are allowed as class property values, based on the property key

  e.g. by default, `displayName` is excluded, so `MyComponent` is allowed

  ```js
  class My extends Component {
    displayName = 'MyComponent';
  }
  ```

### Other options

- `framework` specifies the type of framework currently in use.
  - `react` It defaults to 'react' which means you want to validate react component
  - `vue` If you want to validate vue component, can set the value to be this
- `mode` provides a straightforward way to decides the range you want to validate literal strings.
  It defaults to `jsx-text-only` which only forbids to write plain text in JSX markup,available when framework option is 'react'
  - `jsx-only` validates the JSX attributes as well,available when framework option is 'react'
  - `all` validates all literal strings,available when the value of the framework option is 'react' and 'vue'
  - `vue-template-only`, only validate vue component template part,available when framework option value is 'vue'.
- `message` defines the custom error message
- `should-validate-template` decides if we should validate the string templates

You can see [the default options here](../../lib/options/defaults.js)

## When Not To Use It

Your project maybe not need to support multi-language or you don't care to spread literal string anywhere.
