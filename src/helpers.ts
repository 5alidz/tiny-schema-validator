import {
  StringValidator,
  NumberValidator,
  BooleanValidator,
  Validator,
  ListValidator,
  ListofValidator,
  RecordValidator,
  RecordofValidator,
} from './validatorTypes';
import { string, number, boolean, list, listof, record, recordof } from './constants';

type WithoutType<T> = Omit<T, 'type'>;

export interface Helpers {
  string(opts?: Partial<WithoutType<StringValidator>>): StringValidator;
  number(opts?: Partial<WithoutType<NumberValidator>>): NumberValidator;
  boolean(opts?: Partial<WithoutType<BooleanValidator>>): BooleanValidator;
  list(validators: Validator[], opts?: { optional?: boolean }): ListValidator;
  listof(validator: Validator, opts?: { optional?: boolean }): ListofValidator;
  record(schema: { [key: string]: Validator }, opts?: { optional?: boolean }): RecordValidator;
  recordof(validator: Validator, opts?: { optional?: boolean }): RecordofValidator;
}

const optional = (v?: boolean) => (typeof v == 'boolean' ? v : false);
const base = <T extends keyof Helpers>(type: T, optional: boolean) => ({ type, optional });

export const _: Helpers = {
  string(opts) {
    return {
      ...opts,
      ...base(string, optional(opts?.optional)),
    };
  },
  boolean(opts) {
    return base(boolean, optional(opts?.optional));
  },
  number(opts) {
    return {
      ...opts,
      ...base(number, optional(opts?.optional)),
    };
  },
  list(shape, opts) {
    return {
      ...base(list, optional(opts?.optional)),
      shape,
    };
  },
  listof(of, opts) {
    return {
      ...base(listof, optional(opts?.optional)),
      of,
    };
  },
  record(shape, opts) {
    return {
      ...base(record, optional(opts?.optional)),
      shape,
    };
  },
  recordof(of, opts) {
    return {
      ...base(recordof, optional(opts?.optional)),
      of,
    };
  },
};
