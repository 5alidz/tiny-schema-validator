import { UnknownKey as dynamicObjectKey, safeSpread } from './utils';
import {
  BooleanValidator,
  NumberValidator,
  ObjectValidator,
  StringValidator,
  Validator,
  ArrayValidator,
} from './validators';

interface ValidatorsHelpers {
  string: (opts?: Partial<StringValidator>) => StringValidator;
  bool: (opts?: Partial<BooleanValidator>) => BooleanValidator;
  number: (opts?: Partial<NumberValidator>) => NumberValidator;
  listOf: (v: Validator, opts?: Partial<ArrayValidator>) => ArrayValidator;
  recordOf: (v: Validator, opts?: Partial<ObjectValidator>) => ObjectValidator;
  record: (v: Record<string, Validator>, opts?: Partial<ObjectValidator>) => ObjectValidator;
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
  listOf(v, opts) {
    return { ...safeSpread(opts), type: 'array', of: v };
  },
  recordOf(v, opts) {
    return {
      ...safeSpread(opts),
      type: 'object',
      shape: {
        [dynamicObjectKey]: v,
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
