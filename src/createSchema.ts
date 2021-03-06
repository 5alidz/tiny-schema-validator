import { isPlainObject, ObjectKeys } from './utils';
import { createErrors } from './validators';
import {
  ArrayValidator,
  BooleanValidator,
  NumberValidator,
  ObjectValidator,
  StringValidator,
  Validator,
} from './validatorTypes';
import { DATAERR, OBJECT, SCHEMAERR } from './constants';
import invariant from 'tiny-invariant';

type IsPlainObject<T, U> = T extends object ? (T extends Array<any> ? never : U) : never;

type FieldError<T> = T extends object | void
  ? T extends Array<infer U> | void
    ? string | ErrorsOf<{ [key: number]: U }>
    : string | ErrorsOf<T>
  : string;

type ErrorsOf<T> = IsPlainObject<
  T,
  Partial<
    {
      [K in keyof T]: FieldError<T[K]>;
    }
  >
>;

type InferValidator<T> = T extends string
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

type SchemaFrom<T> = IsPlainObject<
  T,
  {
    [K in keyof T]: InferValidator<T[K]>;
  }
>;

export function createSchema<T extends { [key: string]: any }>(_schema: SchemaFrom<T>) {
  invariant(isPlainObject(_schema), SCHEMAERR);
  // copy schema to ensure the correctness of the validation
  const schema = Object.freeze({ ..._schema });

  function validate(data: any, eager = false) {
    const errors = createErrors(schema, data, eager);
    return ObjectKeys(errors).length > 0 ? (errors as ErrorsOf<T>) : null;
  }

  function is(data: any | T): data is T {
    const errors = validate(data, true);
    return !errors && isPlainObject(data);
  }

  function embed(config = { optional: false }): ObjectValidator {
    return { type: OBJECT, shape: schema, ...config };
  }

  function produce<U>(data: U): T {
    invariant(is(data), DATAERR);
    return data;
  }

  return {
    validate,
    embed,
    produce,
    is,
  };
}
