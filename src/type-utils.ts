import {
  O,
  BooleanValidator,
  ListValidator,
  ListofValidator,
  NumberValidator,
  RecordValidator,
  RecordofValidator,
  StringValidator,
  Schema,
  Validator,
  ConstantValidator,
  UnionValidator,
} from './validatorTypes';

type InferTypeWithOptional<T, U> = T extends O<T> ? U | undefined : U;
type ArrayElement<T> = T extends readonly unknown[]
  ? T extends readonly (infer ElementType)[]
    ? ElementType
    : never
  : never;

type InferDataType<T> = T extends UnionValidator<infer U>
  ? ArrayElement<InferTypeWithOptional<T, { [K in keyof U]: InferDataType<U[K]> }>>
  : T extends ConstantValidator<infer U>
  ? U
  : T extends StringValidator
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

export type DataFrom<S extends Schema> = {
  [K in keyof S]: InferDataType<S[K]>;
};

export type VisitorMember =
  | 'constant'
  | 'union'
  | 'string'
  | 'number'
  | 'boolean'
  | 'record'
  | 'list'
  | 'recordof'
  | 'listof';

export type ValidatorFromType<T extends string> = T extends 'constant'
  ? ConstantValidator<string | number | boolean>
  : T extends 'union'
  ? UnionValidator<Validator[]>
  : T extends 'string'
  ? StringValidator
  : T extends 'number'
  ? NumberValidator
  : T extends 'boolean'
  ? BooleanValidator
  : T extends 'list'
  ? ListValidator<Validator[]>
  : T extends 'listof'
  ? ListofValidator<Validator>
  : T extends 'record'
  ? RecordValidator<Schema>
  : T extends 'recordof'
  ? RecordofValidator<Validator>
  : never;

export type ShapedValidator = RecordValidator<Schema> | ListValidator<Validator[]>;
export type OfValidator = RecordofValidator<Validator> | ListofValidator<Validator>;
