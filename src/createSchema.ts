import { isPlainObject, ObjectKeys } from './utils';
import { createErrors } from './validators';
import { DATAERR, OBJECT, SCHEMAERR } from './constants';
import invariant from 'tiny-invariant';
import { ObjectValidator } from './validatorTypes';
import { SchemaFrom, ErrorsFrom } from './type-utils';

export function createSchema<T extends { [key: string]: any }>(_schema: SchemaFrom<T>) {
  invariant(isPlainObject(_schema), SCHEMAERR);
  // copy schema to ensure the correctness of the validation
  const schema = Object.freeze({ ..._schema });

  function validate(data: any, eager = false) {
    const errors = createErrors(schema, data, eager);
    return ObjectKeys(errors).length > 0 ? (errors as ErrorsFrom<T>) : null;
  }

  function is(data: any): data is T {
    const errors = validate(data, true);
    return !errors && isPlainObject(data);
  }

  function embed(config = { optional: false }): ObjectValidator {
    return { type: OBJECT, shape: schema, ...config };
  }

  function produce(data: any): T {
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
