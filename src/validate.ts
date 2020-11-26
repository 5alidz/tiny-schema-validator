import { mergeErrors, Validator } from './validators';
import { isPlainObject } from './utils';

export interface ValidationError {
  key: string;
  message: string;
}

export function createValidate<T, S extends Record<string, Validator>>(schema: S) {
  const schemaKeys = Object.keys(schema);

  return function validate(data: T): Record<string, unknown> | null {
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
}
