import { createSchema } from '../src/index';

const create_str = (length: number) => {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += 'T';
  }
  return str;
};

describe('primitives only use cases', () => {
  const schema = createSchema({
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 100,
    },
    email: {
      type: 'string',
      pattern: /.+@gmail\.com/,
    },
    age: {
      type: 'number',
      min: 0,
      max: 150,
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
  });

  test('returns correct errors when provided with incorrect data', () => {
    expect(
      schema.validate({ name: true, age: create_str(3), isVerified: 0, email: 42 })
    ).toStrictEqual([
      { key: 'name', message: 'expected string but received boolean' },
      {
        key: 'email',
        message: 'expected string but received number',
      },
      { key: 'age', message: 'expected number but received string' },
      {
        key: 'isVerified',
        message: 'expected boolean but received number',
      },
    ]); // handles validator types

    expect(
      schema.validate({
        name: create_str(101),
        age: 42,
        isVerified: false,
        email: 'john.doe@gmail.com',
      })
    ).toStrictEqual([{ key: 'name', message: 'expected string of length < 100' }]);

    expect(
      schema.validate({ name: 'joe', age: -1, isVerified: true, email: 'john.doe@gmail.com' })
    ).toStrictEqual([{ key: 'age', message: 'expected number to be > 0' }]);

    expect(
      schema.validate({ name: 'jo', age: -1, isVerified: false, email: 'john.doe@gmail.com' })
    ).toStrictEqual([
      { key: 'name', message: 'expected string of length > 3' },
      { key: 'age', message: 'expected number to be > 0' },
    ]);

    expect(
      schema.validate({ name: 'john doe', age: 42, isVerified: true, email: 'joh.doe@hotmail.com' })
    ).toStrictEqual([
      { key: 'email', message: 'expected string to match pattern: /.+@gmail\\.com/' },
    ]);
  });
});
