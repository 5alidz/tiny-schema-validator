import { isPlainObject, UnknownKey } from './utils';
import { Validator, ObjectValidator } from './validators';
import { createValidate, ValidationError } from './validate';

export const dynamicObjectKey = UnknownKey;

export interface Schema {
  [key: string]: Validator;
}

interface ISchema<T> {
  validate: (data: T) => ValidationError[] | null;
  createObjectValidator: (config?: { optional: boolean }) => ObjectValidator;
  produce: (data: T) => T;
}

export function createSchema<T>(_schema: Schema): Readonly<ISchema<T>> {
  if (!isPlainObject(_schema)) {
    throw new Error('schema should be a valid object');
  }

  const schema = Object.freeze({ ..._schema });
  const validate = createValidate<T, Schema>(schema);

  return Object.freeze({
    validate,
    createObjectValidator(config = { optional: false }): ObjectValidator {
      return Object.freeze({ type: 'object', shape: schema, ...config });
    },
    produce(data: T): T {
      const errors = validate(data);
      if (errors) throw errors;
      return data;
    },
  });
}
