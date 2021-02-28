import { Schema } from './createSchema';
import { UnknownKey, isPlainObject } from './utils';

export type StringValidator = {
  type: 'string';
  optional?: boolean;
  minLength?: [number, string];
  maxLength?: [number, string];
  pattern?: [RegExp, string];
};

export type NumberValidator = {
  type: 'number';
  optional?: boolean;
  max?: [number, string];
  min?: [number, string];
};

export type BooleanValidator = {
  type: 'boolean';
  optional?: boolean;
};

export type ObjectValidator = {
  type: 'object';
  optional?: boolean;
  shape: {
    [key: string]: Validator;
  };
};

export type ArrayValidator = {
  type: 'array';
  optional?: boolean;
  of: Validator;
};

export type Validator =
  | StringValidator
  | NumberValidator
  | BooleanValidator
  | ArrayValidator
  | ObjectValidator;

const isValidatorNoop = (value: unknown, validator: Validator) =>
  value == null && Boolean(validator.optional);

function validateString(validator: StringValidator, value: unknown): null | string {
  if (isValidatorNoop(value, validator)) return null;

  if (typeof value != 'string') return `Invalid Type`;

  const [pattern, patterErrMsg] = validator.pattern ? validator.pattern : [];
  if (pattern && patterErrMsg && pattern.test(value) == false) return patterErrMsg;

  const [minLength, minLengthErrMsg] = validator.minLength ? validator.minLength : [];
  if (minLength && minLengthErrMsg && typeof minLength == 'number' && value.length < minLength)
    return minLengthErrMsg;

  const [maxLength, maxLengthErrMsg] = validator.maxLength ? validator.maxLength : [];
  if (maxLength && maxLengthErrMsg && typeof maxLength == 'number' && value.length > maxLength)
    return maxLengthErrMsg;

  return null;
}

function validateNumber(validator: NumberValidator, value: unknown): null | string {
  if (isValidatorNoop(value, validator)) return null;

  if (typeof value != 'number') return `Invalid Type`;
  if (isNaN(value)) return `Invalid Type`;

  const [min, minErrMsg] = validator.min ? validator.min : [];
  if (typeof min == 'number' && minErrMsg && !isNaN(min) && value < min) return minErrMsg;

  const [max, maxErrMsg] = validator.max ? validator.max : [];
  if (typeof max == 'number' && maxErrMsg && !isNaN(max) && value > max) return maxErrMsg;

  return null;
}

function validateBoolean(validator: BooleanValidator, value: unknown): null | string {
  if (typeof value != 'boolean') return `Invalid Type`;
  if (isValidatorNoop(value, validator)) return null;
  return null;
}

function mergeErrors(
  parentError: Record<string, unknown>,
  key: string,
  validator: Validator,
  value: unknown
): void {
  if (isValidatorNoop(value, validator)) return;

  if (validator.type == 'string') {
    const error = validateString(validator, value);
    if (error) {
      parentError[key] = error;
    }
  } else if (validator.type == 'number') {
    const error = validateNumber(validator, value);
    if (error) {
      parentError[key] = error;
    }
  } else if (validator.type == 'boolean') {
    const error = validateBoolean(validator, value);
    if (error) {
      parentError[key] = error;
    }
  } else if (validator.type == 'array') {
    if (isValidatorNoop(value, validator)) return;
    if (!Array.isArray(value)) parentError[key] = `Invalid Type`;
    if (!validator.of) parentError[key] = `missing or undefined`;
    if (!isPlainObject(validator.of)) parentError[key] = `expected "of" to be an object`;

    if (!parentError[key]) parentError[key] = {};

    for (let i = 0; i < (value as unknown[]).length; i++) {
      mergeErrors(
        parentError[key] as Record<string, unknown>,
        i.toString(),
        validator.of,
        (value as unknown[])[i]
      );
    }

    if (
      typeof parentError == 'object' &&
      Object.keys(parentError[key] as Record<string, unknown>).length < 1
    )
      delete parentError[key];
  } else if (validator.type == 'object') {
    if (isValidatorNoop(value, validator)) return;

    if (!isPlainObject(value)) {
      parentError[key] = `Invalid Type`;
      return;
    }
    if (!isPlainObject(validator.shape)) {
      parentError[key] = `Invalid Shape Type`;
      return;
    }

    const shapeKeys = Object.keys(validator.shape);
    const unknownValidator = validator.shape[(UnknownKey as unknown) as string];

    if (!parentError[key]) parentError[key] = {};

    for (let i = 0; i < shapeKeys.length; i++) {
      const shapeKey = shapeKeys[i];
      const shapeValidator = validator.shape[shapeKey];
      mergeErrors(
        parentError[key] as Record<string, unknown>,
        shapeKey,
        shapeValidator,
        (value as Record<string, unknown>)[shapeKey]
      );
    }

    if (unknownValidator) {
      const unknownKeys = Object.keys(value as Record<string, unknown>).filter(
        key => !shapeKeys.includes(key)
      );
      for (let i = 0; i < unknownKeys.length; i++) {
        const _key = unknownKeys[i];
        mergeErrors(
          parentError[key] as Record<string, unknown>,
          _key,
          unknownValidator,
          (value as Record<string, number>)[_key]
        );
      }
    }

    if (
      typeof parentError[key] == 'object' &&
      Object.keys(parentError[key] as Record<string, unknown>).length < 1
    ) {
      delete parentError[key];
    }
  } else {
    // @ts-expect-error
    throw new Error(`${validator.type} is not recognized as validation type`);
  }
}

export function createErrors(schema: Schema, data: unknown) {
  const errors: Record<string, unknown> = {};
  const schemaKeys = Object.keys(schema);
  for (let i = 0; i < schemaKeys.length; i++) {
    const key = schemaKeys[i];
    const validator = schema[key];
    if (!isPlainObject(validator) || !validator) {
      throw new Error(`Invalid validator "${key}"`);
    }
    const value = (data as Record<string, unknown>)[key];
    mergeErrors(errors, key, validator, value);
  }
  return errors;
}
