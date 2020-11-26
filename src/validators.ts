import { UnknownKey, isPlainObject } from './utils';

interface ValidatorBase {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  optional?: boolean;
}

export interface StringValidator extends ValidatorBase {
  type: 'string';
  minLength?: [number, string];
  maxLength?: [number, string];
  pattern?: [RegExp, string];
}

export interface NumberValidator extends ValidatorBase {
  type: 'number';
  max?: [number, string];
  min?: [number, string];
}

export interface BooleanValidator extends ValidatorBase {
  type: 'boolean';
}

export interface ObjectValidator extends ValidatorBase {
  type: 'object';
  shape: {
    [key: string]: Validator;
  };
}

export interface ArrayValidator extends ValidatorBase {
  type: 'array';
  of: Validator;
}

export type Validator =
  | StringValidator
  | NumberValidator
  | BooleanValidator
  | ArrayValidator
  | ObjectValidator;

const isValidatorNoop = (value: unknown, validator: Validator) =>
  value == null && Boolean(validator.optional);

export function validateString(validator: StringValidator, value: unknown): string | null {
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

export function validateNumber(validator: NumberValidator, value: unknown): string | null {
  if (isValidatorNoop(value, validator)) return null;

  if (typeof value != 'number') return `Invalid Type`;

  if (isNaN(value)) return `Invalid Type`;

  const [min, minErrMsg] = validator.min ? validator.min : [];
  if (typeof min == 'number' && minErrMsg && !isNaN(min) && value < min) return minErrMsg;

  const [max, maxErrMsg] = validator.max ? validator.max : [];
  if (typeof max == 'number' && maxErrMsg && !isNaN(max) && value > max) return maxErrMsg;

  return null;
}

export function validateBoolean(validator: BooleanValidator, value: unknown): string | null {
  if (isValidatorNoop(value, validator)) return null;

  if (typeof value != 'boolean') return `Invalid Type`;

  return null;
}

export function validateObject(
  validator: ObjectValidator,
  value: unknown
): string | string[] | null {
  if (isValidatorNoop(value, validator)) return null;

  if (!isPlainObject(value)) return `Invalid Type`;

  if (!isPlainObject(validator.shape)) return `Invalid Shape Type`;

  const errors: string[] = [];
  const shapeKeys = Object.keys(validator.shape);
  const unknownValidator = validator.shape[(UnknownKey as unknown) as string];

  for (let i = 0; i < shapeKeys.length; i++) {
    const shapeKey = shapeKeys[i];
    const shapeValidator = validator.shape[shapeKey];
    const res = reducer(shapeValidator, (value as Record<string, unknown>)[shapeKey]);
    if (res) errors.push(`{}${shapeKey} ${res}`);
  }

  if (unknownValidator) {
    const unknownKeys = Object.keys(value as Record<string, unknown>).filter(
      key => !shapeKeys.includes(key)
    );
    for (let i = 0; i < unknownKeys.length; i++) {
      const key = unknownKeys[i];
      const res = reducer(unknownValidator, (value as Record<string, number>)[key]);
      if (res) errors.push(`{}${key} ${res}`);
    }
  }

  return errors.length > 0 ? errors : null;
}

export function validateArray(validator: ArrayValidator, value: unknown): string | string[] | null {
  if (isValidatorNoop(value, validator)) return null;

  if (!Array.isArray(value)) return `Invalid Type`;

  if (!validator.of) return `Missing "of" key`;

  const errors: string[] = [];

  for (let i = 0; i < value.length; i++) {
    const res = reducer(validator.of, value[i]);
    if (res) errors.push(`[]${i} ${res}`);
  }

  return errors.length > 0 ? errors : null;
}

export function reducer(validator: Validator, value: unknown) {
  if (validator.type == 'string') {
    return validateString(validator, value);
  } else if (validator.type == 'number') {
    return validateNumber(validator, value);
  } else if (validator.type == 'array') {
    return validateArray(validator, value);
  } else if (validator.type == 'boolean') {
    return validateBoolean(validator, value);
  } else if (validator.type == 'object') {
    return validateObject(validator, value);
  } else {
    // @ts-expect-error
    throw new Error(`${validator.type} is not recognized as validation type`);
  }
}
