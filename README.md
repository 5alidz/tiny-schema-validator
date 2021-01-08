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
import { createSchema, _ } from 'tiny-schema-validator';

export const Person = createSchema({
  name: _.string({
    minLength: [5, 'name is too short'],
    maxLength: [20, 'name is too long'],
  }),
  age: _.number({
    min: [13, 'members should be above 13 years old'],
    max: [200, 'i am not sure you can do this'],
  }),
  pets: _.listOf(_.record({ name: _.string(), animal: _.string() }, { optional: true })),
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
} else {
  // handle errors
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

## Compose schemas

```js
// in ./models/Project
import { createSchema, _ } from 'tiny-schema-validator';

export const Project = createSchema({
  name: _.string(),
  url: _.string(),
});

// in ./models/User
import { createSchema } from 'tiny-schema-validator';
import { Project } from './Project';

export const User = createSchema({
  username: _.string(),
  email: _.string(),
  projects: _.listOf(Project.toObjectValidator()), // embed Project schema inside User schema
});
```

## Custom types

```js
// in ./models/customTypes
import { _ } from 'tiny-schema-validator';

export const email = ({ optional = false }) =>
  _.string({
    optional,
    pattern: [/.+@company\.com/, 'invalid company email'],
  });

export const tags = ({ optional = false }) =>
  _.listOf(_.string({ pattern: [/swimming|painting|football|reading/, 'unknown tag'] }), {
    optional,
  });

// in ./models/User
import { createSchema, _ } from 'tiny-schema-validator';
import { email, tags } from './customTypes';

export const User = createSchema({
  username: _.string(),
  email: email(),
  hobbies: tags(),
});
```

## Validators sepc

```typescript
type StringValidator = {
  type: 'string';
  optional?: boolean;
  minLength?: [value: number, errorMessage: string];
  maxLength?: [value: number, errorMessage: string];
  pattern?: [RegExp, string];
}

type NumberValidator = {
  type: 'number';
  optional?: boolean;
  max?: [value: number, errorMessage: string];
  min?: [value: number, errorMessage: string];
}

type BooleanValidator = {
  type: 'boolean';
  optional?: boolean;
}

type ArrayValidator = {
  type: 'array';
  optional?: boolean;
  of: StringValidator | NumberValidator | BooleanValidator | ArrayValidator | ObjectValidator;
}

type ObjectValidator = {
  type: 'object';
  optional?: boolean;
  shape: {
    [key: string]: StringValidator | NumberValidator | BooleanValidator | ArrayValidator | ObjectValidator;
  };
}

```
