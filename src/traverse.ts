import { ShapedValidator, OfValidator } from './type-utils';
import { ObjectKeys, isPlainObject, shouldAddToResult, toObj } from './utils';
import {
  $boolean,
  $constant,
  $list,
  $listof,
  $number,
  $record,
  $recordof,
  $string,
  TYPEERR,
} from './constants';
import { Validator, Schema } from './validatorTypes';
import { TraverseResult, Visitor } from './traverse.types';

function normalizeResult(result: Record<string, any>) {
  return ObjectKeys(result).length <= 0 ? null : result;
}

function enterNode(
  path: string[],
  nodeKey: string,
  validator: Validator,
  visitor: Visitor,
  value: any,
  eager = false
): ReturnType<NonNullable<Visitor[Validator['type']]>> {
  const currentPath = [...path, nodeKey];
  const cb = visitor[validator.type] as any; // TODO infer correct visitor type
  const cb_result =
    typeof cb == 'function' ? cb({ path: currentPath, key: nodeKey, validator, value }) : null;

  // handle primitve validator
  if ([$string, $number, $boolean, $constant].includes(validator.type)) {
    return cb_result;
  }

  // return the result of object-like validator if it's not null -- respect visitor signal
  if (cb_result != null) return cb_result;

  if (validator.type == 'union') {
    const unionTypes = validator.of;
    let currentResult = null;
    for (let i = 0; i < unionTypes.length; i++) {
      currentResult = enterNode(currentPath, nodeKey, unionTypes[i], visitor, value, true);
      if (currentResult == null) return null;
    }
    return TYPEERR;
  }

  const result: Record<string, any> = {};

  if ([$recordof, $listof].includes(validator.type)) {
    const values = toObj(value);
    const keys = ObjectKeys(values);
    for (let i = 0; i < keys.length; i++) {
      const currentResult = enterNode(
        currentPath,
        keys[i],
        (validator as OfValidator).of,
        visitor,
        values[keys[i]],
        eager
      );
      if (shouldAddToResult(currentResult)) {
        result[keys[i]] = currentResult;
        if (eager) return result;
      }
    }
    return normalizeResult(result);
  }

  if ([$record, $list].includes(validator.type)) {
    const shape = toObj((validator as ShapedValidator).shape);
    const keys = ObjectKeys(shape);
    const values = toObj(value);
    for (let i = 0; i < keys.length; i++) {
      const currentResult = enterNode(
        currentPath,
        keys[i],
        shape[keys[i]],
        visitor,
        values[keys[i]],
        eager
      );
      if (shouldAddToResult(currentResult)) {
        result[keys[i]] = currentResult;
        if (eager) return result;
      }
    }
    return normalizeResult(result);
  }

  return null;
}

export function traverse<S extends Schema, V extends Visitor>(
  schema: S,
  visitor: V,
  _data: any,
  eager = false
): Partial<TraverseResult<S, V>> {
  const schemaKeys = ObjectKeys(schema) as (keyof S)[];
  const parent: Partial<TraverseResult<S, V>> = {};
  const data = isPlainObject(_data) ? _data : {};
  for (let i = 0; i < schemaKeys.length; i++) {
    const schemaKey = schemaKeys[i];
    const validator = schema[schemaKey];
    const value = data[schemaKey as string];
    let result = enterNode([], schemaKey as string, validator, visitor, value, eager);
    if (shouldAddToResult(result)) {
      parent[schemaKey] = result as ReturnType<NonNullable<V[S[keyof S]['type']]>>;
      if (eager) return parent;
    }
  }
  return parent;
}
