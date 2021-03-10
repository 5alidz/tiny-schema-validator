import { ObjectKeys, isPlainObject } from './utils';
import { $list, $listof, $record, $recordof } from './constants';
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

function shouldAddToResult(res: unknown) {
  if (
    res == null ||
    (isPlainObject(res) && ObjectKeys(res).length < 1) ||
    (Array.isArray(res) && res.length < 1)
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

export interface Visitor {
  string?(key: string, v: StringValidator, value: any): string | null | Record<string, any>;
  number?(key: string, v: NumberValidator, value: any): string | null | Record<string, any>;
  boolean?(key: string, v: BooleanValidator, value: any): string | null | Record<string, any>;
  list?(key: string, v: ListValidator, value: any): string | null | Record<string, any>;
  listof?(key: string, v: ListofValidator, value: any): string | null | Record<string, any>;
  record?(key: string, v: RecordValidator, value: any): string | null | Record<string, any>;
  recordof?(key: string, v: RecordofValidator, value: any): string | null | Record<string, any>;
}

type VisitorFunction = (
  key: string,
  v: Validator,
  value: any
) => ReturnType<NonNullable<Visitor[keyof Visitor]>>;

function enter(_: string, validator: Validator, visitor: Visitor, value: any, eager = false) {
  const cb = visitor[validator.type] as VisitorFunction;

  let result = typeof cb == 'function' ? cb(_, validator, value) : null;

  if ((!!result && eager) || result != null) return result;

  result = {};

  if (validator.type == $list || validator.type == $record) {
    const shape = toObj(validator.shape);
    const keys = ObjectKeys(shape);
    const values = toObj(value);
    for (let i = 0; i < keys.length; i++) {
      const currentResult = enter(keys[i], shape[keys[i]], visitor, values[keys[i]], eager);
      if (shouldAddToResult(currentResult)) {
        result[keys[i]] = currentResult;
        if (eager) return result;
      }
    }
  }

  if (validator.type == $listof || validator.type == $recordof) {
    const values = toObj(value);
    const keys = ObjectKeys(values);
    for (let i = 0; i < keys.length; i++) {
      const currentResult = enter(keys[i], validator.of, visitor, values[keys[i]], eager);
      if (shouldAddToResult(currentResult)) {
        result[keys[i]] = currentResult;
        if (eager) return result;
      }
    }
  }

  return ObjectKeys(result).length > 0 ? result : null;
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
    let result = enter(schemaKey as string, validator, visitor, value, eager);
    if (shouldAddToResult(result)) {
      parent[schemaKey] = result;
      if (eager) return parent;
    }
  }
  return parent;
}
