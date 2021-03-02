import { isPlainObject } from './utils';
import { createErrors } from './validators';
import { ObjectValidator, Schema } from './validatorsSpec';

export const createSchema = <T>(_schema: Schema) => {
  if (!isPlainObject(_schema)) throw new Error('schema should be a valid object');
  // copy schema to ensure the correctness of the validation
  const schema = Object.freeze({ ..._schema });

  function validate(data: any, eager: boolean = false) {
    const errors = createErrors(schema, data, eager);
    return Object.keys(errors).length > 0 ? errors : null;
  }

  function is(data: any): data is T {
    const errors = validate(data, true);
    return !errors;
  }

  function embed(config = { optional: false }): ObjectValidator {
    return { type: 'object', shape: schema, ...config };
  }

  function produce(data: any) {
    if (is(data)) return data;
    throw new Error('invalid data');
  }

  return {
    validate,
    embed,
    produce,
    is,
  };
};
