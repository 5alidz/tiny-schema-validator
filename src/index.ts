import { isPlainObject, UnknownKey } from './utils';
import { Validator, ObjectValidator, reducer } from './validators';
import { makeErr } from './errors';

export const dynamicObjectKey = UnknownKey;

export interface Schema {
  [key: string]: Validator;
}

export interface ValidationError {
  key: string;
  message: string;
}

function createValidate<T>(schema: Schema) {
  const schemaKeys = Object.keys(schema);

  return function validate(data: T): ValidationError[] | null {
    if (!isPlainObject(data)) {
      throw new Error('data should be a valid object');
    }

    const errors: ValidationError[] = [];

    for (let i = 0; i < schemaKeys.length; i++) {
      const key = schemaKeys[i];
      const validator = schema[key];
      if (!isPlainObject(validator) || !validator) {
        throw new Error(`Invalid validator "${key}"`);
      }
      const value = (data as Record<string, unknown>)[key];
      const err = reducer(validator, value);

      if (typeof err == 'string') {
        errors.push({ key, message: err });
      }
      if (Array.isArray(err)) {
        errors.push(...err.map(errStr => makeErr(key, errStr)));
      }
    }

    return errors.length > 0 ? errors : null;
  };
}

function createProduce<T>(validate: ISchema<T>['validate']) {
  return function produce(data: T): T {
    const errors = validate(data);
    if (errors) throw errors;
    return data;
  };
}

function createGetSchemaValidator(schema: Schema) {
  return function getSchemaValidator(config = { optional: false }): ObjectValidator {
    return Object.freeze({ type: 'object', shape: schema, ...config });
  };
}

interface ISchema<T> {
  validate: (data: T) => ValidationError[] | null;
  getSchemaValidator: (config?: { optional: boolean }) => ObjectValidator;
  produce: (data: T) => T;
}

export function createSchema<T>(_schema: Schema): Readonly<ISchema<T>> {
  if (!isPlainObject(_schema)) {
    throw new Error('schema should be a valid object');
  }

  const schema = Object.freeze({ ..._schema });
  const getSchemaValidator = createGetSchemaValidator(schema);
  const validate = createValidate<T>(schema);
  const produce = createProduce<T>(validate);

  return Object.freeze({
    getSchemaValidator,
    validate,
    produce,
  });
}
