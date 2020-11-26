import { createSchema, dynamicObjectKey } from '../src/index';

// quick and minimal to create strings to be used against stringValidators
const create_str = (length: number, fill: string = 'T') => {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += fill;
  }
  return str;
};

describe('throws on invalid schema-or-data type', () => {
  test('throws when schema is not a valid plain object', () => {
    // @ts-expect-error
    expect(() => createSchema(null)).toThrow();
    // @ts-expect-error
    expect(() => createSchema(undefined)).toThrow();
    // @ts-expect-error
    expect(() => createSchema([])).toThrow();
  });

  test('throws when data is not a valid plain object', () => {
    expect(() => createSchema({}).validate(null)).toThrow();
    expect(() => createSchema({}).validate(undefined)).toThrow();
    expect(() => createSchema({}).validate([])).toThrow();
  });

  test('throws on wrong validators', () => {
    // @ts-expect-error
    expect(() => createSchema({ name: null }).validate({ name: 'hello' })).toThrow();
    // @ts-expect-error
    expect(() => createSchema({ name: undefined }).validate({ name: 'hello' })).toThrow();
    // @ts-expect-error
    expect(() => createSchema({ name: [] }).validate({ name: 'hello' })).toThrow();
  });
});

describe('primitive validators only use cases', () => {
  const schema = createSchema({
    name: {
      type: 'string',
      minLength: [3, 'too short'],
      maxLength: [100, 'too long'],
    },
    email: {
      type: 'string',
      pattern: [/.+@gmail\.com/, 'only gmail'],
    },
    age: {
      type: 'number',
      min: [0, 'too small'],
      max: [150, 'too big'],
    },
    isVerified: {
      type: 'boolean',
    },
  });

  test('does not return errors on happy path', () => {
    expect(
      schema.validate({ name: 'john doe', age: 42, isVerified: true, email: 'john.doe@gmail.com' })
    ).toBe(null); // typical usage

    expect(
      schema.validate({
        name: create_str(100),
        age: 150,
        isVerified: false,
        email: 'john.doe@gmail.com',
      })
    ).toBe(null); // test max

    expect(
      schema.validate({ name: 'joe', age: 0, isVerified: true, email: 'john.doe@gmail.com' })
    ).toBe(null); // test min

    expect(
      schema.validate({
        name: 'joe',
        age: 0,
        isVerified: true,
        email: 'john.doe@gmail.com',
        shouldBeIgnored: 'hello world',
      })
    ).toBe(null); // test optional
  });

  test('returns correct errors when provided with incorrect data', () => {
    expect(
      schema.validate({ name: true, age: create_str(3), isVerified: 0, email: 42 })
    ).toStrictEqual({
      name: 'Invalid Type',
      email: 'Invalid Type',
      age: 'Invalid Type',
      isVerified: 'Invalid Type',
    });

    expect(
      schema.validate({
        name: create_str(101),
        age: 42,
        isVerified: false,
        email: 'john.doe@gmail.com',
      })
    ).toStrictEqual({ name: 'too long' });

    expect(
      schema.validate({ name: 'joe', age: -1, isVerified: true, email: 'john.doe@gmail.com' })
    ).toStrictEqual({ age: 'too small' });

    expect(
      schema.validate({ name: 'jo', age: -1, isVerified: false, email: 'john.doe@gmail.com' })
    ).toStrictEqual({
      name: 'too short',
      age: 'too small',
    });

    expect(
      schema.validate({ name: 'john doe', age: 42, isVerified: true, email: 'joh.doe@hotmail.com' })
    ).toStrictEqual({ email: 'only gmail' });
  });
});

describe('objects and arrays validators only use cases', () => {
  const schema = createSchema({
    tags: {
      type: 'array',
      of: { type: 'string' },
    },
    metadata: {
      type: 'object',
      shape: {
        issat: { type: 'number' },
        expires: { type: 'number' },
        [dynamicObjectKey]: { type: 'string' },
      },
    },
  });

  test('does not return errors on happy path', () => {
    expect(
      schema.validate({
        tags: [create_str(3), create_str(44)],
        metadata: { issat: Date.now(), expires: Date.now() },
      })
    ).toBe(null); // without dynamic key
    expect(
      schema.validate({
        tags: [create_str(3), create_str(44)],
        metadata: { issat: Date.now(), expires: Date.now(), dynamic_key: 'hello world' },
      })
    ).toBe(null); // passes dynamic keys when defined
  });

  test('returns correct errors when provided with incorrect data', () => {
    expect(
      schema.validate({
        tags: [create_str(3), create_str(44)],
        metadata: { issat: 'today', expires: 'tomorrow' },
      })
    ).toStrictEqual({
      metadata: { issat: 'Invalid Type', expires: 'Invalid Type' },
    });
    expect(
      schema.validate({
        tags: [create_str(3), create_str(44), 42],
        metadata: { issat: 'today', expires: 'tomorrow' },
      })
    ).toStrictEqual({
      tags: { 2: 'Invalid Type' },
      metadata: {
        issat: 'Invalid Type',
        expires: 'Invalid Type',
      },
    });
  });
});

describe('validates and ignores optional keys correctly', () => {
  const schema = createSchema({
    example: {
      type: 'string',
      minLength: [3, 'too short'],
      maxLength: [10, 'too long'],
      pattern: [/T+/, 'invalid pattern'],
      optional: true,
    },
  });

  test('ignores optional key if not found', () => {
    expect(schema.validate({})).toBe(null);
  });

  test('validates optional key if found', () => {
    expect(schema.validate({ example: create_str(2) })).toStrictEqual({
      example: 'too short',
    });
    expect(schema.validate({ example: create_str(11) })).toStrictEqual({
      example: 'too long',
    });
    expect(schema.validate({ example: create_str(10, 'L') })).toStrictEqual({
      example: 'invalid pattern',
    });
    expect(schema.validate({ example: create_str(10, 'T') })).toBe(null);
  });
});

describe('producing data from schema', () => {
  const schema = createSchema({
    email: { type: 'string' },
    username: { type: 'string', minLength: [5, 'too short'], maxLength: [100, 'too long'] },
  });

  test('throws when passed invalid data', () => {
    expect(() => schema.produce({})).toThrow();
    expect(() => schema.produce(null)).toThrow();
    expect(() => schema.produce(undefined)).toThrow();
    expect(() => schema.produce([])).toThrow();
    expect(() =>
      schema.produce({ username: create_str(200), email: 'john.doe@company.com' })
    ).toThrow();
    expect(() => schema.produce({ username: 'John Doe' })).toThrow();
    expect(() => schema.produce({ username: 42, email: [] })).toThrow();
  });

  test('produces correct data', () => {
    expect(schema.produce({ email: 'john.doe@company.com', username: 'John Doe' })).toStrictEqual({
      email: 'john.doe@company.com',
      username: 'John Doe',
    });
  });
});

describe('correct conversion from schema to ObjectValidator', () => {
  const validator = { name: { type: 'string' } } as const;
  const schema = createSchema(validator);
  test('converts to ObjectValidator', () => {
    expect(schema.createObjectValidator()).toStrictEqual({
      type: 'object',
      shape: validator,
      optional: false,
    });
    expect(schema.createObjectValidator({ optional: true })).toStrictEqual({
      type: 'object',
      shape: validator,
      optional: true,
    });
  });
});
