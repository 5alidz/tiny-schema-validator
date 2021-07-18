import { VisitorMember, ValidatorFromType } from './type-utils';
import {
  Validator,
  Schema,
  RecordValidator,
  RecordofValidator,
  ListValidator,
  ListofValidator,
  StringValidator,
  NumberValidator,
  BooleanValidator,
} from './validatorTypes';

export type Visitor = Partial<
  {
    [K in VisitorMember]: (Utils: {
      path: string[];
      key: string;
      validator: ValidatorFromType<K>;
      value: any;
    }) => any;
  }
>;

type VisitorExists<
  Vi extends Visitor,
  Default,
  VKey extends VisitorMember
> = Vi[VKey] extends undefined
  ? never
  : ReturnType<NonNullable<Vi[VKey]>> extends infer X
  ? X extends string | number | boolean | null | undefined
    ? NonNullable<Default> | NonNullable<X>
    : X extends {}
    ? NonNullable<Default>
    : NonNullable<Default> | NonNullable<X>
  : NonNullable<Default>;

type InferVisitorResult<V extends Validator, Vi extends Visitor> = V extends RecordValidator<
  infer S
>
  ? VisitorExists<Vi, { [K in keyof S]?: NonNullable<InferVisitorResult<S[K], Vi>> }, 'record'>
  : V extends ListValidator<infer A>
  ? VisitorExists<
      Vi,
      { [K in number]: NonNullable<InferVisitorResult<A[number], Vi>> | undefined },
      'list'
    >
  : V extends ListofValidator<infer VV>
  ? VisitorExists<
      Vi,
      { [key: number]: NonNullable<InferVisitorResult<VV, Vi>> | undefined },
      'listof'
    >
  : V extends RecordofValidator<infer VV>
  ? VisitorExists<
      Vi,
      { [key: string]: NonNullable<InferVisitorResult<VV, Vi>> | undefined },
      'recordof'
    >
  : V extends StringValidator
  ? VisitorExists<Vi, ReturnType<NonNullable<Vi['string']>>, 'string'>
  : V extends NumberValidator
  ? VisitorExists<Vi, ReturnType<NonNullable<Vi['number']>>, 'number'>
  : V extends BooleanValidator
  ? VisitorExists<Vi, ReturnType<NonNullable<Vi['boolean']>>, 'boolean'>
  : never;

export type TraverseResult<S extends Schema, V extends Visitor> = {
  [K in keyof S]: InferVisitorResult<S[K], V>;
};
