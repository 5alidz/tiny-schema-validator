import { createSchema, Validator, Schema, _ } from '../src/index';

describe('traverse', () => {
  const Person = createSchema({
    id: _.string(),
    created: _.number(),
    updated: _.number(),
    profile: _.record({ username: _.string(), email: _.string(), age: _.number() }),
  });

  test('custom traverse 1', () => {
    const customTraverse = (key: string, validator: Validator) => {
      if (validator.type == 'string') {
        return { type: key == 'email' ? key : 'text', label: key };
      } else if (validator.type == 'number') {
        return { type: 'number', label: key };
      } else if (validator.type == 'record') {
        return {
          type: 'container',
          children: Object.entries(validator.shape).reduce((acc, [shapeKey, shapeValidator]) => {
            acc[shapeKey] = customTraverse(shapeKey, shapeValidator as Validator); // visit children
            return acc;
          }, {} as Record<string, any>),
        };
      } else {
        return null;
      }
    };

    const data = Person.traverse({
      record({ key, validator }) {
        return customTraverse(key, validator);
      },
    });

    expect(data).toStrictEqual({
      profile: {
        type: 'container',
        children: {
          username: { type: 'text', label: 'username' },
          email: { type: 'email', label: 'email' },
          age: { type: 'number', label: 'age' },
        },
      },
    });
  });

  test('custom traverse 2', () => {
    const customTraverse = (key: string, validator: Validator) => {
      if (validator.type == 'string') {
        return { type: key == 'email' ? key : 'text', label: key };
      } else if (validator.type == 'number') {
        return { type: 'number', label: key };
      } else if (validator.type == 'record') {
        return Object.entries(validator.shape as Schema).reduce(
          (acc, [shapeKey, shapeValidator]) => {
            acc[shapeKey] = customTraverse(shapeKey, shapeValidator);
            return acc;
          },
          {} as Record<keyof typeof validator['shape'], any>
        );
      } else {
        return null;
      }
    };

    const profileFormInputsData = Person.traverse({
      record({ key, validator }) {
        return customTraverse(key, validator);
      },
    });

    expect(profileFormInputsData).toStrictEqual({
      profile: {
        username: { type: 'text', label: 'username' },
        email: { type: 'email', label: 'email' },
        age: { type: 'number', label: 'age' },
      },
    });
  });

  test('readme example 2', () => {
    const profileFormInputsData = Person.traverse({
      number({ path, key }) {
        if (path.includes('profile')) return { type: 'number', label: key };
        return null; // otherwise ignore
      },
      string({ path, key }) {
        if (path.includes('profile')) return { type: 'text', label: key };
        return null; // otherwise ignore
      },
      record() {
        return 'ignore children';
      },
    });

    expect(profileFormInputsData).toStrictEqual({
      profile: 'ignore children',
    });
  });

  test('readme example', () => {
    const profileFormInputsData = Person.traverse({
      number({ path, key }) {
        if (path.includes('profile')) return { type: 'number', label: key };
        return null; // otherwise ignore
      },
      string({ path, key }) {
        if (path.includes('profile')) return { type: 'text', label: key };
        return null; // otherwise ignore
      },
      record: () => null,
    });

    expect(profileFormInputsData).toStrictEqual({
      profile: {
        username: { type: 'text', label: 'username' },
        email: { type: 'text', label: 'email' },
        age: { type: 'number', label: 'age' },
      },
    });
  });
});
