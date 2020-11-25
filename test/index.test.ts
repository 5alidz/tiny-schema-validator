import { UnknownKey, isPlainObject } from '../src/utils';

import {
  validateString,
  validateNumber,
  validateBoolean,
  validateObject,
  validateArray,
  StringValidator,
  NumberValidator,
  BooleanValidator,
  ArrayValidator,
  ObjectValidator,
} from '../src/validators';

import { createSchema, dynamicObjectKey } from '../src/index';

describe('is plain object utility', () => {
  test('test for false positives', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ constructor: true, prototype: true })).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
  });
});

describe('confirm that both Model and Data are valid objects', () => {
  test('throws when schema is not an object', () => {
    // @ts-expect-error
    expect(() => createSchema(undefined)).toThrow();
    // @ts-expect-error
    expect(() => createSchema(null)).toThrow();
  });
  test('throws when data is not an object', () => {
    expect(() => createSchema({ x: { type: 'number' } }).validate(undefined)).toThrow();
    expect(() => createSchema({ x: { type: 'number' } }).validate(null)).toThrow();
  });
});

describe('composable schemas', () => {
  test('accepts other schemas as an object validator', () => {
    const schema = createSchema({
      name: { type: 'string' },
      age: { type: 'number' },
    });
    const containerSchema = createSchema({
      children: { type: 'array', of: schema.getSchemaValidator() },
    });

    expect(containerSchema.validate({ children: [] })).toBe(null);
    expect(containerSchema.validate({ children: [{ name: 'john', age: 12 }] })).toBe(null);
    expect(
      containerSchema.validate({
        children: [
          { name: 'john', age: 12 },
          { name: 'jane', age: undefined },
          { name: 42, age: 20 },
        ],
      })
    ).toStrictEqual([
      {
        key: 'children[1].age',
        message: 'expected number but received undefined',
      },
      {
        key: 'children[2].name',
        message: 'expected string but received number',
      },
    ]);
  });
});

describe('string validator', () => {
  test('accepts empty string when required', () => {
    const validator: StringValidator = {
      type: 'string',
      maxLength: 100,
    };
    expect(validateString(validator, '')).toBe(null);
  });

  test('accepts empty string when optional', () => {
    const validator: StringValidator = {
      type: 'string',
      maxLength: 100,
      optional: true,
    };
    expect(validateString(validator, '')).toBe(null);
  });

  test('validates when required', () => {
    const validator: StringValidator = {
      type: 'string',
    };
    expect(validateString(validator, null)).toBe('expected string but received object');
    expect(validateString(validator, undefined)).toBe('expected string but received undefined');
    expect(validateString(validator, true)).toBe('expected string but received boolean');
    expect(validateString(validator, 1)).toBe('expected string but received number');
  });
  test('validates max and min length', () => {
    const validator: StringValidator = {
      type: 'string',
      minLength: 1,
      maxLength: 5,
    };
    expect(validateString(validator, '123')).toBe(null);
    expect(validateString(validator, '1')).toBe(null);
    expect(validateString(validator, 'hello world')).toBe('expected string of length < 5');
    expect(validateString(validator, '')).toBe('expected string of length > 1');
    expect(validateString(validator, '123456')).toStrictEqual('expected string of length < 5');
  });

  test('ignores when optional and data does not exist', () => {
    const validator: StringValidator = {
      type: 'string',
      optional: true,
    };
    expect(validateString(validator, null)).toBe(null);
    expect(validateString(validator, undefined)).toBe(null);
    expect(validateString(validator, '')).toBe(null);
    expect(validateString(validator, 0)).toBe('expected string but received number');
    expect(validateString(validator, {})).toBe('expected string but received object');
  });
});

describe('number validator', () => {
  test('accepts zero when required', () => {
    const validator: NumberValidator = {
      type: 'number',
    };
    expect(validateNumber(validator, 0)).toBe(null);
  });

  test('accepts zero when optional', () => {
    const validator: NumberValidator = {
      type: 'number',
      optional: true,
    };
    expect(validateNumber(validator, 0)).toBe(null);
  });

  test('validates required', () => {
    const validator: NumberValidator = {
      type: 'number',
    };
    expect(validateNumber(validator, null)).toBe('expected number but received object');
    expect(validateNumber(validator, undefined)).toBe('expected number but received undefined');
    expect(validateNumber(validator, true)).toBe('expected number but received boolean');
    expect(validateNumber(validator, '')).toBe('expected number but received string');
  });

  test('validates min and max', () => {
    const validator: NumberValidator = {
      type: 'number',
      optional: true,
      min: 10,
      max: 100,
    };
    expect(validateNumber(validator, 11)).toBe(null);
    expect(validateNumber(validator, 10)).toBe(null);
    expect(validateNumber(validator, 100)).toBe(null);
    expect(validateNumber(validator, 9)).toBe('expected number to be > 10');
    expect(validateNumber(validator, 101)).toBe('expected number to be < 100');
  });

  test('ignores optional', () => {
    const validator: NumberValidator = {
      type: 'number',
      optional: true,
    };
    expect(validateNumber(validator, null)).toBe(null);
    expect(validateNumber(validator, undefined)).toBe(null);
    expect(validateNumber(validator, 0)).toBe(null);
  });
});

describe('boolean validator', () => {
  test('ignores optional', () => {
    const validator: BooleanValidator = {
      type: 'boolean',
      optional: true,
    };
    expect(validateBoolean(validator, null)).toBe(null);
    expect(validateBoolean(validator, undefined)).toBe(null);
    expect(validateBoolean(validator, false)).toBe(null);
    expect(validateBoolean(validator, true)).toBe(null);
  });

  test('validates required', () => {
    const validator: BooleanValidator = {
      type: 'boolean',
    };
    expect(validateBoolean(validator, null)).toBe('expected boolean but received object');
    expect(validateBoolean(validator, undefined)).toBe('expected boolean but received undefined');
    expect(validateBoolean(validator, false)).toBe(null);
    expect(validateBoolean(validator, true)).toBe(null);
  });
});

describe('array validator', () => {
  test('ignores optional', () => {
    const validator: ArrayValidator = {
      type: 'array',
      of: { type: 'string' },
      optional: true,
    };
    expect(validateArray(validator, null)).toBe(null);
    expect(validateArray(validator, undefined)).toBe(null);
  });

  test('validates when required', () => {
    const validator: ArrayValidator = {
      type: 'array',
      of: { type: 'string' },
    };
    expect(validateArray(validator, null)).toBe('expected array but received object');
    expect(validateArray(validator, undefined)).toBe('expected array but received undefined');
    expect(validateArray(validator, ['hello', 'world'])).toBe(null);
    expect(validateArray(validator, ['hello', 42])).toStrictEqual([
      '[]1 expected string but received number',
    ]);
    expect(validateArray(validator, ['hello', 42, false, 'world'])).toStrictEqual([
      '[]1 expected string but received number',
      '[]2 expected string but received boolean',
    ]);
  });
});

describe('object validator', () => {
  test('ignores optional', () => {
    const validator: ObjectValidator = {
      type: 'object',
      shape: {
        id: { type: 'string' },
      },
      optional: true,
    };
    expect(validateObject(validator, null)).toBe(null);
    expect(validateObject(validator, undefined)).toBe(null);
  });

  test('validates when required', () => {
    const validator: ObjectValidator = {
      type: 'object',
      shape: {
        [UnknownKey]: { type: 'string' },
        id: { type: 'string' },
        num: { type: 'number' },
      },
    };
    expect(validateObject(validator, null)).toBe('expected object but received object');
    expect(validateObject(validator, undefined)).toBe('expected object but received undefined');
    expect(validateObject(validator, { id: 'id', num: 42 })).toBe(null);
    expect(validateObject(validator, { id: 'id' })).toStrictEqual([
      '{}num expected number but received undefined',
    ]);
    expect(validateObject(validator, { hello: 'world', cya: 42 })).toStrictEqual([
      '{}id expected string but received undefined',
      '{}num expected number but received undefined',
      '{}cya expected string but received number',
    ]);
  });
});

describe('produces new objects', () => {
  test('simple use case', () => {
    const Model = createSchema({
      username: { type: 'string' },
      password: { type: 'string' },
    });
    expect(() => Model.produce({ username: 'user', password: 44 })).toThrow();
    expect(Model.produce({ username: 'user_name', password: 'strong_password' })).toStrictEqual({
      username: 'user_name',
      password: 'strong_password',
    });
  });
});

describe('validates dynamic object keys correctly', () => {
  test('it works', () => {
    interface Animal {
      legs: number;
      kind: string;
      details: Record<string, string>;
    }
    const AnimalSchema = createSchema<Animal>({
      legs: { type: 'number', min: 0 },
      kind: { type: 'string' },
      details: { type: 'object', shape: { [dynamicObjectKey]: { type: 'string' } } },
    });

    expect(
      AnimalSchema.validate({
        legs: 4,
        kind: 'Dog',
        details: { breed: 'wolfdog' },
      })
    ).toBe(null);
    expect(
      AnimalSchema.validate({
        legs: 4,
        kind: 'Dog',
        // @ts-expect-error
        details: { breed: 'wolfdog', location: 1134343 },
      })
    ).toStrictEqual([{ key: 'details.location', message: 'expected string but received number' }]);
  });
});
