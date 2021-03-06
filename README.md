[![GitHub license](https://img.shields.io/github/license/5alidz/tiny-schema-validator)](https://github.com/5alidz/tiny-schema-validator/blob/master/LICENSE) ![Minzipped size](https://img.shields.io/bundlephobia/minzip/tiny-schema-validator.svg)

## Installation

```sh
npm i tiny-schema-validator
```

### Example

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
  people: _.listof(Person.embed({ optional: true })),
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

For usage, take a look at [the basic example](#basic-example)

#### Validators

The helpers this package provides are:

- `string`
- `number`
- `bool`
- `record`
- `recordof`
- `listof`

These helpers are functions that return a validator that the schema understands. Take a look at the example below for all the possible options:

```js
_.string({
  optional: true, // default is false
  maxLength: [100, 'too-long'], // [value, errMessage]
  minLength: [0, 'too-short'],
  pattern: [/\w+/, 'invalid-pattern'],
});

_.number({
  optional: true, // default is false
  max: [100, 'too-big'],
  min: [0, 'too-small'],
});

_.bool({
  optional: true, // default is false
});

_.listof(_.string() /* validator (from `_`) */, { optional: true });

_.record(
  {
    /* { [key]: validator }*/
    prop1: _.string(),
    prop2: _.number(),
  },
  { optional: true }
);

_.recordof(_.string() /* validator */, { optional: true });
```
