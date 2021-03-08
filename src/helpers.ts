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
  record: (v: Record<string, Validator>, opts?: { optional: boolean }) => ObjectValidator;
  recordof: (v: Validator, opts?: { optional: boolean }) => ObjectValidator;
  listof: (v: Validator, opts?: { optional: boolean }) => ArrayValidator;
}

const optional = (value: boolean | void) => (typeof value == 'boolean' ? value : false);

export const _: ValidatorsHelpers = {
  string(opts) {
    return { ...safeSpread(opts), type: STRING, optional: optional(opts?.optional) };
  },
  bool(opts) {
    return { ...safeSpread(opts), type: BOOLEAN, optional: optional(opts?.optional) };
  },
  number(opts) {
    return { ...safeSpread(opts), type: NUMBER, optional: optional(opts?.optional) };
  },
  listof(v, opts) {
    return { ...safeSpread(opts), type: ARRAY, of: v, optional: optional(opts?.optional) };
  },
  recordof(v, opts) {
    return {
      ...safeSpread(opts),
      optional: optional(opts?.optional),
      type: OBJECT,
      shape: {
        [UnknownKey]: v,
      },
    };
  },
  record(v, opts) {
    return {
      ...safeSpread(opts),
      optional: optional(opts?.optional),
      type: OBJECT,
      shape: v,
    };
  },
};
