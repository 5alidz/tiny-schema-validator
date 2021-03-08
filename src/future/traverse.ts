import { ObjectKeys, isPlainObject } from '../utils';
import { list, listof, record, recordof } from './constants';
import {
  BooleanValidator,
  ListofValidator,
  ListValidator,
  NumberValidator,
  RecordofValidator,
  RecordValidator,
  StringValidator,
  Validator,
} from './validatorTypes';

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

function toObj(value: any) {
  return Array.isArray(value)
    ? { ...value }
    : isPlainObject(value)
    ? value
    : ({} as Record<string, any>);
}

interface Visitor {
  string?(v: StringValidator, value: any): string | null | Record<string, any>;
  number?(v: NumberValidator, value: any): string | null | Record<string, any>;
  boolean?(v: BooleanValidator, value: any): string | null | Record<string, any>;
  list?(v: ListValidator, value: any): string | null | Record<string, any>;
  listof?(v: ListofValidator, value: any): string | null | Record<string, any>;
  record?(v: RecordValidator, value: any): string | null | Record<string, any>;
  recordof?(v: RecordofValidator, value: any): string | null | Record<string, any>;
}

// TODO: fix return type objects vs children

function enter(validator: Validator, visitor: Visitor, value: any, eager = false) {
  const cb = visitor[validator.type] as (
    v: Validator,
    value: any
  ) => ReturnType<NonNullable<Visitor[keyof Visitor]>>;
  let result: string | null | Record<string, any> = null;
  if (typeof cb == 'function') {
    result = cb(validator, value);
    if (result && eager) return result;
  }

  if (result == null) {
    result = {};
    if (validator.type == list || validator.type == record) {
      const shape = validator.shape;
      const keys = ObjectKeys(shape);
      const values = toObj(value);
      for (let i = 0; i < keys.length; i++) {
        const currentResult = enter(
          Array.isArray(shape) ? shape[i] : shape[keys[i]],
          visitor,
          values[keys[i]],
          eager
        );
        if (shouldAddToErrors(currentResult)) {
          result[keys[i]] = currentResult;
          if (eager) return result;
        }
      }
    } else if (validator.type == listof || validator.type == recordof) {
      const values = toObj(value);
      const keys = ObjectKeys(values);
      for (let i = 0; i < keys.length; i++) {
        const currentResult = enter(validator.of, visitor, values[i], eager);
        if (shouldAddToErrors(currentResult)) {
          result[i] = currentResult;
          if (eager) return result;
        }
      }
    } else {
      return ObjectKeys(result).length > 0 ? result : null;
    }
    return ObjectKeys(result).length > 0 ? result : null;
  }
  return result;
}

export function traverse<T>(
  schema: { [K in keyof T]: Validator },
  visitor: Visitor,
  data: T,
  eager = false
) {
  const schemaKeys = ObjectKeys(schema) as (keyof T)[];
  const parent = {} as Record<keyof T, any>;
  for (let i = 0; i < schemaKeys.length; i++) {
    const schemaKey = schemaKeys[i];
    const validator = schema[schemaKey];
    const value = isPlainObject(data) ? data[schemaKey] : undefined;
    let result = enter(validator, visitor, value, eager);
    if (shouldAddToErrors(result)) {
      parent[schemaKey] = result;
      if (eager) return parent;
    }
  }
  return parent;
}
