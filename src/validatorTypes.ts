interface BaseValidator<T> {
  type: T;
  optional: boolean; // default is required
}

interface StringOptions {
  minLength?: [number, string];
  maxLength?: [number, string];
  pattern?: [RegExp, string];
}

interface NumberOptions {
  max?: [number, string];
  min?: [number, string];
  is?: ['integer' | 'float', string];
}

export type StringValidator = BaseValidator<'string'> & StringOptions;
export type NumberValidator = BaseValidator<'number'> & NumberOptions;
export type BooleanValidator = BaseValidator<'boolean'>;

export type ArrayValidator = BaseValidator<'array'> & {
  of?: Validator;
  shape?: Validator[];
};

export type ObjectValidator = BaseValidator<'object'> & {
  of?: Validator;
  shape?: { [key: string]: Validator };
};

export type Validator =
  | StringValidator
  | NumberValidator
  | BooleanValidator
  | ArrayValidator
  | ObjectValidator;

export type InferValidator<T> = T extends string
  ? StringValidator
  : T extends number
  ? NumberValidator
  : T extends boolean
  ? BooleanValidator
  : T extends Array<any>
  ? ArrayValidator
  : T extends object
  ? ObjectValidator
  : Validator;
