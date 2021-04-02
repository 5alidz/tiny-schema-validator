import { isPlainObject, ObjectKeys } from './utils';
import { createErrors } from './createErrors';
import { DATAERR, $record, SCHEMAERR } from './constants';
import invariant from 'tiny-invariant';
import { RecordValidator, Schema, R, O, RecordOptions } from './validatorTypes';
import { DataFrom } from './type-utils';
import { traverse as _traverse, Visitor } from './traverse';

export function createSchema<T extends Schema>(_schema: T) {
  invariant(isPlainObject(_schema), SCHEMAERR);
  type Data = DataFrom<T>;
  const schema = Object.freeze({ ..._schema });

  function validate(data: any, eager = false) {
    const errors = createErrors(schema, data, eager);
    return ObjectKeys(errors).length > 0 ? errors : null;
  }

  function is(data: any): data is Data {
    return !validate(data, true) && isPlainObject(data);
  }

  function embed(): R<RecordOptions<T>>;
  function embed(config: { optional: false }): R<RecordOptions<T>>;
  function embed(config: { optional: true }): O<RecordOptions<T>>;
  function embed(config = { optional: false }): RecordValidator<T> {
    return { type: $record, shape: schema, ...config };
  }

  function produce(data: any): Data {
    invariant(is(data), DATAERR);
    return data;
  }

  function traverse<V extends Visitor>(visitor: V, data?: any, eager?: boolean) {
    return _traverse(schema as T, visitor, data, eager);
  }

  return {
    validate,
    embed,
    produce,
    is,
    traverse,
  };
}
