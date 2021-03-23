type O<V> = V & { optional: true };
type R<V> = V & { optional: false };
type V<V> = O<V> | R<V>;

interface StringOptions {
  type: 'string';
  maxLength?: [number, string];
  minLength?: [number, string];
  pattern?: [RegExp, string];
}

interface NumberOptions {
  type: 'number';
  max?: [number, string];
  min?: [number, string];
  is?: ['integer' | 'float', string];
}

interface BooleanOptions {
  type: 'boolean';
}

interface ListOptions<T> {
  type: 'list';
  shape: T;
}

interface ListofOptions<T> {
  type: 'listof';
  of: T;
}

interface RecordOptions<T> {
  type: 'record';
  shape: T;
}

interface RecordofOptions<T> {
  type: 'recordof';
  of: T;
}

type BooleanValidator = V<BooleanOptions>;
type StringValidator = V<StringOptions>;
type NumberValidator = V<NumberOptions>;
type ListValidator<T extends Validator[]> = V<ListOptions<T>>;
type ListofValidator<T extends Validator> = V<ListofOptions<T>>;
type RecordValidator<T extends Schema> = V<RecordOptions<T>>;
type RecordofValidator<T extends Validator> = V<RecordofOptions<T>>;

type Validator =
  | StringValidator
  | NumberValidator
  | BooleanValidator
  | ListofValidator<any>
  | ListValidator<any[]>
  | RecordValidator<any>
  | RecordofValidator<any>;

interface Schema {
  [key: string]: Validator;
}

type DataFrom<S extends Schema> = {
  [K in keyof S]: InferDataType<S[K]>;
};

type InferTypeWithOptional<T, U> = T extends O<T> ? U | undefined : U;

type InferDataType<T> = T extends StringValidator
  ? InferTypeWithOptional<T, string>
  : T extends NumberValidator
  ? InferTypeWithOptional<T, number>
  : T extends BooleanValidator
  ? InferTypeWithOptional<T, boolean>
  : T extends ListValidator<infer U>
  ? InferTypeWithOptional<T, { [K in keyof U]: InferDataType<U[K]> }>
  : T extends ListofValidator<infer V>
  ? InferTypeWithOptional<T, InferDataType<V>[]>
  : T extends RecordValidator<infer S>
  ? InferTypeWithOptional<T, { [K in keyof S]: InferDataType<S[K]> }>
  : T extends RecordofValidator<infer V>
  ? InferTypeWithOptional<T, { [key: string]: InferDataType<V> }>
  : never;

// helpers
function string(config: { optional: true } & Omit<StringOptions, 'type'>): O<StringOptions>;
function string(config: { optional: false } & Omit<StringOptions, 'type'>): R<StringOptions>;
function string(config: Omit<StringOptions, 'type'>): R<StringOptions>;
function string(): R<StringOptions>;
function string(config?: { optional?: boolean } & Omit<StringOptions, 'type'>): StringValidator {
  return {
    type: 'string',
    optional: Boolean(config?.optional),
  };
}

function number(config: { optional: true } & Omit<NumberOptions, 'type'>): O<NumberOptions>;
function number(config: { optional: false } & Omit<NumberOptions, 'type'>): R<NumberOptions>;
function number(config: Omit<NumberOptions, 'type'>): R<NumberOptions>;
function number(): R<NumberOptions>;
function number(config?: { optional?: boolean } & Omit<NumberOptions, 'type'>): NumberValidator {
  return {
    type: 'number',
    optional: Boolean(config?.optional),
  };
}

function boolean(config: { optional: true }): O<BooleanOptions>;
function boolean(config: { optional: false }): R<BooleanOptions>;
function boolean(): R<BooleanOptions>;
function boolean(config?: { optional: boolean }): BooleanValidator {
  return {
    type: 'boolean',
    optional: Boolean(config?.optional),
  };
}

function list<T extends Validator[]>(list: T): R<ListOptions<T>>;
function list<T extends Validator[]>(list: T, config: { optional: false }): R<ListOptions<T>>;
function list<T extends Validator[]>(list: T, config: { optional: true }): O<ListOptions<T>>;
function list<T extends Validator[]>(list: T, config?: { optional: boolean }): ListValidator<T> {
  return { type: 'list', shape: list, optional: Boolean(config?.optional) };
}

function listof<T extends Validator>(v: T): R<ListofOptions<T>>;
function listof<T extends Validator>(v: T, config: { optional: false }): R<ListofOptions<T>>;
function listof<T extends Validator>(v: T, config: { optional: true }): O<ListofOptions<T>>;
function listof<T extends Validator>(v: T, config?: { optional: boolean }): ListofValidator<T> {
  return {
    type: 'listof',
    of: v,
    optional: Boolean(config?.optional),
  };
}

function record<T extends Schema>(s: T): R<RecordOptions<T>>;
function record<T extends Schema>(s: T, config: { optional: false }): R<RecordOptions<T>>;
function record<T extends Schema>(s: T, config: { optional: true }): O<RecordOptions<T>>;
function record<T extends Schema>(s: T, config?: { optional: boolean }): RecordValidator<T> {
  return {
    type: 'record',
    shape: s,
    optional: Boolean(config?.optional),
  };
}

function recordof<T extends Validator>(v: T): R<RecordofOptions<T>>;
function recordof<T extends Validator>(v: T, config: { optional: false }): R<RecordofOptions<T>>;
function recordof<T extends Validator>(v: T, config: { optional: true }): O<RecordofOptions<T>>;
function recordof<T extends Validator>(v: T, config?: { optional: boolean }): RecordofValidator<T> {
  return {
    type: 'recordof',
    of: v,
    optional: Boolean(config?.optional),
  };
}

/* TEST USE-CASE */
const create = <S extends Schema>(_: S): DataFrom<S> => ({} as DataFrom<S>); // mock
const res = create({
  id: string({ optional: true, maxLength: [10, 'lksjdf'] }),
  name: string({ maxLength: [20, 'lkasjdf'] }),
  age: number(),
  isAdult: boolean({ optional: true }),
  tags: listof(string(), { optional: true }),
  stuff: list([string(), number(), string()]),
  other_stuff: listof(record({ x: number(), y: number() })),
  friends: recordof(record({ name: string(), age: number() })),
  meta: record({
    created: number(),
    updated: number(),
    id: string(),
    nested: record({
      y: string(),
    }),
  }),
});
/* ************ */
