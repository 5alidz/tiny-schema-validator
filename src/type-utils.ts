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
  ConstantValidator,
  UnionValidator,
  Validator,
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

export type InferCallbackResult<V extends Validator> = V extends
  | StringValidator
  | NumberValidator
  | BooleanValidator
  | ConstantValidator<any>
  | UnionValidator<any>
  ? string
  : V extends ListValidator<infer U>
  ? { [key in number]?: InferCallbackResult<U[key]> }
  : V extends ListofValidator<infer U>
  ? { [key: number]: InferCallbackResult<U> | undefined }
  : V extends RecordValidator<infer U>
  ? { [key in keyof U]?: InferCallbackResult<U[key]> }
  : V extends RecordofValidator<infer U>
  ? { [key: string]: InferCallbackResult<U> | undefined }
  : never;

export type InferResult<S extends Schema> = {
  [key in keyof S]?: InferCallbackResult<S[key]>;
};
