import { InferValidator } from './validatorTypes';

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

export type SchemaFrom<T> = IsPlainObject<
  T,
  {
    [K in keyof T]: InferValidator<T[K]>;
  }
>;
