# Tiny Schema Validator

small, practical, and type-safe Schema validator.

[![GitHub license](https://img.shields.io/github/license/5alidz/tiny-schema-validator)](https://github.com/5alidz/tiny-schema-validator/blob/master/LICENSE) ![Minzipped size](https://img.shields.io/bundlephobia/minzip/tiny-schema-validator.svg)

## History

This started as a side-project for me to learn about advanced TypeScript topics and was never intended to be an npm package,
but I liked how it turned up and decided that it might be useful to use in my future projects.

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

and in TypeScript everything is the same, but to get the data type inferred from the schema you can do this:

```ts
//  PersonType { name: string; age: number; email: string; }
export type PersonType = ReturnType<typeof Person.produce>;
```

## Schema

When you create a schema, you will get a nice API to handle multiple use-cases in the client and the server.

- `is(data: any): boolean` check if the data is valid (eager evaluation)
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

Person.produce(undefined); // throws { name: 'invalid-type' }

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

To create custom validators that does not break type inference:

- use validators from `_` as building blocks for your custom validator.
- your custom validator should define an `optional` and `required` functions.

Example of creating custom validators:

```js
const alphaNumeric = (() => {
  const config = {
    pattern: [/^[a-zA-Z0-9]*$/, 'only-letters-and-number'],
  };
  return {
    required: additional => _.string({ ...additional, ...config, optional: false }), // inferred as Required
    optional: additional => _.string({ ...additional, ...config, optional: true }), // inferred as Optional
  };
})();

const Person = createSchema({
  // ...
  username: alphaNumeric.required({ maxLength: [20, 'username-too-long'] }),
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
  number({ path, key }) {
    if (path.includes('profile')) return { type: 'number', label: key };
    return null; // otherwise ignore
  },
  string({ path, key }) {
    if (path.includes('profile')) return { type: 'text', label: key };
    return null; // otherwise ignore
  },
  // this is required to get the type of "profile" correct
  record: () => null,
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

So to return something from `record` visitor for example, you will need to visit its children recursively.

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
  record({ path, key, validator }) {
    return customTraverse(key, validator);
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

## Recursive types

Currently there's no easy way to create recursive types, if you think you could help, PRs are welcome
