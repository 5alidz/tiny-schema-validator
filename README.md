[![GitHub license](https://img.shields.io/github/license/5alidz/tiny-schema-validator)](https://github.com/5alidz/tiny-schema-validator/blob/master/LICENSE)

## Installation

```sh
npm i tiny-schema-validator
```

or

```sh
yarn add tiny-schema-validator
```

## Basic usage

```js
/* in your models folder you export a schema */
import { createSchema } from 'tiny-schema-validator';

export const Person = createSchema({
  name: {
    type: 'string',
    minLength: [5, 'name is to short'],
    maxLength: [20, 'name is too long'],
  },
  age: {
    type: 'number',
    min: [13, 'members should be above 13 years old'],
    max: [200, 'i am not sure you can do this'],
  },
  pets: {
    type: 'array',
    optional: true,
    of: {
      type: 'object',
      shape: {
        name: {
          type: 'string',
        },
        animal: {
          type: 'string',
        },
      },
    },
  },
});

/* use the schema in your frontend or nodejs code */
import { Person } from './models/Person';

const errors = Person.validate({
  name: 'John Doe',
  age: 42,
  pets: [{ name: 'pirate', animal: 'parrot' }],
});

if (!errors) {
  // continue doing work safely
}
```

## Easy way to handle incoming data from any source

```js
import { Person } from './models/Person';

const maybeJohn = getPersonByName('John Doe');

try {
  const john = Person.produce(maybeJohn);
  // continue doing work safely
} catch (errors) {
  // if `maybeJohn` has errors you cant catch here errors type
  // type errors = {key: string, message: string}[];
}
```
