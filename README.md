# Tiny Schema Validator

[![GitHub license](https://img.shields.io/github/license/5alidz/tiny-schema-validator)](https://github.com/5alidz/tiny-schema-validator/blob/master/LICENSE) ![Minzipped size](https://img.shields.io/bundlephobia/minzip/tiny-schema-validator.svg)

- installation
- usage
- schema
- validators
- advanced usage
- caveats

## Installation

```sh
# npm
npm install tiny-schema-validator

#yarn
yarn add tiny-schema-validator
```

## Usage

### Creating a schema

```js
import { createSchema, _ } from 'tiny-schema-validator';

export const Person = createSchema({
  name: _.string({ maxLength: [100, 'too-long'], minLength: [2, 'too-short'] }),
  age: _.number({ max: [150, 'too-old'], min: [13, 'too-young']}),
  email: _.string({ pattern: [/^[^@]+@[^@]+\.[^@]+$/, 'invalid-email']});
});
```

and in TypeScript

```ts
import { createSchema, _ } from 'tiny-schema-validator';

interface IPerson {
  name: string;
  age: number;
  email: string;
}

export const Person = createSchema<IPerson>({
  name: _.string({ maxLength: [100, 'too-long'], minLength: [2, 'too-short'] }),
  age: _.number({ max: [150, 'too-old'], min: [13, 'too-young']}),
  email: _.string({ pattern: [/^[^@]+@[^@]+\.[^@]+$/, 'invalid-email']});
});
```

## Schema

When you create a schema, you will get a nice API to handle multiple use-cases in the client and the server.

- `is(data: any): boolean` check if the data is valid
- `validate(data: any): Errors` errors returned has the same shape as the schema you defined (does not throw)
- `produce(data: any): data` throws an error when the data is invalid. otherwise, it returns data
- `embed(config?: { optional: boolean })` embeds the schema in other schemas
- `traverse(visitor, data?, eager?)` (advanced) see usage below.

Continuing from the previous example:

```js
Person.is({}); // false
Person.is({ name: 'john', age: 42, email: 'john@gmail.com' }); // true

Person.validate({}); // { name: 'invalid-type', age: 'invalid-type', email: 'invalid-type' }
Person.validate({ name: 'john', age: 42, email: 'john@gmail.com' }); // null

Person.produce(undefined); // throws an error with the same shape as the schema

// embedding the person schema
const GroupOfPeople = createSchema({
  // ...
  people: _.listof(Person.embed()),
  // ...
});
```

## Validators

All validators are accessible with the `_` (underscore) namespace; The reason for using `_` instead of a good name like `validators` is developer experience, and you can alias it to whatever you want.

```js
import { _ as validators } from 'tiny-schema-validator';

validators.string(); // creates a string validator
```

Check out the full validators API below:

| validator | signature                       | props                                                        |
| :-------- | ------------------------------- | :----------------------------------------------------------- |
| string    | `string(options?)`              | options (optional): Object                                   |
|           |                                 | - `optional` boolean defaults to false                       |
|           |                                 | - `maxLength` [length: number, error: string]                |
|           |                                 | - `minLength` [length: number, error: string]                |
|           |                                 | - `pattern` [pattern: RegExp, error: string]                 |
|           |                                 |                                                              |
| number    | `number(options?)`              | options(optional): Object                                    |
|           |                                 | - `optional` boolean default to false                        |
|           |                                 | - `min` [number, error: string]                              |
|           |                                 | - `max` [number, error: string]                              |
|           |                                 | - `is` ['integer' \| 'float', error: string] default is both |
|           |                                 |                                                              |
| boolean   | `boolean(options?)`             | options(optional): Object                                    |
|           |                                 | - `optional` boolean default to false                        |
|           |                                 |                                                              |
| list      | `list(validators[], options?)`  | validators: Array of validators                              |
|           |                                 | options(optional): Object                                    |
|           |                                 | - `optional` boolean default to false                        |
|           |                                 |                                                              |
| listof    | `listof(validator, options?)`   | validator: Validator                                         |
|           |                                 | options(optional): Object                                    |
|           |                                 | - `optional` boolean default to false                        |
|           |                                 |                                                              |
| record    | `record(shape, options?)`       | shape: Object `{ [key: string]: Validator }`                 |
|           |                                 | options(optional): Object                                    |
|           |                                 | - `optional` boolean default to false                        |
|           |                                 |                                                              |
| recordof  | `recordof(validator, options?)` | validator: Validator                                         |
|           |                                 | options(optional): Object                                    |
|           |                                 | - `optional` boolean default to false                        |

### Custom validators

You can use validators from `_` as building blocks for your custom validator:

```js
const alphaNumeric = validatorOpts =>
  _.string({
    pattern: [/^[a-zA-Z0-9]*$/, 'only-letters-and-number'],
    ...validatorOpts,
  });

const email = validatorOpts =>
  _.string({
    pattern: [/^[^@]+@[^@]+\.[^@]+$/, 'invalid-email'],
    ...validatorOpts,
  });

const Person = createSchema({
  // ...
  username: alphaNumeric({ maxLength: [20, 'username-too-long'] }),
  email: email(),
  alt_email: email({ optional: true }),
  // ...
});
```

## Advanced usage

In addition to validating data, you can also reuse your schema in other areas, like creating forms UI for example,
`traverse` function come-in handy to help you achieve that.

### Example

In this example, we will transform a schema to create meta-data to be used to create form UI elements.

```js
const User = createSchema({
  id: _.string(),
  created: _.number(),
  updated: _.number(),
  profile: _.record({ username: _.string(), email: _.string(), age: _.number() }),
});

const form_ui = User.traverse({
  number(path, key) {
    if (path.includes('profile')) return { type: 'number', label: key };
    return null; // otherwise ignore
  },
  string(path, key) {
    if (path.includes('profile')) return { type: 'text', label: key };
    return null; // otherwise ignore
  },
});

console.log(form_ui); /* 
  {
    profile: {
      username: { type: 'text', label: 'username' },
      email: { type: 'text', label: 'email' },
      age: { type: 'number', label: 'age' }
    }
  }
*/
```

### How to traverse

The return type of your visitor is important, and there are a few considerations:

Returning `null` from visitor signals to ignore this node from the result, with the exception:
`record | recordof | list | listof`, returning `null` signals to continue down recursively.

So to return something from `record` visitor you will need to visit its children recursively.

_Note_: in most cases defining only the primitive visitors is enough.

Continuing from the previous `User` Example

```js
/*
Say We need this structure:
{
  profile: {
    type: 'container',
    children: [
      { type: 'text', label: 'username' },
      { type: 'text', label: 'email' },
      { type: 'number', label: 'age' }
    ]
  }
}
*/
const customTraverse = (key, validator) => {
  const type = validator.type;

  if (type == 'string') return { type: key == 'email' ? key : 'text', label: key };
  if (type == 'number') return { type: 'number', label: key };
  if (type == 'record')
    return {
      type: 'container',
      children: Object.entries(validator.shape).map(entry => customTraverse(...entry)),
    };
  return null;
};

const form_ui = User.traverse({
  record(path, key, recordValidator) {
    return customTraverse(key, recordValidator);
  },
});
```

## Caveats

- When using the `recordof | listof | list` validators, the optional property of the validator is ignored, example:

```js
_.recordof(_.string({ optional: true /* THIS IS IGNORED */ }));
_.list([_.number({ optional: true /* THIS IS IGNORED */ }), _.number()]);
```

- You might expect errors returned from a `list | listof` validators to be an array but it is actually an object, example:

```js
const list = createSchema({ list: _.listof(_.string()) });
list.validate({ list: ['string', 42, 'string'] }); // { list: { 1: 'invalid-type' } }
```
