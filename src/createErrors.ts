import {
  isPlainObject,
  isNumber,
  isString,
  isBool,
  ObjectKeys,
  toObj,
  shouldAddToResult,
} from './utils';
import {
  BooleanValidator,
  ConstantValidator,
  ListofValidator,
  ListValidator,
  NumberValidator,
  RecordofValidator,
  RecordValidator,
  Schema,
  StringValidator,
  UnionValidator,
  Validator,
} from './validatorTypes';
import { TYPEERR } from './constants';

function shouldSkipValidation(value: unknown, validator: Validator) {
  return value == null && Boolean(validator.optional);
}

function normalizeResult<T extends Record<string, any>>(result: T) {
  return ObjectKeys(result).length <= 0 ? null : result;
}

function enterNode(validator: Validator, value: unknown, eager = false) {
  if (validator.type == 'string') return validators.string(validator, value);
  if (validator.type == 'number') return validators.number(validator, value);
  if (validator.type == 'boolean') return validators.boolean(validator, value);
  if (validator.type == 'constant') return validators.constant(validator, value);
  if (validator.type == 'union') return validators.union(validator, value);
  if (validator.type == 'list') return validators.list(validator, value, eager);
  if (validator.type == 'listof') return validators.listof(validator, value, eager);
  if (validator.type == 'record') return validators.record(validator, value, eager);
  if (validator.type == 'recordof') return validators.recordof(validator, value, eager);
  throw new TypeError('invalid-validator-type');
}

type InferCallbackResult<V extends Validator> = V extends
  | StringValidator
  | NumberValidator
  | BooleanValidator
  | ConstantValidator<any>
  | UnionValidator<any>
  ? string
  : V extends ListValidator<infer U>
  ? { [key in number]?: InferCallbackResult<U[key]> }
  : V extends ListofValidator<infer U>
  ? { [key: number]: InferCallbackResult<U> | undefined }
  : V extends RecordValidator<infer U>
  ? { [key in keyof U]?: InferCallbackResult<U[key]> }
  : V extends RecordofValidator<infer U>
  ? { [key: string]: InferCallbackResult<U> | undefined }
  : never;

type InferResult<S extends Schema> = {
  [key in keyof S]?: InferCallbackResult<S[key]>;
};

const validators = {
  string(validator: StringValidator, value: unknown) {
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
  number(validator: NumberValidator, value: unknown) {
    if (shouldSkipValidation(value, validator)) return null;

    if (!isNumber(value)) return TYPEERR;

    const [min, minErrMsg] = validator.min ? validator.min : [];
    if (isNumber(min) && value < min && minErrMsg) return minErrMsg;

    const [max, maxErrMsg] = validator.max ? validator.max : [];
    if (isNumber(max) && value > max && maxErrMsg) return maxErrMsg;

    const [is, isErrMsg] = validator.is ? validator.is : [];
    if (isString(is) && isErrMsg) {
      const isInt = Number.isInteger(value);
      if ((isInt && is == 'float') || (!isInt && is == 'integer')) return isErrMsg;
    }

    return null;
  },
  boolean(validator: BooleanValidator, value: unknown) {
    if (shouldSkipValidation(value, validator)) return null;
    if (!isBool(value)) return TYPEERR;
    return null;
  },
  constant<T extends string | number | boolean>(validator: ConstantValidator<T>, value: unknown) {
    if (shouldSkipValidation(value, validator)) return null;
    if (value === validator.value) return null;
    return TYPEERR;
  },
  union<T extends Validator[]>(validator: UnionValidator<T>, value: unknown) {
    if (shouldSkipValidation(value, validator)) return null;
    const unionTypes = validator.of;
    let currentResult = null;
    for (let i = 0; i < unionTypes.length; i++) {
      currentResult = enterNode(unionTypes[i], value);
      if (currentResult == null) return null;
    }
    return TYPEERR;
  },
  list<T extends Validator[]>(validator: ListValidator<T>, value: unknown, eager = false) {
    if (shouldSkipValidation(value, validator)) return null;
    if (!Array.isArray(value)) return TYPEERR;
    const shape = toObj(validator).shape;
    const keys = ObjectKeys(shape);
    const values = toObj(value);
    const result: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      const currentResult = enterNode(shape[keys[i]], values[keys[i]]);
      if (shouldAddToResult(currentResult)) {
        result[keys[i]] = currentResult;
        if (eager) return result;
      }
    }
    return normalizeResult(result);
  },
  listof<T extends Validator>(validator: ListofValidator<T>, value: unknown, eager = false) {
    if (shouldSkipValidation(value, validator)) return null;
    if (!Array.isArray(value)) return TYPEERR;
    const values = toObj(value);
    const keys = ObjectKeys(values);
    const result: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      const currentResult = enterNode(validator.of, values[keys[i]]);
      if (shouldAddToResult(currentResult)) {
        result[keys[i]] = currentResult;
        if (eager) return result;
      }
    }
    return normalizeResult(result);
  },
  record<T extends Schema>(validator: RecordValidator<T>, value: unknown, eager = false) {
    if (shouldSkipValidation(value, validator)) return null;
    if (!isPlainObject(value)) return TYPEERR;
    const shape = toObj(validator).shape;
    const keys = ObjectKeys(shape);
    const values = toObj(value);
    const result: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      const currentResult = enterNode(shape[keys[i]], values[keys[i]]);
      if (shouldAddToResult(currentResult)) {
        result[keys[i]] = currentResult;
        if (eager) return result;
      }
    }
    return normalizeResult(result);
  },
  recordof<T extends Validator>(validator: RecordofValidator<T>, value: unknown, eager = false) {
    if (shouldSkipValidation(value, validator)) return null;
    if (!isPlainObject(value)) return TYPEERR;
    const values = toObj(value);
    const keys = ObjectKeys(values);
    const result: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      const currentResult = enterNode(validator.of, values[keys[i]]);
      if (shouldAddToResult(currentResult)) {
        result[keys[i]] = currentResult;
        if (eager) return result;
      }
    }
    return normalizeResult(result);
  },
};

export function createErrors<T extends Schema>(
  schema: T,
  _data: any,
  eager = false
): null | InferResult<T> {
  const result: InferResult<T> = {};
  const schemaKeys = ObjectKeys(schema) as (keyof T)[];
  const data = isPlainObject(_data) ? _data : {};
  for (let i = 0; i < schemaKeys.length; i++) {
    const schemaKey = schemaKeys[i];
    const validator = schema[schemaKey];
    const value = data[schemaKey as string];
    let _result = enterNode(validator, value, eager);
    if (shouldAddToResult(_result)) {
      result[schemaKey] = _result as InferCallbackResult<typeof validator>;
      if (eager) return result;
    }
  }
  return normalizeResult(result);
}
