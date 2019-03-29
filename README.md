# eslint-plugin-i18next

ESLint plugin for i18n

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-i18next`:

```
$ npm install eslint-plugin-i18next --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-i18next` globally.

## Usage

Add `i18next` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "i18next"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "i18next/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here





