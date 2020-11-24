export type StringValidator = {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  optional?: boolean;
};

export type NumberValidator = {
  type: 'number';
  max?: number;
  min?: number;
  optional?: boolean;
};

export type BooleanValidator = {
  type: 'boolean';
  optional?: boolean;
};

export type ObjectValidator = {
  type: 'object';
  shape: {
    [key: string]: Validator;
  };
  optional?: boolean;
};

export type ArrayValidator = {
  type: 'array';
  of: Validator;
  optional?: boolean;
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

export interface ValidationError {
  key: string;
  message: string;
}

export const UnknownKey = Symbol.for('schema.object.unknown');

export function isPlainObject(maybeObject: unknown) {
  return (
    typeof maybeObject == 'object' &&
    maybeObject != null &&
    Object.prototype.toString.call(maybeObject) == '[object Object]'
  );
}

const parseMessage = (msg: string): [string, string] => {
  const parts = msg.split(' ');
  const messagePart = [...parts];
  let key = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('[]')) {
      messagePart.shift();
      const [, , ...id] = part.split('');
      key += `[${id.join('')}]`;
    } else if (part.startsWith('{}')) {
      messagePart.shift();
      const [, , ...id] = part.split('');
      key += `.${id.join('')}`;
    } else {
      break;
    }
  }
  return [key, messagePart.join(' ')];
};

const makeErr = (key: string, errStr: string) => {
  if (errStr.startsWith('[]') || errStr.startsWith('{}')) {
    const [id, message] = parseMessage(errStr);
    return { key: `${key}${id}`, message };
  } else {
    return { key, message: errStr };
  }
};

function reducer(validator: Validator, value: unknown) {
  if (validator.type == 'string') {
    return validateString(validator, value);
  } else if (validator.type == 'number') {
    return validateNumber(validator, value);
  } else if (validator.type == 'array') {
    return validateArray(validator, value);
  } else if (validator.type == 'boolean') {
    return validateBoolean(validator, value);
  } else if (validator.type == 'object') {
    return validateObject(validator, value);
  } else {
    // @ts-expect-error
    throw new Error(`${validator.type} is not recognized as validation type`);
  }
}

export function validateString(
  validator: StringValidator,
  value: unknown
): string | null {
  if (value == null && validator.optional) {
    return null;
  } else if (typeof value != 'string') {
    return `expected string but received ${typeof value}`;
  } else {
    if (validator.pattern && validator.pattern.test(value) == false) {
      return `expected string to match pattern: ${validator.pattern}`;
    }
    if (
      validator.minLength &&
      typeof validator.minLength == 'number' &&
      value.length < validator.minLength
    ) {
      return `expected string of length > ${validator.minLength}`;
    }
    if (
      validator.maxLength &&
      typeof validator.maxLength == 'number' &&
      value.length > validator.maxLength
    ) {
      return `expected string of length < ${validator.maxLength}`;
    }
    return null;
  }
}

export function validateNumber(
  validator: NumberValidator,
  value: unknown
): string | null {
  if (value == null && validator.optional) {
    return null;
  } else if (typeof value != 'number') {
    return `expected number but received ${typeof value}`;
  } else {
    if (
      validator.min &&
      typeof validator.min == 'number' &&
      value < validator.min
    ) {
      return `expected number to be > ${validator.min}`;
    } else if (
      validator.max &&
      typeof validator.max == 'number' &&
      value > validator.max
    ) {
      return `expected number to be < ${validator.max}`;
    }
    return null;
  }
}

export function validateBoolean(
  validator: BooleanValidator,
  value: unknown
): string | null {
  if (value == null && validator.optional) {
    return null;
  } else if (typeof value != 'boolean') {
    return `expected boolean but received ${typeof value}`;
  } else {
    return null;
  }
}

export function validateObject(
  validator: ObjectValidator,
  value: unknown
): string | string[] | null {
  if (value == null && validator.optional) {
    return null;
  } else if (!isPlainObject(value)) {
    return `expected object but received ${typeof value}`;
  } else if (!validator.shape || !isPlainObject(validator.shape)) {
    return `missing object shape validator`;
  } else {
    const shapeKeys = Object.keys(validator.shape);

    const errors: string[] = [];
    for (let i = 0; i < shapeKeys.length; i++) {
      const shapeKey = shapeKeys[i];
      const shapeValidator = validator.shape[shapeKey];
      const res = reducer(
        shapeValidator,
        (value as Record<string, unknown>)[shapeKey]
      );
      if (res) errors.push(`{}${shapeKey} ${res}`);
    }

    const unknownValidator = validator.shape[(UnknownKey as unknown) as string];
    if (unknownValidator) {
      const unknownKeys = Object.keys(value as Record<string, unknown>).filter(
        key => !shapeKeys.includes(key)
      );
      for (let i = 0; i < unknownKeys.length; i++) {
        const key = unknownKeys[i];
        const res = reducer(
          unknownValidator,
          (value as Record<string, number>)[key]
        );
        if (res) errors.push(`{}${key} ${res}`);
      }
    }

    if (errors.length > 0) {
      return errors;
    } else {
      return null;
    }
  }
}

export function validateArray(
  validator: ArrayValidator,
  value: unknown
): string | string[] | null {
  if (value == null && validator.optional) {
    return null;
  } else if (!Array.isArray(value)) {
    return `expected array but received ${typeof value}`;
  } else {
    if (!validator.of) {
      return `missing array type`;
    }
    const errors: string[] = [];

    for (let i = 0; i < value.length; i++) {
      const res = reducer(validator.of, value[i]);
      if (res) errors.push(`[]${i} ${res}`);
    }

    return errors.length > 0 ? errors : null;
  }
}

export function createSchema<T>(
  _schema: Schema
): Readonly<{
  validate: (data: T) => ValidationError[] | null;
  getSchemaValidator: (config?: { optional: boolean }) => ObjectValidator;
  produce: (data: T) => T;
}> {
  if (!isPlainObject(_schema)) {
    throw new Error('schema should be a valid object');
  }

  const schema = Object.freeze({ ..._schema });
  const schemaKeys = Object.keys(schema);

  function validate(data: T): ValidationError[] | null {
    if (!isPlainObject(data)) {
      throw new Error('data should be a valid object');
    }

    const errors: ValidationError[] = [];

    for (let i = 0; i < schemaKeys.length; i++) {
      const key = schemaKeys[i];
      const validator = schema[key];
      if (!isPlainObject(validator) || !validator) {
        throw new Error(`Invalid validator "${key}"`);
      }
      const value = (data as Record<string, unknown>)[key];
      const err = reducer(validator, value);

      if (typeof err == 'string') {
        errors.push({ key, message: err });
      }
      if (Array.isArray(err)) {
        errors.push(...err.map(errStr => makeErr(key, errStr)));
      }
    }

    return errors.length > 0 ? errors : null;
  }

  function getSchemaValidator(config = { optional: false }): ObjectValidator {
    return config.optional
      ? Object.freeze({
          type: 'object',
          shape: schema,
          optional: true,
        })
      : Object.freeze({
          type: 'object',
          shape: schema,
        });
  }

  function produce(data: T): T {
    const errors = validate(data);
    if (!errors) {
      return data;
    } else {
      throw errors;
    }
  }

  return Object.freeze({
    getSchemaValidator,
    validate,
    produce,
  });
}
