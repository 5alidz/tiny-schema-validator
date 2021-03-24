import {
  O,
  BooleanValidator,
  ListValidator,
  ListofValidator,
  NumberValidator,
  RecordValidator,
  RecordofValidator,
  Schema,
  StringValidator,
} from './validatorTypes';

export type DataFrom<S extends Schema> = {
  [K in keyof S]: InferDataType<S[K]>;
};

type InferTypeWithOptional<T, U> = T extends O<T> ? U | undefined : U;

type InferDataType<T> = T extends StringValidator
  ? InferTypeWithOptional<T, string>
  : T extends NumberValidator
  ? InferTypeWithOptional<T, number>
  : T extends BooleanValidator
  ? InferTypeWithOptional<T, boolean>
  : T extends ListValidator<infer U>
  ? InferTypeWithOptional<T, { [K in keyof U]: InferDataType<U[K]> }>
  : T extends ListofValidator<infer V>
  ? InferTypeWithOptional<T, InferDataType<V>[]>
  : T extends RecordValidator<infer S>
  ? InferTypeWithOptional<T, { [K in keyof S]: InferDataType<S[K]> }>
  : T extends RecordofValidator<infer V>
  ? InferTypeWithOptional<T, { [key: string]: InferDataType<V> }>
  : never;

export type IsPlainObject<T, U> = T extends object ? (T extends Array<any> ? never : U) : never;

export type FieldError<T> = T extends object | void
  ? T extends Array<infer U> | void
    ? string | ErrorsFrom<{ [key: number]: U }>
    : string | ErrorsFrom<T>
  : string;

export type ErrorsFrom<T> = IsPlainObject<
  T,
  Partial<
    {
      [K in keyof T]: FieldError<T[K]>;
    }
  >
>;
