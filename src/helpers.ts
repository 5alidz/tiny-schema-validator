import { UnknownKey, safeSpread } from './utils';
import {
  ArrayValidator,
  BooleanValidator,
  NumberValidator,
  ObjectValidator,
  StringValidator,
  Validator,
} from './validatorsSpec';

interface ValidatorsHelpers {
  string: (opts?: Partial<StringValidator>) => StringValidator;
  bool: (opts?: Partial<BooleanValidator>) => BooleanValidator;
  number: (opts?: Partial<NumberValidator>) => NumberValidator;
  record: (v: Record<string, Validator>, opts?: Partial<ObjectValidator>) => ObjectValidator;
  recordof: (v: Validator, opts?: Partial<ObjectValidator>) => ObjectValidator;
  listof: (v: Validator, opts?: Partial<ArrayValidator>) => ArrayValidator;
}

export const _: ValidatorsHelpers = {
  string(opts) {
    return { ...safeSpread(opts), type: 'string' };
  },
  bool(opts) {
    return { ...safeSpread(opts), type: 'boolean' };
  },
  number(opts) {
    return { ...safeSpread(opts), type: 'number' };
  },
  listof(v, opts) {
    return { ...safeSpread(opts), type: 'array', of: v };
  },
  recordof(v, opts) {
    return {
      ...safeSpread(opts),
      type: 'object',
      shape: {
        [UnknownKey]: v,
      },
    };
  },
  record(v, opts) {
    return {
      ...safeSpread(opts),
      type: 'object',
      shape: v,
    };
  },
};
