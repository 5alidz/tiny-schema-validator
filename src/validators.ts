import { UnknownKey, isPlainObject, isNumber, ObjectKeys, isString, isBool } from './utils';
import { SCHEMAERR, TYPEERR } from './constants';
import {
  ArrayValidator,
  BooleanValidator,
  NumberValidator,
  ObjectValidator,
  StringValidator,
  Validator,
} from './validatorTypes';
import invariant from 'tiny-invariant';

function shouldAddToErrors(err: unknown) {
  if (
    err == null ||
    (isPlainObject(err) && ObjectKeys(err).length < 1) ||
    (Array.isArray(err) && err.length < 1)
  ) {
    return false;
  }
  return true;
}

function shouldSkipValidation(value: unknown, validator: Validator) {
  return value == null && Boolean(validator.optional);
}

const validators = {
  string(validator: StringValidator, value: unknown): string | null {
    if (shouldSkipValidation(value, validator)) return null;

    if (!isString(value)) return TYPEERR;

    const [minLength, minLengthErrMsg] = validator.minLength ? validator.minLength : [];
    if (minLength && minLengthErrMsg && isNumber(minLength) && value.length < minLength)
      return minLengthErrMsg;

    const [maxLength, maxLengthErrMsg] = validator.maxLength ? validator.maxLength : [];
    if (maxLength && maxLengthErrMsg && isNumber(maxLength) && value.length > maxLength)
      return maxLengthErrMsg;

    const [pattern, patterErrMsg] = validator.pattern ? validator.pattern : [];
    if (pattern && patterErrMsg && pattern.test(value) == false) return patterErrMsg;

    return null;
  },
  number(validator: NumberValidator, value: unknown): string | null {
    if (shouldSkipValidation(value, validator)) return null;

    if (!isNumber(value)) return TYPEERR;

    const [min, minErrMsg] = validator.min ? validator.min : [];
    if (isNumber(min) && value < min && minErrMsg) return minErrMsg;

    const [max, maxErrMsg] = validator.max ? validator.max : [];
    if (isNumber(max) && value > max && maxErrMsg) return maxErrMsg;

    return null;
  },
  boolean(validator: BooleanValidator, value: unknown): string | null {
    if (shouldSkipValidation(value, validator)) return null;
    if (!isBool(value)) return TYPEERR;
    return null;
  },
  array(validator: ArrayValidator, value: unknown): string | null | Record<string, any> {
    if (shouldSkipValidation(value, validator)) return null;
    if (!Array.isArray(value)) return TYPEERR;

    if (isPlainObject(validator.of)) {
      let errors: Record<string, any> = {};
      for (let i = 0; i < value.length; i++) {
        const current = value[i];
        const err = handleValue(validator.of, current);
        if (shouldAddToErrors(err)) {
          errors[i] = err;
        }
      }
      return shouldAddToErrors(errors) ? errors : null;
    }

    if (isPlainObject(validator.shape)) {
      return null;
    }

    invariant(false, SCHEMAERR);
  },
  object(validator: ObjectValidator, value: unknown): string | null | Record<string, any> {
    invariant(isPlainObject(validator.shape), SCHEMAERR);
    if (shouldSkipValidation(value, validator)) return null;
    if (!isPlainObject(value)) return TYPEERR;

    const shapeKeys = ObjectKeys(validator.shape);
    const recordofValidator = validator.shape[(UnknownKey as unknown) as string];

    const errors: Record<string, any> = {};

    if (recordofValidator) {
      const keys = ObjectKeys(value).filter(key => !shapeKeys.includes(key));
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const err = handleValue(recordofValidator, value[key]);
        if (shouldAddToErrors(err)) {
          errors[key] = err;
        }
      }
      return errors;
    } else {
      for (let i = 0; i < shapeKeys.length; i++) {
        const shapeKey = shapeKeys[i];
        const shapeValidator = validator.shape[shapeKey];
        const err = handleValue(shapeValidator, value[shapeKey]);
        if (shouldAddToErrors(err)) {
          errors[shapeKey] = err;
        }
      }
      return errors;
    }
  },
};

type ValidationFunction = (
  v: Validator,
  value: any
) => ReturnType<typeof validators[Validator['type']]>;

function handleValue(validator: Validator, value: any) {
  const validatorFunction = validators[validator.type] as ValidationFunction;
  invariant(typeof validatorFunction == 'function', SCHEMAERR);
  return validatorFunction(validator, value);
}

export function createErrors<T>(
  schema: { [K in keyof T]: Validator },
  data: T,
  eager: boolean = false
) {
  const schemaKeys = ObjectKeys(schema) as (keyof T)[];
  if (!isPlainObject(data)) {
    return schemaKeys.reduce((errors, schemaKey) => {
      const validator = schema[schemaKey];
      if (!validator.optional) {
        errors[schemaKey] = TYPEERR as string;
      }
      return errors;
    }, {} as Record<keyof T, any>);
  } else {
    const errors = {} as Record<keyof T, any>;
    for (let i = 0; i < schemaKeys.length; i++) {
      const schemaKey = schemaKeys[i];
      const validator = schema[schemaKey];
      invariant(isPlainObject(validator), SCHEMAERR);
      const value = isPlainObject(data) ? data[schemaKey] : undefined;
      const err = handleValue(validator, value);
      if (shouldAddToErrors(err)) {
        errors[schemaKey] = err;
        if (eager) return errors;
      }
    }
    return errors;
  }
}
