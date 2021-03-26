import { createSchema, _ } from '../src/index';
import { TYPEERR } from '../src/constants';

describe('createSchema throws when', () => {
  test('passed invalid schema', () => {
    // @ts-expect-error
    expect(() => createSchema<{ data: null }>(null)).toThrow();
    // @ts-expect-error
    expect(() => createSchema(undefined)).toThrow();
    // @ts-expect-error
    expect(() => createSchema([])).toThrow();
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
