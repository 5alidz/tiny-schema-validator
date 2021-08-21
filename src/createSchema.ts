import { isPlainObject, ObjectKeys } from './utils';
import { createErrors } from './createErrors';
import { DATAERR, $record, SCHEMAERR } from './constants';
import invariant from 'tiny-invariant';
import { RecordValidator, Schema, R, O, RecordOptions } from './validatorTypes';
import { DataFrom } from './type-utils';
import { traverse as _traverse } from './traverse';
import { Visitor } from './traverse.types';

export function createSchema<T extends Schema>(_schema: T) {
  invariant(isPlainObject(_schema), SCHEMAERR);

  type Data = DataFrom<T>;
  const schema = Object.freeze({ ..._schema });

  function validate(data: any, eager = false) {
    const errors = createErrors(schema, data, eager);
    return ObjectKeys(errors).length > 0 ? errors : null;
  }

  function is(data: any): data is Data {
    if (!isPlainObject(data)) return false;
    const errors = validate(data, true);
    return errors == null;
  }

  function embed(): R<RecordOptions<T>>;
  function embed(config: { optional: false }): R<RecordOptions<T>>;
  function embed(config: { optional: true }): O<RecordOptions<T>>;
  function embed(config = { optional: false }): RecordValidator<T> {
    return { type: $record, shape: schema, ...config };
  }

  function produce(data: any): Data {
    if (!is(data)) throw new TypeError(DATAERR);
    return data;
  }

  function traverse<V extends Visitor>(visitor: V, data?: any, eager?: boolean) {
    return _traverse(schema as T, visitor, data, eager);
  }

  return {
    source: schema,
    validate,
    embed,
    produce,
    is,
    traverse,
  };
}
