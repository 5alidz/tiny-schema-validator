import { createSchema, _ } from '../src/index';
import { TYPEERR } from '../src/constants';

const createString = (length: number, char?: string) => {
  let s = '';
  for (let i = 0; i < length; i++) s += char || ' ';
  return s;
};

describe('string validator', () => {
  const name = (() => {
    const config = {
      maxLength: [100, 'too-long'] as [number, string],
      minLength: [10, 'too-short'] as [number, string],
      pattern: [/[a-zA-Z]/g, 'invalid-pattern'] as [RegExp, string],
    };
    return {
      optional: () => _.string({ ...config, optional: true }),
      required: () => _.string(config),
    };
  })();
  const Person1 = createSchema({
    name: name.optional(),
  });
  const Person2 = createSchema({
    name: name.required(),
  });

  test('tests type', () => {
    expect(Person1.is({ name: 0 })).toBe(false);
    expect(Person1.is({ name: 42 })).toBe(false);
    expect(Person1.is({ name: {} })).toBe(false);
    expect(Person1.is({ name: [] })).toBe(false);
    expect(Person1.is({ name: true })).toBe(false);

    expect(Person2.is({ name: 0 })).toBe(false);
    expect(Person2.is({ name: 42 })).toBe(false);
    expect(Person2.is({ name: {} })).toBe(false);
    expect(Person2.is({ name: [] })).toBe(false);
    expect(Person2.is({ name: true })).toBe(false);
  });

  test('optional', () => {
    expect(Person1.is({ name: undefined })).toBe(true);
    expect(Person1.is({ name: null })).toBe(true);

    expect(Person1.is({ name: 0 })).toBe(false);
    expect(Person1.is({ name: '' })).toBe(false);

    expect(Person2.is({ name: undefined })).toBe(false);
    expect(Person2.is({ name: null })).toBe(false);

    expect(Person2.is({ name: 0 })).toBe(false);
    expect(Person2.is({ name: '' })).toBe(false);
  });

  test('pattern', () => {
    expect(Person1.is({ name: '0123456789' })).toBe(false);
    expect(Person1.is({ name: '----------' })).toBe(false);
    expect(Person1.is({ name: '__________' })).toBe(false);
    expect(Person1.is({ name: 'abcdefghij' })).toBe(true);

    expect(Person2.is({ name: '0123456789' })).toBe(false);
    expect(Person2.is({ name: '----------' })).toBe(false);
    expect(Person2.is({ name: '__________' })).toBe(false);
    expect(Person2.is({ name: 'abcdefghij' })).toBe(true);
  });

  test('maxLength', () => {
    expect(Person1.is({ name: '' })).toBe(false);
    expect(Person1.is({ name: createString(100, 'a') })).toBe(true);
    expect(Person1.is({ name: createString(101, 'a') })).toBe(false);
  });

  test('minLength', () => {
    expect(Person1.is({ name: '' })).toBe(false);
    expect(Person1.is({ name: createString(9, 'a') })).toBe(false);
    expect(Person1.is({ name: createString(10, 'a') })).toBe(true);
  });

  test('emits correct error message', () => {
    expect(Person1.validate({ name: '' })).toStrictEqual({ name: 'too-short' });
    expect(Person1.validate({ name: createString(101, 'a') })).toStrictEqual({ name: 'too-long' });
    expect(Person1.validate({ name: createString(11, '0') })).toStrictEqual({
      name: 'invalid-pattern',
    });
  });
});

describe('number validator', () => {
  const age = (() => {
    const config = {
      max: [10, 'too-large'] as [number, string],
      min: [1, 'too-small'] as [number, string],
      is: ['integer', 'wrong-type-of-number'] as ['integer', string],
    };
    return {
      optional: () => _.number({ ...config, optional: true }),
      required: () => _.number(config),
    };
  })();

  const Person1 = createSchema({
    age: age.optional(),
    n: _.number({ optional: true }),
  });
  const Person2 = createSchema({
    age: age.required(),
    n: _.number({ optional: true }),
  });

  test('tests type', () => {
    expect(Person1.is({ age: '' })).toBe(false);
    expect(Person1.is({ age: {} })).toBe(false);
    expect(Person1.is({ age: [] })).toBe(false);
    expect(Person1.is({ age: true })).toBe(false);
    expect(Person1.is({ age: Infinity, n: Infinity })).toBe(false);
    expect(Person1.is({ age: -Infinity, n: -Infinity })).toBe(false);
    expect(Person1.is({ age: NaN, n: NaN })).toBe(false);

    expect(Person2.is({ age: '' })).toBe(false);
    expect(Person2.is({ age: {} })).toBe(false);
    expect(Person2.is({ age: [] })).toBe(false);
    expect(Person2.is({ age: true })).toBe(false);
    expect(Person1.is({ age: Infinity, n: Infinity })).toBe(false);
    expect(Person1.is({ age: -Infinity, n: -Infinity })).toBe(false);
    expect(Person1.is({ age: NaN, n: NaN })).toBe(false);
  });

  test('optional', () => {
    expect(Person1.is({ age: undefined })).toBe(true);
    expect(Person1.is({ age: null })).toBe(true);
    expect(Person1.is({ age: false })).toBe(false);

    expect(Person2.is({ age: undefined })).toBe(false);
    expect(Person2.is({ age: null })).toBe(false);
    expect(Person1.is({ age: false })).toBe(false);
  });

  test('max', () => {
    expect(Person1.is({ age: 10 })).toBe(true);
    expect(Person1.is({ age: 11 })).toBe(false);
  });

  test('min', () => {
    expect(Person1.is({ age: 0 })).toBe(false);
    expect(Person1.is({ age: 10 })).toBe(true);
  });

  test('is', () => {
    expect(Person1.is({ age: 9.4 })).toBe(false);
    expect(Person1.is({ age: 10 })).toBe(true);
  });

  test('emits correct error message', () => {
    expect(Person1.validate({ age: 11 })).toStrictEqual({ age: 'too-large' });
    expect(Person1.validate({ age: -1 })).toStrictEqual({ age: 'too-small' });
    expect(Person1.validate({ age: 9.4 })).toStrictEqual({ age: 'wrong-type-of-number' });
  });
});

describe('boolean validator', () => {
  const Person1 = createSchema({
    is: _.boolean({ optional: true }),
  });
  const Person2 = createSchema({
    is: _.boolean(),
  });

  test('tests type', () => {
    expect(Person1.is({ is: 0 })).toBe(false);
    expect(Person1.is({ is: '' })).toBe(false);
    expect(Person1.is({ is: {} })).toBe(false);
    expect(Person1.is({ is: [] })).toBe(false);

    expect(Person2.is({ is: 0 })).toBe(false);
    expect(Person2.is({ is: '' })).toBe(false);
    expect(Person2.is({ is: {} })).toBe(false);
    expect(Person2.is({ is: [] })).toBe(false);

    expect(Person1.is({ is: false })).toBe(true);
    expect(Person1.is({ is: true })).toBe(true);
    expect(Person2.is({ is: false })).toBe(true);
    expect(Person2.is({ is: true })).toBe(true);
  });

  test('optional', () => {
    expect(Person1.is({ is: undefined })).toBe(true);
    expect(Person1.is({ is: null })).toBe(true);

    expect(Person2.is({ is: undefined })).toBe(false);
    expect(Person2.is({ is: null })).toBe(false);
  });
});

describe('listof validator', () => {
  const Person = createSchema({
    friends: _.listof(_.string({ minLength: [2, 'too-short'] })),
  });

  test('emits correct error messages', () => {
    expect(Person.validate({ friends: [] })).toStrictEqual(null);
    expect(Person.validate({ friends: {} })).toStrictEqual({ friends: TYPEERR });
    expect(Person.validate({ friends: [1, 'john'] })).toStrictEqual({ friends: { 0: TYPEERR } });
  });
});

describe('list validator', () => {
  const Person = createSchema({
    friends: _.list([_.string(), _.number()]),
    otherList: _.list([_.string({ minLength: [4, 'lower-bound'] })], { optional: true }),
  });

  test('handles optional property', () => {
    expect(Person.validate({ friends: ['John', 42] })).toBe(null);
    expect(Person.validate({ friends: ['John', 42], otherList: [] })).toStrictEqual({
      otherList: { 0: TYPEERR },
    });
    expect(Person.validate({ friends: ['John', 42], otherList: ['hel'] })).toStrictEqual({
      otherList: { 0: 'lower-bound' },
    });
    expect(Person.validate({ friends: ['John', 42], otherList: ['hell'] })).toStrictEqual(null);
  });

  test('emits correct error messages', () => {
    expect(Person.validate({ friends: [] })).toStrictEqual({ friends: { 0: TYPEERR, 1: TYPEERR } });
    expect(Person.validate({ friends: {} })).toStrictEqual({ friends: TYPEERR });
    expect(Person.validate({ friends: [1, 'john'] })).toStrictEqual({
      friends: { 0: TYPEERR, 1: TYPEERR },
    });
    expect(Person.validate({ friends: ['john', 0] })).toStrictEqual(null);
  });
});

describe('record validator', () => {
  const Person = createSchema({
    meta: _.record({
      id: _.string(),
      date_created: _.number(),
      is_verified: _.boolean(),
    }),
    tags: _.listof(_.string(), { optional: true }),
  });

  test('emits correct error messages', () => {
    expect(Person.validate({})).toStrictEqual({ meta: TYPEERR });
    expect(Person.validate({ meta: {} })).toStrictEqual({
      meta: {
        id: TYPEERR,
        date_created: TYPEERR,
        is_verified: TYPEERR,
      },
    });
    expect(
      Person.validate({ meta: { id: 123, date_created: true, is_verified: '' } })
    ).toStrictEqual({
      meta: {
        id: TYPEERR,
        date_created: TYPEERR,
        is_verified: TYPEERR,
      },
    });
    expect(
      Person.validate({ meta: { id: null, date_created: 123, is_verified: false } })
    ).toStrictEqual({ meta: { id: TYPEERR } });
  });

  test('handle recursive records', () => {
    const s = createSchema({ o: _.record({ o: _.record({ x: _.record({ y: _.number() }) }) }) });

    expect(s.validate({ o: { o: { x: { y: 'hello' } } } })).toStrictEqual({
      o: { o: { x: { y: TYPEERR } } },
    });
  });
});

describe('recordof validator', () => {
  const Group = createSchema({
    people: _.recordof(
      _.record({
        name: _.string(),
        age: _.number(),
      })
    ),
  });

  test('emits correct error messages', () => {
    expect(Group.validate({ people: { john: { name: 'john', age: 42 } } })).toStrictEqual(null);
    expect(
      Group.validate({
        people: {
          john: { name: 'john', age: 42 },
          sarah: { name: 'sarah', age: true },
        },
      })
    ).toStrictEqual({ people: { sarah: { age: TYPEERR } } });
  });
});
