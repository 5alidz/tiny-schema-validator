## Installation

npm `npm i @5alid/schema`
yarn `yarn add @5alid/schema`

## Usage

```js
import createSchema from '@5alidz/schema';

const Person = createSchema({
  name: {
    type: 'string',
    minLength: 5,
    maxLength: 20,
  },
  age: {
    type: 'number',
    min: 13,
    max: 120,
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

const errors = Person.validate({
  name: 'John Doe',
  age: 42,
  pets: [
    { name: 'fluffy', animal: 'dog' },
    { name: 'pirate', animal: 'parrot' },
  ],
});

console.log(errors); // -> null

const errors2 = Person.validate({
  name: true,
  age: '42',
});

console.log(errors2); // -> [ { key: 'name', message: 'expected string but received "boolean"' }, { key: 'age', message: 'expected number but received "string"' }]
```
