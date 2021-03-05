import { isPlainObject, ObjectKeys } from './utils';
import { createErrors } from './validators';
import { ObjectValidator, Validator } from './validatorsSpec';
import { DATAERR, OBJECT, SCHEMAERR } from './constants';
import invariant from 'tiny-invariant';

type FieldError<T> = T extends object | void
  ? T extends Array<infer U> | void
    ? string | ErrorsOf<{ [key: number]: U }>
    : string | ErrorsOf<T>
  : string;

type ErrorsOf<P> = Partial<
  {
    [K in keyof P]: FieldError<P[K]>;
  }
>;

export const createSchema = <T extends Record<string, any>>(
  _schema: { [K in keyof T]: Validator }
) => {
  invariant(isPlainObject(_schema), SCHEMAERR);

  // copy schema to ensure the correctness of the validation
  const schema = Object.freeze({ ..._schema });

  function validate(data: any, eager: boolean = false) {
    const errors = createErrors(schema, data, eager);
    return ObjectKeys(errors).length > 0 ? (errors as ErrorsOf<T>) : null;
  }

  function is(data: any): data is T {
    const errors = validate(data, true);
    return !errors && isPlainObject(data);
  }

  function embed(config = { optional: false }): ObjectValidator {
    return { type: OBJECT, shape: schema, ...config };
  }

  function produce(data: any) {
    invariant(is(data), DATAERR);
    return data;
  }

  return {
    validate,
    embed,
    produce,
    is,
  };
};
