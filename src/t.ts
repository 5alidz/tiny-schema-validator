type Opt<T> = T & { optional: true };
type Req<T> = T & { optional: false };
type V<T> = Opt<T> | Req<T>;

interface StringOptions {
  type: 'string';
  maxLength?: [number, string];
  minLength?: [number, string];
  pattern?: [RegExp, string];
}
type StringValidator = V<StringOptions>;

interface NumberOptions {
  type: 'number';
  max?: [number, string];
  min?: [number, string];
  is?: ['integer' | 'float', string];
}
type NumberValidator = V<NumberOptions>;

interface BooleanValidator {
  type: 'boolean';
  optional: boolean;
}

interface ListValidator<T extends Validator[]> {
  type: 'list';
  optional: boolean;
  shape: T;
}

interface ListofValidator<T extends Validator> {
  type: 'listof';
  optional: boolean;
  of: T;
}

interface RecordValidator<T extends Schema> {
  type: 'record';
  optional: boolean;
  shape: T;
}

interface RecordofValidator<T extends Validator> {
  type: 'recordof';
  optional: boolean;
  of: T;
}

type Validator =
  | StringValidator
  | NumberValidator
  | BooleanValidator
  | ListofValidator<Validator>
  | ListValidator<Validator[]>
  | RecordValidator<Schema>
  | RecordofValidator<Validator>;

interface Schema {
  [key: string]: Validator;
}

type DataFrom<S extends Schema> = {
  [K in keyof S]: InferDataType<S[K]>;
};

type InferTypeWithOptional<T, U> = T extends Opt<T> ? U | void : U;

type InferDataType<T> = T extends StringValidator
  ? InferTypeWithOptional<T, string>
  : T extends NumberValidator
  ? InferTypeWithOptional<T, number>
  : T extends BooleanValidator
  ? boolean
  : T extends ListValidator<infer U>
  ? { [K in keyof U]: InferDataType<U[K]> }
  : T extends ListofValidator<infer V>
  ? InferDataType<V>[]
  : T extends RecordValidator<infer S>
  ? { [K in keyof S]: InferDataType<S[K]> }
  : T extends RecordofValidator<infer V>
  ? Record<string, InferDataType<V>>
  : never;

function string(config: { optional: true } & Omit<StringOptions, 'type'>): Opt<StringOptions>;
function string(config: { optional: false } & Omit<StringOptions, 'type'>): Req<StringOptions>;
function string(config: Omit<StringOptions, 'type'>): Req<StringOptions>;
function string(): Req<StringOptions>;
function string(config?: { optional?: boolean } & Omit<StringOptions, 'type'>): StringValidator {
  return {
    type: 'string',
    optional: Boolean(config?.optional),
  };
}

function number(config: { optional: true } & Omit<NumberOptions, 'type'>): Opt<NumberOptions>;
function number(config: { optional: false } & Omit<NumberOptions, 'type'>): Req<NumberOptions>;
function number(config: Omit<NumberOptions, 'type'>): Req<NumberOptions>;
function number(): Req<NumberOptions>;
function number(config?: { optional?: boolean } & Omit<NumberOptions, 'type'>): NumberValidator {
  return {
    type: 'number',
    optional: Boolean(config?.optional),
  };
}

const boolean = (config?: { optional: boolean }): BooleanValidator => ({
  type: 'boolean',
  optional: Boolean(config?.optional),
});

const list = <T extends Validator[]>(
  list: T,
  config?: { optional: boolean }
): ListValidator<T> => ({ type: 'list', shape: list, optional: Boolean(config?.optional) });

const listof = <T extends Validator>(v: T, config?: { optional: boolean }): ListofValidator<T> => ({
  type: 'listof',
  of: v,
  optional: Boolean(config?.optional),
});

const record = <T extends Schema>(s: T, config?: { optional: boolean }): RecordValidator<T> => ({
  type: 'record',
  shape: s,
  optional: Boolean(config?.optional),
});

const recordof = <T extends Validator>(
  v: T,
  config?: { optional: boolean }
): RecordofValidator<T> => ({ type: 'recordof', of: v, optional: Boolean(config?.optional) });

/* TEST USE-CASE */
const create = <S extends Schema>(_: S): DataFrom<S> => ({} as DataFrom<S>); // mock
const res = create({
  id: string({ optional: true, maxLength: [10, 'lksjdf'] }),
  name: string({ maxLength: [20, 'lkasjdf'] }),
  age: number(),
  tags: listof(string()),
  stuff: list([string(), number(), string()]),
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
