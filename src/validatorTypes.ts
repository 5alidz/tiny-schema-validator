import { $string, $number, $boolean, $list, $listof, $record, $recordof } from './constants';

interface BaseValidator<T> {
  type: T;
  optional: boolean; // default is required
}

interface StringOptions {
  minLength?: [number, string];
  maxLength?: [number, string];
  pattern?: [RegExp, string];
  oneOf?: string[];
}

interface NumberOptions {
  max?: [number, string];
  min?: [number, string];
  is?: ['integer' | 'float', string];
}

interface ListofOptions {
  of: Validator;
}

interface ListOptions {
  shape: Validator[];
}

interface RecordOptions {
  shape: { [key: string]: Validator };
}

interface RecordofOptions {
  of: Validator;
}

export type StringValidator = BaseValidator<typeof $string> & StringOptions;
export type NumberValidator = BaseValidator<typeof $number> & NumberOptions;
export type BooleanValidator = BaseValidator<typeof $boolean>;
export type ListValidator = BaseValidator<typeof $list> & ListOptions;
export type ListofValidator = BaseValidator<typeof $listof> & ListofOptions;
export type RecordValidator = BaseValidator<typeof $record> & RecordOptions;
export type RecordofValidator = BaseValidator<typeof $recordof> & RecordofOptions;

export type Validator =
  | StringValidator
  | NumberValidator
  | BooleanValidator
  | ListValidator
  | ListofValidator
  | RecordValidator
  | RecordofValidator;

export type InferValidator<T> = T extends string
  ? StringValidator
  : T extends number
  ? NumberValidator
  : T extends boolean
  ? BooleanValidator
  : T extends Array<any>
  ? ListValidator | ListofValidator
  : T extends object
  ? RecordValidator | RecordofValidator
  : Validator;
