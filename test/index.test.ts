import { createSchema, _ } from '../src/index';
import { DATAERR, TYPEERR } from '../src/constants';

describe('createSchema throws when', () => {
  test('passed invalid schema', () => {
    // @ts-expect-error
    expect(() => createSchema(null)).toThrow();
    // @ts-expect-error
    expect(() => createSchema(undefined)).toThrow();
    // @ts-expect-error
    expect(() => createSchema([])).toThrow();
  });
});

const Person = createSchema({
  is_premium: _.boolean({ optional: true }),
  is_verified: _.boolean(),
  name: _.string({
    maxLength: [24, 'too-long'],
    minLength: [2, 'too-short'],
    pattern: [/[a-zA-Z ]/g, 'contains-symbols'],
  }),
  age: _.number({
    max: [150, 'too-old'],
    min: [13, 'too-young'],
  }),
  email: _.string({
    pattern: [/^[^@]+@[^@]+\.[^@]+$/, 'invalid-email'],
  }),
  tags: _.listof(_.string(), { optional: true }),
  friends: _.recordof(_.record({ name: _.string(), id: _.string() }), { optional: true }),
  nested_list: _.list([_.string(), _.list([_.list([_.number()])])], { optional: true }),
  four_tags: _.list([_.string(), _.string(), _.string(), _.string(), _.list([_.number()])], {
    optional: true,
  }),
  meta: _.record({
    id: _.string({ minLength: [1, 'invalid-id'], maxLength: [1000, 'invalid-id'] }),
    created: _.number({ is: ['integer', 'timestamp-should-be-intger'] }),
    updated: _.number({ optional: true }),
    nested: _.record(
      {
        propA: _.number(),
        propB: _.boolean(),
        propC: _.string(),
      },
      { optional: true }
    ),
  }),
});

// type IPerson = ReturnType<typeof Person['produce']>;

describe('validate', () => {
  test('test ignores optional properties when not found', () => {
    const errors = Person.validate({
      is_verified: true,
      name: 'abc',
      age: 42,
      email: 'abc@gmail.com',
      meta: {
        id: '123',
        created: Date.now(),
      },
    });

    /*
    if (errors) {
      errors.age;
      errors.email;
      errors.four_tags;
      errors.friends;
      errors.is_premium;
      errors.is_verified;
      errors.meta;
      errors.name;
      errors.tags;
      errors.nested_list;
    }
    */

    expect(errors).toBe(null);
  });
  test('validates optional properties when found', () => {
    const errors = Person.validate({
      is_premium: 'hello world',
      is_verified: true,
      name: 'abc',
      age: 42,
      email: 'abc@gmail.com',
      meta: {
        id: '123',
        created: Date.now(),
        updated: new Date().toISOString(),
      },
    });
    expect(errors).toStrictEqual({
      is_premium: 'invalid-type',
      meta: {
        updated: 'invalid-type',
      },
    });
  });

  test('emits correct error messages', () => {
    const errors = Person.validate(
      {
        is_premium: 42,
      },
      true
    );
    expect(errors).toStrictEqual({ is_premium: 'invalid-type' });
    const errors2 = Person.validate(
      {
        is_premium: 42,
      },
      true
    );
    expect(errors2).toStrictEqual({ is_premium: 'invalid-type' });
  });
  // test('handles eager validation correctly', () => {
  //   expect(Person.validate({}, true)).toStrictEqual({ name: TYPEERR });
  // });
});

describe('produce', () => {
  const Person = createSchema({
    name: _.string(),
    age: _.number(),
    email: _.string(),
  });

  test('throws on first error', () => {
    expect(() => Person.produce(null)).toThrow(new TypeError(DATAERR));
    expect(() => Person.produce(undefined)).toThrow(new TypeError(DATAERR));
    expect(() => Person.produce(34)).toThrow(new TypeError(DATAERR));
    expect(() => Person.produce('hello world')).toThrow(new TypeError(DATAERR));
    expect(() => {
      return Person.produce({ name: 2, age: 42, email: 'email@example.com' });
    }).toThrow(new TypeError(DATAERR));
  });

  test('let data throw if it matches the schema', () => {
    const p = { name: 'john', age: 42, email: 'john@gmail.com' };
    expect(Person.produce(p)).toStrictEqual(p);
  });
});

describe('is', () => {
  const s = createSchema({
    a: _.record({
      b: _.string({ optional: true }),
      c: _.record({ d: _.number(), e: _.number({ optional: true }) }),
    }),
  });

  test('return correct boolean based on data', () => {
    expect(s.is({ a: { c: { d: 42 } } })).toBe(true);
    expect(s.is({ a: { b: 'hello', c: { e: 120, d: 42 } } })).toBe(true);

    expect(s.is({ a: { b: true, c: { e: 120, d: 42 } } })).toBe(false);
    expect(s.is({ a: { c: { d: 'hello' } } })).toBe(false);
  });
});

describe('eager validation', () => {
  const s = createSchema({
    a: _.record({
      b: _.string({ optional: true }),
      c: _.record({ d: _.number(), e: _.number({ optional: true }) }),
    }),
  });

  test('test 1', () => {
    const errors = s.validate({ a: { b: 42, c: false } }, true);
    expect(errors).toStrictEqual({ a: { b: TYPEERR } });
  });
});

describe('schema api', () => {
  test('`is` returns false when passed incorrect data type', () => {
    const s = createSchema({});
    expect(s.is(undefined)).toBe(false);
    expect(s.is(null)).toBe(false);
    expect(s.is([])).toBe(false);

    expect(s.is({})).toBe(true);
  });
});
