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
import { $string, $number, $boolean, $list, $listof, $record, $recordof } from './constants';

type WithoutType<T> = Omit<T, 'type'>;

type Helpers =
  | typeof $string
  | typeof $number
  | typeof $boolean
  | typeof $list
  | typeof $listof
  | typeof $record
  | typeof $recordof;

const optional = (v?: boolean) => (typeof v == 'boolean' ? v : false);

const base = <T extends Helpers>(type: T, optional: boolean) => ({ type, optional });

export function string(opts?: Partial<WithoutType<StringValidator>>): StringValidator {
  return {
    ...opts,
    ...base($string, optional(opts?.optional)),
  };
}

export function boolean(opts?: Partial<WithoutType<BooleanValidator>>): BooleanValidator {
  return base($boolean, optional(opts?.optional));
}
export function number(opts?: Partial<WithoutType<NumberValidator>>): NumberValidator {
  return {
    ...opts,
    ...base($number, optional(opts?.optional)),
  };
}
export function list(shape: Validator[], opts?: { optional?: boolean }): ListValidator {
  return {
    ...base($list, optional(opts?.optional)),
    shape,
  };
}
export function listof(of: Validator, opts?: { optional?: boolean }): ListofValidator {
  return {
    ...base($listof, optional(opts?.optional)),
    of,
  };
}
export function record(
  shape: { [key: string]: Validator },
  opts?: { optional?: boolean }
): RecordValidator {
  return {
    ...base($record, optional(opts?.optional)),
    shape,
  };
}
export function recordof(of: Validator, opts?: { optional?: boolean }): RecordofValidator {
  return {
    ...base($recordof, optional(opts?.optional)),
    of,
  };
}
