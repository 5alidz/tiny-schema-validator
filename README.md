[![GitHub license](https://img.shields.io/github/license/5alidz/tiny-schema-validator)](https://github.com/5alidz/tiny-schema-validator/blob/master/LICENSE) ![Minzipped size](https://img.shields.io/bundlephobia/minzip/tiny-schema-validator.svg)

## Installation

```sh
# npm
npm install tiny-schema-validator

#yarn
yarn add tiny-schema-validator
```

#### Basic Example

```js
import { createSchema, _ } from 'tiny-schema-validator';

export const Person = createSchema({
  name: _.string({ maxLength: [100, 'too-long'], minLength: [2, 'too-short'] }),
});

Person.is({ name: 'john doe' }); // true

Person.validate({ name: 'john doe' }); // null
Person.validate({}); // { name: 'invalid-type' }

Person.produce({ name: 'john doe' }); // { name: 'john doe' }
Person.produce({}); // throws -> { name: 'invalid-type' }
```

#### Composing schemas

```js
import { createSchema, _ } from 'tiny-schema-validator';
import { Person } from 'models/person';

export const Group = createSchema({
  // ...
  people: _.listof(Person.embed()),
  // ...
});
```

### API

#### Schema

When you create a schema with `createSchema` it returns a nice API designed to handle multiple cases that you might run into on the client and the server:

- `is` verify that a given object has a valid shape, use for branching logic
- `validate` get errors, use for form validation
- `produce` create data that matches the schema. if it doesn't match, it will throw an error
- `embed` embeds itself in other schemas
- `traverse` (advanced) used by tools like `tiny-schema-form`

For usage, take a look at [the basic example](#basic-example)

#### Validators

All validators are accessible with the `_` (underscore) namespace; The reason for using `_` instead of a good name like `validators` is developer experience, and you can alias it to whatever you want.

```js
import { _ as validators } from 'tiny-schema-validator';

validators.string(); // creates a string validator
```

Checkout the full validators API below:

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
| boolean   |                                 | - `optional` boolean default to false                        |
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

#### Caveats

- When using the `recordof | listof | list` validators, the optional property of the validator is ignored, example:

```js
_.recordof(_.string({ optional: true /* THIS IS IGNORED */ }));
_.list([_.number({ optional: true /* THIS IS IGNORED */ }), _.number()]);
```

### (Advanced) Traversing the schema

This package was built with the intention of reusing the schema in other tools, like generating TypeScript types for example, and traverse helps you achieve that.

##### Signature

```ts
type ConfigFunction = (
  path: string[],
  key: string,
  validator: Validator
) => null | string | { [key: string]: any };

type Config = {
  string?: ConfigFunction;
  number?: ConfigFunction;
  boolean?: ConfigFunction;
  list?: ConfigFunction;
  listof?: ConfigFunction;
  record?: ConfigFunction;
  recordof?: ConfigFunction;
};

type Traverse = <Schema>(config: Config, data?: any, eager?: boolean) => DataFromSchema<Schema>;
```

And here's a simple example of a traverser

```js
const Person = createSchema({
  id: _.string(),
  created: _.number(),
  updated: _.number(),
  profile: _.record({ username: _.string(), email: _.string(), age: _.number() }),
});

const form_ui = Person.traverse({
  number(path, key) {
    if (path.includes('profile')) return { type: 'number', label: key };
    return null; // otherwise ignore
  },
  string(path, key) {
    if (path.includes('profile')) return { type: 'text', label: key };
    return null; // otherwise ignore
  },
});

console.log(form_ui);
/* 
  {
    profile: {
      username: { type: 'text', label: 'username' },
      email: { type: 'text', label: 'email' },
      age: { type: 'number', label: 'age' }
    }
  }
*/
```

NOTE: When parsing `record | recordof | list | listof` make sure to return `null` so the traverse function continue down to all nested validators, otherwise you will need to create your own custom traverser.

example make custom traverser for records:

```js
const Person = createSchema({
  id: _.string(),
  created: _.number(),
  updated: _.number(),
  profile: _.record({ username: _.string(), email: _.string(), age: _.number() }),
});

const customTraverse = (key, validator) => {
  if (validator.type == 'string') {
    return { type: key == 'email' ? key : 'text', label: key };
  } else if (validator.type == 'number') {
    return { type: 'number', label: key };
  } else if (validator.type == 'record') {
    return Object.entries(validator.shape).reduce((acc, [shapeKey, shapeValidator]) => {
      acc[shapeKey] = customTraverse(shapeKey, shapeValidator);
      return acc;
    }, {});
  } else {
    return null;
  }
};

const form_ui = Person.traverse({
  record(_, key, validator) {
    return customTraverse(key, validator);
  },
});

console.log(form_ui);
/* 
  {
    profile: {
      username: { type: 'text', label: 'username' },
      email: { type: 'email', label: 'email' },
      age: { type: 'number', label: 'age' },
    }
  }
*/
```
