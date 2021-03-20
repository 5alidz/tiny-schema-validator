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

export type StringOptions = Partial<WithoutType<StringValidator>>;
export type NumberOptions = Partial<WithoutType<NumberValidator>>;
export type BooleanOptions = Partial<WithoutType<BooleanValidator>>;
export type ListOptions = { optional?: boolean };
export type ListofOptions = { optional?: boolean };
export type RecordOptions = { optional?: boolean };
export type RecordofOptions = { optional?: boolean };

export function string(opts?: StringOptions): StringValidator {
  return {
    ...opts,
    ...base($string, optional(opts?.optional)),
  };
}

export function boolean(opts?: BooleanOptions): BooleanValidator {
  return base($boolean, optional(opts?.optional));
}

export function number(opts?: NumberOptions): NumberValidator {
  return {
    ...opts,
    ...base($number, optional(opts?.optional)),
  };
}

export function list<V extends Validator>(shape: V[], opts?: ListOptions): ListValidator {
  return {
    ...base($list, optional(opts?.optional)),
    shape,
  };
}

export function listof(of: Validator, opts?: ListofOptions): ListofValidator {
  return {
    ...base($listof, optional(opts?.optional)),
    of,
  };
}

export function record(shape: { [key: string]: Validator }, opts?: RecordOptions): RecordValidator {
  return {
    ...base($record, optional(opts?.optional)),
    shape,
  };
}

export function recordof(of: Validator, opts?: RecordofOptions): RecordofValidator {
  return {
    ...base($recordof, optional(opts?.optional)),
    of,
  };
}
