import { isPlainObject } from './utils';
import { createErrors } from './createErrors';
import { DATAERR, $record, SCHEMAERR } from './constants';
import invariant from 'tiny-invariant';
import { RecordValidator, Schema, R, O, RecordOptions } from './validatorTypes';
import { DataFrom } from './type-utils';

export function createSchema<T extends Schema>(_schema: T) {
  invariant(isPlainObject(_schema), SCHEMAERR);

  type Data = DataFrom<T>;
  const source = Object.freeze({ ..._schema });

  function validate(data: any, eager = false) {
    return createErrors(source, data, eager);
  }

  function is(data: any): data is Data {
    if (!isPlainObject(data)) return false;
    return validate(data, true) == null;
  }

  function embed(): R<RecordOptions<T>>;
  function embed(config: { optional: false }): R<RecordOptions<T>>;
  function embed(config: { optional: true }): O<RecordOptions<T>>;
  function embed(config = { optional: false }): RecordValidator<T> {
    return { type: $record, shape: source, ...config };
  }

  function produce(data: any): Data {
    if (!is(data)) throw new TypeError(DATAERR);
    return data;
  }

  return {
    source,
    validate,
    embed,
    produce,
    is,
  };
}
