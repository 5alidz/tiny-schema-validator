export type StringValidator = {
  type: 'string';
  optional?: boolean;
  minLength?: [number, string];
  maxLength?: [number, string];
  pattern?: [RegExp, string];
};

export type NumberValidator = {
  type: 'number';
  optional?: boolean;
  max?: [number, string];
  min?: [number, string];
};

export type BooleanValidator = {
  type: 'boolean';
  optional?: boolean;
};

export type ObjectValidator = {
  type: 'object';
  optional?: boolean;
  shape: {
    [key: string]: Validator;
  };
};

export type ArrayValidator = {
  type: 'array';
  optional?: boolean;
  of: Validator;
};

export type Validator =
  | StringValidator
  | NumberValidator
  | BooleanValidator
  | ArrayValidator
  | ObjectValidator;

export interface Schema {
  [key: string]: Validator;
}
