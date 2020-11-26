import { UnknownKey, isPlainObject } from './utils';

interface ValidatorBase {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  optional?: boolean;
}

export interface StringValidator extends ValidatorBase {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

export interface NumberValidator extends ValidatorBase {
  type: 'number';
  max?: number;
  min?: number;
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

  if (typeof value != 'string') return `expected string but received ${typeof value}`;

  if (validator.pattern && validator.pattern.test(value) == false)
    return `expected string to match pattern: ${validator.pattern}`;

  if (
    validator.minLength &&
    typeof validator.minLength == 'number' &&
    value.length < validator.minLength
  )
    return `expected string of length > ${validator.minLength}`;

  if (
    validator.maxLength &&
    typeof validator.maxLength == 'number' &&
    value.length > validator.maxLength
  )
    return `expected string of length < ${validator.maxLength}`;

  return null;
}

export function validateNumber(validator: NumberValidator, value: unknown): string | null {
  if (isValidatorNoop(value, validator)) return null;

  if (typeof value != 'number') return `expected number but received ${typeof value}`;

  if (isNaN(value)) return `expected number but received NaN`;

  if (typeof validator.min == 'number' && !isNaN(validator.min) && value < validator.min)
    return `expected number to be > ${validator.min}`;

  if (typeof validator.max == 'number' && !isNaN(validator.max) && value > validator.max)
    return `expected number to be < ${validator.max}`;

  return null;
}

export function validateBoolean(validator: BooleanValidator, value: unknown): string | null {
  if (isValidatorNoop(value, validator)) return null;

  if (typeof value != 'boolean') return `expected boolean but received ${typeof value}`;

  return null;
}

export function validateObject(
  validator: ObjectValidator,
  value: unknown
): string | string[] | null {
  if (isValidatorNoop(value, validator)) return null;

  if (!isPlainObject(value)) return `expected object but received ${typeof value}`;

  if (!isPlainObject(validator.shape)) return `missing object shape validator`;

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

  if (!Array.isArray(value)) return `expected array but received ${typeof value}`;

  if (!validator.of) return `missing array type`;

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
