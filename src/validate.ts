import { reducer, Validator } from './validators';
import { isPlainObject } from './utils';

function parseMessage(msg: string): [string, string] {
  const parts = msg.split(' ');
  const messagePart = [...parts];
  let key = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('[]')) {
      messagePart.shift();
      const [, , ...id] = part.split('');
      key += `[${id.join('')}]`;
    } else if (part.startsWith('{}')) {
      messagePart.shift();
      const [, , ...id] = part.split('');
      key += `.${id.join('')}`;
    } else {
      break;
    }
  }
  return [key, messagePart.join(' ')];
}

function makeErr(key: string, errStr: string) {
  if (errStr.startsWith('[]') || errStr.startsWith('{}')) {
    const [id, message] = parseMessage(errStr);
    return { key: `${key}${id}`, message };
  } else {
    return { key, message: errStr };
  }
}

export interface ValidationError {
  key: string;
  message: string;
}

export function createValidate<T, S extends Record<string, Validator>>(schema: S) {
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
