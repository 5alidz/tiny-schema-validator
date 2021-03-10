import { isPlainObject, ObjectKeys } from './utils';
import { createErrors } from './createErrors';
import { DATAERR, $record, SCHEMAERR } from './constants';
import invariant from 'tiny-invariant';
import { RecordValidator } from './validatorTypes';
import { SchemaFrom, ErrorsFrom } from './type-utils';
import { traverse as _traverse, Visitor } from './traverse';

export function createSchema<T extends { [key: string]: any }>(_schema: SchemaFrom<T>) {
  invariant(isPlainObject(_schema), SCHEMAERR);
  const schema = Object.freeze({ ..._schema });

  function validate(data: any, eager = false) {
    const errors = createErrors(schema, data, eager);
    return ObjectKeys(errors).length > 0 ? (errors as ErrorsFrom<T>) : null;
  }

  function is(data: any): data is T {
    const errors = validate(data, true);
    return !errors && isPlainObject(data);
  }

  function embed(config = { optional: false }): RecordValidator {
    return { type: $record, shape: schema, ...config };
  }

  function produce(data: any): T {
    invariant(is(data), DATAERR);
    return data;
  }

  function traverse(visitor: Visitor, data?: any, eager?: boolean) {
    return _traverse(schema, visitor, data, eager);
  }

  return {
    validate,
    embed,
    produce,
    is,
    traverse,
  };
}
