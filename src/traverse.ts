import { VisitorMember, ValidatorFromType, ShapedValidator, OfValidator } from './type-utils';
import { ObjectKeys, isPlainObject, shouldAddToResult, toObj } from './utils';
import { $boolean, $list, $listof, $number, $record, $recordof, $string } from './constants';
import {
  Validator,
  Schema,
  RecordValidator,
  RecordofValidator,
  ListValidator,
  ListofValidator,
  StringValidator,
  NumberValidator,
  BooleanValidator,
} from './validatorTypes';

function normalizeResult(result: Record<string, any>) {
  return ObjectKeys(result).length <= 0 ? null : result;
}

export type Visitor = Partial<
  {
    [K in VisitorMember]: (Utils: {
      path: string[];
      key: string;
      validator: ValidatorFromType<K>;
      value: any;
    }) => any;
  }
>;

type VisitorExists<
  Vi extends Visitor,
  Default,
  VKey extends VisitorMember
> = Vi[VKey] extends undefined
  ? never
  : ReturnType<NonNullable<Vi[VKey]>> extends infer X
  ? X extends string | number | boolean | null | undefined
    ? NonNullable<Default> | NonNullable<X>
    : X extends {}
    ? NonNullable<Default>
    : NonNullable<Default> | NonNullable<X>
  : NonNullable<Default>;

type InferVisitorResult<V extends Validator, Vi extends Visitor> = V extends RecordValidator<
  infer S
>
  ? VisitorExists<Vi, { [K in keyof S]?: NonNullable<InferVisitorResult<S[K], Vi>> }, 'record'>
  : V extends ListValidator<infer A>
  ? VisitorExists<
      Vi,
      { [K in number]: NonNullable<InferVisitorResult<A[number], Vi>> | undefined },
      'list'
    >
  : V extends ListofValidator<infer VV>
  ? VisitorExists<
      Vi,
      { [key: number]: NonNullable<InferVisitorResult<VV, Vi>> | undefined },
      'listof'
    >
  : V extends RecordofValidator<infer VV>
  ? VisitorExists<
      Vi,
      { [key: string]: NonNullable<InferVisitorResult<VV, Vi>> | undefined },
      'recordof'
    >
  : V extends StringValidator
  ? VisitorExists<Vi, ReturnType<NonNullable<Vi['string']>>, 'string'>
  : V extends NumberValidator
  ? VisitorExists<Vi, ReturnType<NonNullable<Vi['number']>>, 'number'>
  : V extends BooleanValidator
  ? VisitorExists<Vi, ReturnType<NonNullable<Vi['boolean']>>, 'boolean'>
  : never;

export type TraverseResult<S extends Schema, V extends Visitor> = {
  [K in keyof S]: InferVisitorResult<S[K], V>;
};

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
  if ([$string, $number, $boolean].includes(validator.type)) {
    return cb_result;
  }

  // return the result of object-like validator if it's not null -- respect visitor signal
  if (cb_result != null) return cb_result;
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
