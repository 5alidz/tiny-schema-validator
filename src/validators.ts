import { UnknownKey, isPlainObject } from './utils';
import {
  Schema,
  ArrayValidator,
  BooleanValidator,
  NumberValidator,
  ObjectValidator,
  StringValidator,
  Validator,
} from './validatorsSpec';

const TYPEERR = 'Invalid Type';

function isError(err: unknown) {
  if (
    err == null ||
    (isPlainObject(err) && Object.keys(err).length < 1) ||
    (Array.isArray(err) && err.length < 1)
  ) {
    return false;
  }
  return true;
}

function shouldSkipValidation(value: unknown, validator: Validator) {
  return value == null && Boolean(validator.optional);
}

const isStringValidator = (validator: Validator): validator is StringValidator =>
  validator.type == 'string';
const isNumberValidator = (validator: Validator): validator is NumberValidator =>
  validator.type == 'number';
const isBooleanValidator = (validator: Validator): validator is BooleanValidator =>
  validator.type == 'boolean';
const isArrayValidator = (validator: Validator): validator is ArrayValidator =>
  validator.type == 'array';
const isObjectValidator = (validator: Validator): validator is ObjectValidator =>
  validator.type == 'object';

const validators = {
  string(validator: StringValidator, value: unknown) {
    if (shouldSkipValidation(value, validator)) return null;

    if (typeof value != 'string') return TYPEERR;

    const [pattern, patterErrMsg] = validator.pattern ? validator.pattern : [];
    if (pattern && patterErrMsg && pattern.test(value) == false) return patterErrMsg;

    const [minLength, minLengthErrMsg] = validator.minLength ? validator.minLength : [];
    if (minLength && minLengthErrMsg && typeof minLength == 'number' && value.length < minLength)
      return minLengthErrMsg;

    const [maxLength, maxLengthErrMsg] = validator.maxLength ? validator.maxLength : [];
    if (maxLength && maxLengthErrMsg && typeof maxLength == 'number' && value.length > maxLength)
      return maxLengthErrMsg;

    return null;
  },
  number(validator: NumberValidator, value: unknown) {
    if (shouldSkipValidation(value, validator)) return null;

    if (typeof value != 'number' || isNaN(value)) return TYPEERR;

    const [min, minErrMsg] = validator.min ? validator.min : [];
    if (typeof min == 'number' && minErrMsg && !isNaN(min) && value < min) return minErrMsg;

    const [max, maxErrMsg] = validator.max ? validator.max : [];
    if (typeof max == 'number' && maxErrMsg && !isNaN(max) && value > max) return maxErrMsg;

    return null;
  },
  boolean(validator: BooleanValidator, value: unknown) {
    if (shouldSkipValidation(value, validator)) return null;
    if (typeof value != 'boolean') return TYPEERR;
    return null;
  },
  array(validator: ArrayValidator, value: unknown) {
    if (shouldSkipValidation(value, validator)) return null;
    if (!Array.isArray(value)) return TYPEERR;
    if (!validator.of) return 'missing or undefined';
    if (!isPlainObject(validator.of)) return 'expected "of" to be an object';

    let errors: Record<string, unknown> = {};

    for (let i = 0; i < value.length; i++) {
      const current = value[i];
      const err = handleValue(validator.of, current);
      if (isError(err)) {
        errors[i] = err;
      }
    }

    return isError(errors) ? errors : null;
  },
  object(validator: ObjectValidator, value: unknown) {
    if (shouldSkipValidation(value, validator)) return;
    if (!isPlainObject(value)) return TYPEERR;
    if (!isPlainObject(validator.shape)) return TYPEERR;

    const shapeKeys = Object.keys(validator.shape);
    const unknownValidator = validator.shape[(UnknownKey as unknown) as string];

    const errors: Record<string, any> = {};

    for (let i = 0; i < shapeKeys.length; i++) {
      const shapeKey = shapeKeys[i];
      const shapeValidator = validator.shape[shapeKey];
      const err = handleValue(shapeValidator, value[shapeKey]);
      if (isError(err)) {
        errors[shapeKey] = err;
      }
    }

    if (unknownValidator) {
      const unknownKeys = Object.keys(value as Record<string, unknown>).filter(
        key => !shapeKeys.includes(key)
      );
      for (let i = 0; i < unknownKeys.length; i++) {
        const _key = unknownKeys[i];
        const err = handleValue(unknownValidator, value[_key]);
        if (isError(err)) {
          errors[_key] = err;
        }
      }
    }

    return errors;
  },
} as const;

function handleValue(validator: Validator, value: unknown) {
  if (isStringValidator(validator)) {
    return validators.string(validator, value);
  } else if (isNumberValidator(validator)) {
    return validators.number(validator, value);
  } else if (isBooleanValidator(validator)) {
    return validators.boolean(validator, value);
  } else if (isArrayValidator(validator)) {
    return validators.array(validator, value);
  } else if (isObjectValidator(validator)) {
    return validators.object(validator, value);
  } else {
    throw new TypeError(`object is not a valid validator ${JSON.stringify(validator)}`);
  }
}

export function createErrors(schema: Schema, data: unknown) {
  if (!isPlainObject(data)) {
    throw new Error('data should be a valid object');
  }
  const errors: Record<string, unknown> = {};
  const schemaKeys = Object.keys(schema);
  for (let i = 0; i < schemaKeys.length; i++) {
    const key = schemaKeys[i];
    const validator = schema[key];
    if (!isPlainObject(validator) || !validator) throw new Error(`Invalid validator "${key}"`);
    const value = data[key];
    const err = handleValue(validator, value);
    if (isError(err)) {
      errors[key] = err;
    }
  }
  return errors;
}
