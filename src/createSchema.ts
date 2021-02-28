import { isPlainObject } from './utils';
import { Validator, ObjectValidator, createErrors } from './validators';

export interface Schema {
  [key: string]: Validator;
}

export const createSchema = <T>(_schema: Schema) => {
  if (!isPlainObject(_schema)) throw new Error('schema should be a valid object');

  const schema = Object.freeze({ ..._schema });

  function validate(data: unknown) {
    if (!isPlainObject(data)) {
      throw new Error('data should be a valid object');
    }
    const errors = createErrors(schema, data);
    return Object.keys(errors).length > 0 ? errors : null;
  }

  function is(data: unknown): data is T {
    const errors = validate(data);
    return !errors;
  }

  function toObjectValidator(config?: { optional: boolean }): ObjectValidator {
    const _config = config || { optional: false };
    return { type: 'object', shape: schema, ..._config };
  }

  function produce(data: unknown) {
    if (is(data)) {
      return data;
    }
    throw new Error('invalid data');
  }

  return {
    validate,
    toObjectValidator,
    produce,
    is,
  };
};
