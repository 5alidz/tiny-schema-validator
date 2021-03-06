import { ARRAY, BOOLEAN, NUMBER, OBJECT, STRING } from './constants';
import { UnknownKey, safeSpread } from './utils';
import {
  ArrayValidator,
  BooleanValidator,
  NumberValidator,
  ObjectValidator,
  StringValidator,
  Validator,
} from './validatorTypes';

type WithOutType<T> = Omit<T, 'type'>;

interface ValidatorsHelpers {
  string: (opts?: Partial<WithOutType<StringValidator>>) => StringValidator;
  bool: (opts?: Partial<WithOutType<BooleanValidator>>) => BooleanValidator;
  number: (opts?: Partial<WithOutType<NumberValidator>>) => NumberValidator;
  record: (
    v: Record<string, Validator>,
    opts?: Partial<WithOutType<ObjectValidator>>
  ) => ObjectValidator;
  recordof: (v: Validator, opts?: Partial<WithOutType<ObjectValidator>>) => ObjectValidator;
  listof: (v: Validator, opts?: Partial<WithOutType<ArrayValidator>>) => ArrayValidator;
}

export const _: ValidatorsHelpers = {
  string(opts) {
    return { ...safeSpread(opts), type: STRING };
  },
  bool(opts) {
    return { ...safeSpread(opts), type: BOOLEAN };
  },
  number(opts) {
    return { ...safeSpread(opts), type: NUMBER };
  },
  listof(v, opts) {
    return { ...safeSpread(opts), type: ARRAY, of: v };
  },
  recordof(v, opts) {
    return {
      ...safeSpread(opts),
      type: OBJECT,
      shape: {
        [UnknownKey]: v,
      },
    };
  },
  record(v, opts) {
    return {
      ...safeSpread(opts),
      type: OBJECT,
      shape: v,
    };
  },
};
