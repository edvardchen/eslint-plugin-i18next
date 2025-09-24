import { TFunction } from 'i18next';

// Already using TFunction - should be valid
const t1: TFunction = (key: string) => key;

// Type alias using TFunction - should be valid
type MyTranslateFunction = TFunction;
const t2: MyTranslateFunction = (key: string) => key;

// Interface extending TFunction - should be valid
interface CustomTFunction extends TFunction {
  customMethod?: () => void;
}
const t3: CustomTFunction = (key: string) => key;

// Non-translation functions - should be valid
type StringProcessor = (input: number) => string;
const processor: StringProcessor = (num) => num.toString();

type EventHandler = (event: Event) => void;
const handler: EventHandler = (event) => console.log(event);

// Return types other than string - should be valid
type NumberFunction = (key: string) => number;
const numFn: NumberFunction = (key) => key.length;

// Different parameter types - should be valid
type CustomFunction = (data: object) => string;
const customFn: CustomFunction = (data) => JSON.stringify(data);

// Generic functions - should be valid
type GenericFunction<T> = (input: T) => string;
const genericFn: GenericFunction<number> = (input) => input.toString();