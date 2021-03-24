export type O<V> = V & { optional: true };
export type R<V> = V & { optional: false };
export type V<T> = O<T> | R<T>;

export interface StringOptions {
  type: 'string';
  maxLength?: [number, string];
  minLength?: [number, string];
  pattern?: [RegExp, string];
}

export interface NumberOptions {
  type: 'number';
  max?: [number, string];
  min?: [number, string];
  is?: ['integer' | 'float', string];
}

export interface BooleanOptions {
  type: 'boolean';
}

export interface ListOptions<T> {
  type: 'list';
  shape: T;
}

export interface ListofOptions<T> {
  type: 'listof';
  of: T;
}

export interface RecordOptions<T> {
  type: 'record';
  shape: T;
}

export interface RecordofOptions<T> {
  type: 'recordof';
  of: T;
}

export type BooleanValidator = V<BooleanOptions>;
export type StringValidator = V<StringOptions>;
export type NumberValidator = V<NumberOptions>;
export type ListValidator<T extends Validator[]> = V<ListOptions<T>>;
export type ListofValidator<T extends Validator> = V<ListofOptions<T>>;
export type RecordValidator<T extends Schema> = V<RecordOptions<T>>;
export type RecordofValidator<T extends Validator> = V<RecordofOptions<T>>;

export type Validator =
  | StringValidator
  | NumberValidator
  | BooleanValidator
  | ListofValidator<any>
  | ListValidator<any[]>
  | RecordValidator<any>
  | RecordofValidator<any>;

export interface Schema {
  [key: string]: Validator;
}
