// Custom type aliases that should use TFunction
type CustomTranslate = (key: string) => string;
type TranslationFunction = (key: string, options?: any) => string;
type I18nFunction = (key: string, data?: object) => string;

// Interface with call signature that should use TFunction
interface ITranslate {
  (key: string): string;
}

interface TranslateInterface {
  (key: string, options?: any): string;
}

// Variables with inline types that should use TFunction
const translate1: (key: string) => string = (key) => key;
const translate2: (key: string, options?: any) => string = (key, options) => key;
const translate3: (translationKey: string) => string = (translationKey) => translationKey;

// Arrow function type that should use TFunction
type ArrowTranslate = (key: string) => string;

// Function type with more complex signature
type ComplexTranslate = (key: string, options?: { [key: string]: any }) => string;