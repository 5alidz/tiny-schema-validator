# Tiny Schema Validator

JSON schema validator with excellent type inference for JavaScript and TypeScript.

[![GitHub license](https://img.shields.io/github/license/5alidz/tiny-schema-validator)](https://github.com/5alidz/tiny-schema-validator/blob/master/LICENSE) ![Minzipped size](https://img.shields.io/bundlephobia/minzip/tiny-schema-validator.svg)

## Installation

```sh
npm install tiny-schema-validator
# or
yarn add tiny-schema-validator
```

## Usage

### Creating a schema

```js
import { createSchema, _ } from 'tiny-schema-validator';

export const User = createSchema({
  metadata: _.record({
    date_created: _.number(),
    id: _.string(),
  }),
  profile: _.record({
    name: _.string({
      maxLength: [100, 'too-long'],
      minLength: [2, 'too-short'],
    }),
    age: _.number({
      max: [150, 'too-old'],
      min: [13, 'too-young'],
    }),
    email: _.string({
      pattern: [/^[^@]+@[^@]+\.[^@]+$/, 'invalid-email'],
    }),
  }),
  payment_status: _.union(
    _.constant('pending'),
    _.constant('failed'),
    _.constant('success'),
    _.constant('canceled')
  ),
});
```

and in TypeScript, everything is the same, but to get the data type inferred from the schema, you can do this:

```ts
/*
  UserType {
    metadata: {
      date_created: number;
      id: string;
    };
    profile: {
      name: string;
      age: number;
      email: string;
    };
    payment_status: 'pending' | 'failed' | 'success' | 'canceled';
  }
*/
export type UserType = ReturnType<typeof User.produce>;
```

### Using the schema

When you create a schema, you will get a nice API to handle multiple use-cases in the client and the server.

- `is(data: any): boolean` check if the data is valid (eager evaluation)
- `validate(data: any): Errors` errors returned has the same shape as the schema you defined (does not throw)
- `produce(data: any): data` throws an error when the data is invalid. otherwise, it returns data
- `embed(config?: { optional: boolean })` embeds the schema in other schemas
- `source` the schema itself in a parsable format

example usage:

```js
const Person = createSchema({
  name: _.string(),
  age: _.number(),
  email: _.string(),
});

const john = { name: 'john', age: 42, email: 'john@gmail.com' };
Person.is({}); // false
Person.is(john); // true

Person.validate({}); // { name: 'invalid-type', age: 'invalid-type', email: 'invalid-type' }
Person.validate(john); // null

try {
  Person.produce(undefined);
} catch (e) {
  console.log(e instanceof TypeError); // true
  console.log(e.message); // "invalid-data"
}

// embedding the person schema
const GroupOfPeople = createSchema({
  // ...
  people: _.listof(Person.embed()),
  // ...
});
```

## Validators

All validators are required by default.
All validators are accessible with the `_` (underscore) namespace; The reason for using `_` instead of a good name like `validators` is developer experience, and you can alias it to whatever you want.

```js
import { _ as validators } from 'tiny-schema-validator';
```

Example of all validators and corresponding Typescript types:

<!-- prettier-ignore -->
```js
import { _ } from 'tiny-schema-validator';

// NOTE: when you call a validator you just create an object 
// containing { type: '<type of validator>', ...options }
// this is just a shorthand for that.

// simple validators.
_.string(); // string
_.number(); // number
_.boolean(); // boolean
_.constant(42); // 42

// complex validators (types that accepts other types as paramater)
_.union(
  _.record({ id: _.string() }),
  _.constant(1),
  _.constant(2),
  _.constant(3)
); // { id: string; } | 1 | 2 | 3

_.list([
  _.number(),
  _.string(),
]); // [number, number]
_.record({
  timestamp: _.number(),
  id: _.string(),
}); // { timestamp: number; id: string; }

_.listof(validators.string()); // string[]
_.recordof(validators.string()); // Record<string, string>
```

Check out the full validators API below:

| validator | signature                       | props                                                          |
| :-------- | ------------------------------- | :------------------------------------------------------------- |
|           |                                 |                                                                |
| constant  | `constant(value)`               | value: `string \| number \| boolean`                           |
|           |                                 |                                                                |
| string    | `string(options?)`              | options (optional): Object                                     |
|           |                                 | - `optional : boolean` defaults to false                       |
|           |                                 | - `maxLength: [length: number, error: string]`                 |
|           |                                 | - `minLength: [length: number, error: string]`                 |
|           |                                 | - `pattern : [pattern: RegExp, error: string]`                 |
|           |                                 |                                                                |
| number    | `number(options?)`              | options(optional): Object                                      |
|           |                                 | - `optional: boolean` default to false                         |
|           |                                 | - `min: [number, error: string]`                               |
|           |                                 | - `max: [number, error: string]`                               |
|           |                                 | - `is : ['integer' \| 'float', error: string]` default is both |
|           |                                 |                                                                |
| boolean   | `boolean(options?)`             | options(optional): Object                                      |
|           |                                 | - `optional: boolean` default to false                         |
|           |                                 |                                                                |
| union     | `union(...validators)`          | validators: Array of validators as paramaters                  |
|           |                                 |                                                                |
| list      | `list(validators[], options?)`  | validators: Array of validators                                |
|           |                                 | options(optional): Object                                      |
|           |                                 | - `optional: boolean` default to false                         |
|           |                                 |                                                                |
| listof    | `listof(validator, options?)`   | validator: Validator                                           |
|           |                                 | options(optional): Object                                      |
|           |                                 | - `optional: boolean` default to false                         |
|           |                                 |                                                                |
| record    | `record(shape, options?)`       | shape: `Object { [key: string]: Validator }`                   |
|           |                                 | options(optional): Object                                      |
|           |                                 | - `optional: boolean` default to false                         |
|           |                                 |                                                                |
| recordof  | `recordof(validator, options?)` | validator: `Validator`                                         |
|           |                                 | options(optional): Object                                      |
|           |                                 | - `optional: boolean` default to false                         |

### Custom validators

To create custom validators that do not break type inference:

- use validators from `_` as building blocks for your custom validator.
- your custom validator should define `optional` and `required` functions.

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

## Built-in Errors

```js
// when typeof value does not match the validator infered type
const TYPEERR = 'invalid-type';

// when "schema" in createSchema(schema) is not plain object
const SCHEMAERR = 'invalid-schema';

// when produce(data) and "data" failed to match the schema
// always accompanied be TypeError, so make sure to catch it
const DATAERR = 'invalid-data';

// when an unknown key is found in data while using record | list
// and any keys that exists on data and not present in the schema
const UNKOWN_KEY_ERR = 'unknown-key';
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

Currently, there's no easy way to create recursive types. if you think you could help, PRs are welcome

## Errors while wrapping schemas

if you try to wrap your schema, you will encounter this error (Type instantiation is excessively deep and possibly infinite)
to fix it, you should unwrap your schema and re-create it inside your abstraction.
let's take the following example:

```ts
const User = createSchema({
  name: _.string(),
  age: _.number(),
});

// your abstraction
function schemaWrapper<T>(schema: T) {
  //...
}

const wrappedUser = schemaWrapper(User); // ERROR: Type instantiation is excessively deep and possibly infinite
```

The fix:

```ts
import { Schema, R, RecordOptions } from 'tiny-schema-validator';
/*
optionally, to infer data from the embedded schema, you do DataFrom<T>

import { DataFrom } from 'tiny-schema-validator/dist/type-utils';
*/

// extract schema with Schema.embed()
function schemaWrapper<T extends Schema>(schema: R<RecordOptions<T>>) {
  const newSchema = createSchema(schema.shape); // you can add/remove/modify passed schema here
  // ...
}

const wrappedUser = schemaWrapper(User.embed()); // all good no errors
```
