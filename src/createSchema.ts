import { isPlainObject } from './utils';
import { Validator, ObjectValidator, mergeErrors } from './validators';

export interface Schema {
  [key: string]: Validator;
}

interface ISchema<T> {
  validate: (data: T) => Record<string, unknown> | null;
  toObjectValidator: (config?: { optional: boolean }) => ObjectValidator;
  produce: (data: T) => T;
}

export function createSchema<T>(_schema: Schema): Readonly<ISchema<T>> {
  if (!isPlainObject(_schema)) throw new Error('schema should be a valid object');

  const schema = Object.freeze({ ..._schema });
  const schemaKeys = Object.keys(schema);

  const validate: ISchema<T>['validate'] = (data: T) => {
    if (!isPlainObject(data)) {
      throw new Error('data should be a valid object');
    }

    /* handling errors here */
    const errors: Record<string, unknown> = {};

    for (let i = 0; i < schemaKeys.length; i++) {
      const key = schemaKeys[i];
      const validator = schema[key];
      if (!isPlainObject(validator) || !validator) {
        throw new Error(`Invalid validator "${key}"`);
      }
      const value = (data as Record<string, unknown>)[key];
      mergeErrors(errors, key, validator, value);
    }
    /* ********** */

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const toObjectValidator: ISchema<T>['toObjectValidator'] = (config = { optional: false }) => {
    return Object.freeze({ type: 'object', shape: schema, ...config });
  };

  const produce: ISchema<T>['produce'] = data => {
    const errors = validate(data);
    if (errors) throw errors;
    return data;
  };

  return {
    validate,
    toObjectValidator,
    produce,
  } as ISchema<T>;
}
