import {
  O,
  R,
  BooleanValidator,
  ListValidator,
  ListofValidator,
  NumberValidator,
  RecordValidator,
  RecordofValidator,
  Schema,
  StringValidator,
  Validator,
  BooleanOptions,
  ListOptions,
  ListofOptions,
  NumberOptions,
  RecordOptions,
  RecordofOptions,
  StringOptions,
  ConstantOptions,
  UnionOptions,
} from './validatorTypes';
import {
  $boolean,
  $constant,
  $list,
  $listof,
  $number,
  $record,
  $recordof,
  $string,
  $union,
} from './constants';

export function string(): R<StringOptions>;
export function string(config: Omit<StringOptions, 'type'>): R<StringOptions>;
export function string(config: { optional: false } & Omit<StringOptions, 'type'>): R<StringOptions>;
export function string(config: { optional: true } & Omit<StringOptions, 'type'>): O<StringOptions>;

export function string(
  config?: { optional?: boolean } & Omit<StringOptions, 'type'>
): StringValidator {
  return {
    type: $string,
    optional: !!config?.optional,
    ...config,
  };
}

export function number(): R<NumberOptions>;
export function number(config: Omit<NumberOptions, 'type'>): R<NumberOptions>;
export function number(config: { optional: true } & Omit<NumberOptions, 'type'>): O<NumberOptions>;
export function number(config: { optional: false } & Omit<NumberOptions, 'type'>): R<NumberOptions>;

export function number(
  config?: { optional?: boolean } & Omit<NumberOptions, 'type'>
): NumberValidator {
  return {
    type: $number,
    optional: !!config?.optional,
    ...config,
  };
}

export function boolean(): R<BooleanOptions>;
export function boolean(config: { optional: true }): O<BooleanOptions>;
export function boolean(config: { optional: false }): R<BooleanOptions>;

export function boolean(config?: { optional: boolean }): BooleanValidator {
  return {
    type: $boolean,
    optional: !!config?.optional,
  };
}

export function list<T extends R<Validator>[]>(list: T): R<ListOptions<T>>;
export function list<T extends R<Validator>[]>(
  list: T,
  config: { optional: false }
): R<ListOptions<T>>;
export function list<T extends R<Validator>[]>(
  list: T,
  config: { optional: true }
): O<ListOptions<T>>;

export function list<T extends R<Validator>[]>(
  list: T,
  config?: { optional: boolean }
): ListValidator<T> {
  return {
    type: $list,
    optional: !!config?.optional,
    shape: list.map(v => ({ ...v, optional: false })) as T,
  };
}

export function listof<T extends R<Validator>>(v: T): R<ListofOptions<T>>;
export function listof<T extends R<Validator>>(
  v: T,
  config: { optional: false }
): R<ListofOptions<T>>;
export function listof<T extends R<Validator>>(
  v: T,
  config: { optional: true }
): O<ListofOptions<T>>;

export function listof<T extends R<Validator>>(
  v: T,
  config?: { optional: boolean }
): ListofValidator<T> {
  return {
    type: $listof,
    optional: !!config?.optional,
    of: { ...v, optional: false },
  };
}

export function record<T extends Schema>(s: T): R<RecordOptions<T>>;
export function record<T extends Schema>(s: T, config: { optional: false }): R<RecordOptions<T>>;
export function record<T extends Schema>(s: T, config: { optional: true }): O<RecordOptions<T>>;

export function record<T extends Schema>(s: T, config?: { optional: boolean }): RecordValidator<T> {
  return {
    type: $record,
    optional: !!config?.optional,
    shape: s,
  };
}

export function recordof<T extends R<Validator>>(v: T): R<RecordofOptions<T>>;
export function recordof<T extends R<Validator>>(
  v: T,
  config: { optional: false }
): R<RecordofOptions<T>>;
export function recordof<T extends R<Validator>>(
  v: T,
  config: { optional: true }
): O<RecordofOptions<T>>;

export function recordof<T extends R<Validator>>(
  v: T,
  config?: { optional: boolean }
): RecordofValidator<T> {
  return {
    type: $recordof,
    of: { ...v, optional: false },
    optional: !!config?.optional,
  };
}

export function constant<T extends string | number | boolean>(v: T): R<ConstantOptions<T>> {
  return {
    type: $constant,
    optional: false,
    value: v,
  };
}

export function union<T extends R<Validator>[]>(...types: T): R<UnionOptions<T>> {
  return {
    type: $union,
    optional: false,
    of: types,
  };
}
