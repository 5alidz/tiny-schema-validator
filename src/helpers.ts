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
} from './validatorTypes';

export function string(config: { optional: true } & Omit<StringOptions, 'type'>): O<StringOptions>;
export function string(config: { optional: false } & Omit<StringOptions, 'type'>): R<StringOptions>;
export function string(
  config: { optional?: boolean } & Omit<StringOptions, 'type'>
): StringValidator;
export function string(config: Omit<StringOptions, 'type'>): R<StringOptions>;
export function string(): R<StringOptions>;
export function string(
  config?: { optional?: boolean } & Omit<StringOptions, 'type'>
): StringValidator {
  return {
    type: 'string',
    optional: Boolean(config?.optional),
    ...config,
  };
}

export function number(config: { optional: true } & Omit<NumberOptions, 'type'>): O<NumberOptions>;
export function number(config: { optional: false } & Omit<NumberOptions, 'type'>): R<NumberOptions>;
export function number(
  config: { optional?: boolean } & Omit<NumberOptions, 'type'>
): NumberValidator;
export function number(config: Omit<NumberOptions, 'type'>): R<NumberOptions>;
export function number(): R<NumberOptions>;
export function number(
  config?: { optional?: boolean } & Omit<NumberOptions, 'type'>
): NumberValidator {
  return {
    type: 'number',
    optional: Boolean(config?.optional),
    ...config,
  };
}

export function boolean(config: { optional: true }): O<BooleanOptions>;
export function boolean(config: { optional: false }): R<BooleanOptions>;
export function boolean(): R<BooleanOptions>;
export function boolean(config?: { optional: boolean }): BooleanValidator {
  return {
    type: 'boolean',
    optional: Boolean(config?.optional),
  };
}

export function list<T extends Validator[]>(list: T): R<ListOptions<T>>;
export function list<T extends Validator[]>(
  list: T,
  config: { optional: false }
): R<ListOptions<T>>;
export function list<T extends Validator[]>(list: T, config: { optional: true }): O<ListOptions<T>>;
export function list<T extends Validator[]>(
  list: T,
  config?: { optional: boolean }
): ListValidator<T> {
  return { type: 'list', optional: Boolean(config?.optional), shape: list };
}

export function listof<T extends Validator>(v: T): R<ListofOptions<T>>;
export function listof<T extends Validator>(v: T, config: { optional: false }): R<ListofOptions<T>>;
export function listof<T extends Validator>(v: T, config: { optional: true }): O<ListofOptions<T>>;
export function listof<T extends Validator>(
  v: T,
  config?: { optional: boolean }
): ListofValidator<T> {
  return {
    type: 'listof',
    optional: Boolean(config?.optional),
    of: v,
  };
}

export function record<T extends Schema>(s: T): R<RecordOptions<T>>;
export function record<T extends Schema>(s: T, config: { optional: false }): R<RecordOptions<T>>;
export function record<T extends Schema>(s: T, config: { optional: true }): O<RecordOptions<T>>;
export function record<T extends Schema>(s: T, config?: { optional: boolean }): RecordValidator<T> {
  return {
    type: 'record',
    optional: Boolean(config?.optional),
    shape: s,
  };
}

export function recordof<T extends Validator>(v: T): R<RecordofOptions<T>>;
export function recordof<T extends Validator>(
  v: T,
  config: { optional: false }
): R<RecordofOptions<T>>;
export function recordof<T extends Validator>(
  v: T,
  config: { optional: true }
): O<RecordofOptions<T>>;
export function recordof<T extends Validator>(
  v: T,
  config?: { optional: boolean }
): RecordofValidator<T> {
  return {
    type: 'recordof',
    of: v,
    optional: Boolean(config?.optional),
  };
}
