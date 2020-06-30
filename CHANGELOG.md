# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.1.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v4.0.0...v4.1.0) (2020-06-30)


### Features

* support multibyte characters ([99ed9f2](https://github.com/edvardchen/eslint-plugin-i18next/commit/99ed9f2))

## [4.0.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v3.8.0...v4.0.0) (2020-06-28)


### ⚠ BREAKING CHANGES

* all patterns in ignoreCallee would be treated as regular expression

### Features

* allow regex in ignore and ignoreCallee ([0cfe340](https://github.com/edvardchen/eslint-plugin-i18next/commit/0cfe340)), closes [#19](https://github.com/edvardchen/eslint-plugin-i18next/issues/19)

## [3.8.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v3.7.0...v3.8.0) (2020-06-03)


### Features

* add markupOnly option ([7bb225c](https://github.com/edvardchen/eslint-plugin-i18next/commit/7bb225c))

## [3.7.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v3.6.0...v3.7.0) (2020-05-06)


### Features

* ignore element ([b98e0f8](https://github.com/edvardchen/eslint-plugin-i18next/commit/b98e0f8))
* ignore element ([56b8b08](https://github.com/edvardchen/eslint-plugin-i18next/commit/56b8b08))

## [3.6.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v3.5.0...v3.6.0) (2020-04-17)


### Features

* support to access enum value through string like Enum['key'] ([db68147](https://github.com/edvardchen/eslint-plugin-i18next/commit/db68147))

## [3.5.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v3.4.0...v3.5.0) (2020-04-16)


### Features

* ignore JSX attrs style and key ([34a5d6d](https://github.com/edvardchen/eslint-plugin-i18next/commit/34a5d6d))

## [3.4.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v3.3.0...v3.4.0) (2020-04-14)


### Features

* recognize ImportExpresion ([e54daee](https://github.com/edvardchen/eslint-plugin-i18next/commit/e54daee))

## [3.3.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v3.2.0...v3.3.0) (2020-02-11)


### Features

* ignore property ([3355026](https://github.com/edvardchen/eslint-plugin-i18next/commit/3355026))

## [3.2.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v3.1.1...v3.2.0) (2019-10-21)


### Features

* allow displayName property in classes ([5362281](https://github.com/edvardchen/eslint-plugin-i18next/commit/5362281))

### [3.1.1](https://github.com/edvardchen/eslint-plugin-i18next/compare/v3.1.0...v3.1.1) (2019-10-10)


### Bug Fixes

* add missing plugin in recommended config ([dde83ed](https://github.com/edvardchen/eslint-plugin-i18next/commit/dde83ed))

## [3.1.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v3.0.0...v3.1.0) (2019-10-10)


### Features

* ignore not-word string ([1752cbe](https://github.com/edvardchen/eslint-plugin-i18next/commit/1752cbe))

## [3.0.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v2.5.0...v3.0.0) (2019-10-09)


### ⚠ BREAKING CHANGES

* SInce the whitelist was cut short, it would complain when the removed attributes
were added to custom component like <Foo src="hello" />

### Features

* ignore most DOM attrs ([71483c2](https://github.com/edvardchen/eslint-plugin-i18next/commit/71483c2))

## [2.5.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v2.4.0...v2.5.0) (2019-10-08)


### Features

* add more ignored attributes and callee ([0f9e2ec](https://github.com/edvardchen/eslint-plugin-i18next/commit/0f9e2ec))

## [2.4.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v2.3.1...v2.4.0) (2019-10-08)


### Features

* add ignoreAttribute option ([c854313](https://github.com/edvardchen/eslint-plugin-i18next/commit/c854313))

### [2.3.1](https://github.com/edvardchen/eslint-plugin-i18next/compare/v2.3.0...v2.3.1) (2019-09-16)


### Bug Fixes

* whitelist addEventListener and few SVG attributes ([46241a6](https://github.com/edvardchen/eslint-plugin-i18next/commit/46241a6))

## [2.3.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v2.2.0...v2.3.0) (2019-07-26)


### Features

* skip literal in SwitchCase statement ([d270343](https://github.com/edvardchen/eslint-plugin-i18next/commit/d270343)), closes [#2](https://github.com/edvardchen/eslint-plugin-i18next/issues/2)



## [2.2.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v2.1.1...v2.2.0) (2019-07-24)


### Bug Fixes

* enhance ExportNamedDeclaration ([29e9f29](https://github.com/edvardchen/eslint-plugin-i18next/commit/29e9f29))


### Features

* allow string comparison ([a78d150](https://github.com/edvardchen/eslint-plugin-i18next/commit/a78d150))



### [2.1.1](https://github.com/edvardchen/eslint-plugin-i18next/compare/v2.1.0...v2.1.1) (2019-07-24)



## [2.1.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v2.0.0...v2.1.0) (2019-07-11)


### Features

* more TS supports ([382ccab](https://github.com/edvardchen/eslint-plugin-i18next/commit/382ccab))
* skip literal with LiteralType ([40c54b1](https://github.com/edvardchen/eslint-plugin-i18next/commit/40c54b1))



## [2.0.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v1.2.0...v2.0.0) (2019-07-10)


### Bug Fixes

* wrongly handle Literal node in VExpressionContainer ([dd279c6](https://github.com/edvardchen/eslint-plugin-i18next/commit/dd279c6))


### Features

* dont check literal in export declaration ([1527eae](https://github.com/edvardchen/eslint-plugin-i18next/commit/1527eae))
* dont check TSLiteralType ([fd93861](https://github.com/edvardchen/eslint-plugin-i18next/commit/fd93861))


### refactor

* use rule selectors to reduce code complexity ([28d73ff](https://github.com/edvardchen/eslint-plugin-i18next/commit/28d73ff))


### BREAKING CHANGES

* Disable fix because key in the call i18next.t(key) ussally was not same as the plain text



## [1.2.0](https://github.com/edvardchen/eslint-plugin-i18next/compare/v1.1.3...v1.2.0) (2019-06-20)


### Features

* skip checking import(...) ([7306038](https://github.com/edvardchen/eslint-plugin-i18next/commit/7306038))



## [1.1.3](https://github.com/edvardchen/eslint-plugin-i18next/compare/v1.1.2...v1.1.3) (2019-04-08)


### Bug Fixes

* disallow uppercase strings in JSX ([715cba4](https://github.com/edvardchen/eslint-plugin-i18next/commit/715cba4))



## [1.1.2](https://github.com/edvardchen/eslint-plugin-i18next/compare/v1.1.1...v1.1.2) (2019-04-08)
