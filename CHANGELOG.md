# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.1.0](https://github.com/5alidz/tiny-schema-validator/compare/v3.0.5...v3.1.0) (2021-07-18)


### Features

* add latest version of typescript ([2e8a339](https://github.com/5alidz/tiny-schema-validator/commit/2e8a339d392bb229d52f79ded5f563e1953e2dc6))

### [3.0.5](https://github.com/5alidz/tiny-schema-validator/compare/v3.0.4...v3.0.5) (2021-04-05)


### Bug Fixes

* narrow down types in case of {} ([5cf59cf](https://github.com/5alidz/tiny-schema-validator/commit/5cf59cfaf5b6b851e0adbce055dd6fb364ccc8c6))

### [3.0.4](https://github.com/5alidz/tiny-schema-validator/compare/v3.0.3...v3.0.4) (2021-04-05)


### Bug Fixes

* fix shape validators recursion even when optional ([994cef6](https://github.com/5alidz/tiny-schema-validator/commit/994cef6229b2accc49c46972e94ef5b41fe8d275))
* move data checking outside the loop ([2d40ec1](https://github.com/5alidz/tiny-schema-validator/commit/2d40ec1a10633d5a20c738e1f44f2da9acbcd7a9))
* optimize types for strict traverse ([4fd3d26](https://github.com/5alidz/tiny-schema-validator/commit/4fd3d26f7e6380a2d9a23ffcbb9804a1d166075b))
* throw TypeError on produce invalid-data ([0462755](https://github.com/5alidz/tiny-schema-validator/commit/04627558e7007ac39622aa085b3380f54997a750))

### [3.0.3](https://github.com/5alidz/tiny-schema-validator/compare/v3.0.1...v3.0.3) (2021-04-02)


### Bug Fixes

* **types:** fix infered schema.embed ([ade04e0](https://github.com/5alidz/tiny-schema-validator/commit/ade04e0684dd0d4cdd1887a32c74ce6542913e90))

### [3.0.2](https://github.com/5alidz/tiny-schema-validator/compare/v3.0.1...v3.0.2) (2021-04-02)


### Bug Fixes

* **types:** fix infered schema.embed ([ade04e0](https://github.com/5alidz/tiny-schema-validator/commit/ade04e0684dd0d4cdd1887a32c74ce6542913e90))

### [3.0.1](https://github.com/5alidz/tiny-schema-validator/compare/v3.0.0...v3.0.1) (2021-03-28)

## [3.0.0](https://github.com/5alidz/tiny-schema-validator/compare/v3.0.0-alpha.0...v3.0.0) (2021-03-26)


### Bug Fixes

* helper better type support & insure primitives is required ([ab37494](https://github.com/5alidz/tiny-schema-validator/commit/ab374945dd1b439701161f38b183b7c1d4fecd7a))

## [3.0.0-alpha.0](https://github.com/5alidz/tiny-schema-validator/compare/v2.1.0-alpha.3...v3.0.0-alpha.0) (2021-03-26)


### ⚠ BREAKING CHANGES

* infers data type automatically for both JS & TS

### Features

* implement better type inference | less work for the user ([a827591](https://github.com/5alidz/tiny-schema-validator/commit/a827591a8ce525b8f32d08e99ffdb8f8f9657485))


### Bug Fixes

* fix validator circular refernce ([f922048](https://github.com/5alidz/tiny-schema-validator/commit/f922048af6faca4389e7d0abfd5c35097946e916))

## [2.1.0-alpha.3](https://github.com/5alidz/tiny-schema-validator/compare/v2.1.0-alpha.2...v2.1.0-alpha.3) (2021-03-19)

## [2.1.0-alpha.2](https://github.com/5alidz/tiny-schema-validator/compare/v2.1.0-alpha.1...v2.1.0-alpha.2) (2021-03-18)


### Bug Fixes

* expose validatorTypes with index.d.ts ([796990d](https://github.com/5alidz/tiny-schema-validator/commit/796990d543de176332973ef198b33e5d8a48ea1d))

## [2.1.0-alpha.1](https://github.com/5alidz/tiny-schema-validator/compare/v2.1.0-alpha.0...v2.1.0-alpha.1) (2021-03-11)


### Bug Fixes

* expose path as array of strings ([f304909](https://github.com/5alidz/tiny-schema-validator/commit/f304909c9d06bf118cf9d33bc0bfa2043f8ff424))
* remove repeated parent path ([ecd7efa](https://github.com/5alidz/tiny-schema-validator/commit/ecd7efa427156c5e56c5a225975451bf467699cc))

## [2.1.0-alpha.0](https://github.com/5alidz/tiny-schema-validator/compare/v2.0.1-alpha.3...v2.1.0-alpha.0) (2021-03-10)


### Features

* expose correct path ([2fa69ae](https://github.com/5alidz/tiny-schema-validator/commit/2fa69ae08c6c95ee76afe60c07da1c060a726208))

### [2.0.1-alpha.3](https://github.com/5alidz/tiny-schema-validator/compare/v2.0.1-alpha.2...v2.0.1-alpha.3) (2021-03-10)


### Bug Fixes

* expose parentkey ([d6d4302](https://github.com/5alidz/tiny-schema-validator/commit/d6d43028f858983b4f74cfeb2908693c56465ded))

### [2.0.1-alpha.2](https://github.com/5alidz/tiny-schema-validator/compare/v2.0.1-alpha.1...v2.0.1-alpha.2) (2021-03-10)


### Bug Fixes

* prettier not supporting export * as ([0bc2a29](https://github.com/5alidz/tiny-schema-validator/commit/0bc2a2960cdee7c135a1fd57245c1892e2b7293d))
* recordof traverse using index instead of key ([9606738](https://github.com/5alidz/tiny-schema-validator/commit/96067381a3115d087f2633dfa7291d238eb01243))

### [2.0.1-alpha.1](https://github.com/5alidz/tiny-schema-validator/compare/v2.0.1-alpha.0...v2.0.1-alpha.1) (2021-03-06)


### Bug Fixes

* better type inference ([a233541](https://github.com/5alidz/tiny-schema-validator/commit/a233541bd1337fc289427046bac02d5b804e15a8))

### [2.0.1-alpha.0](https://github.com/5alidz/tiny-schema-validator/compare/v2.0.0...v2.0.1-alpha.0) (2021-03-06)


### Bug Fixes

* infer errors types ([6ea7d1f](https://github.com/5alidz/tiny-schema-validator/commit/6ea7d1f9ac62aabff78e627d1133c947f10e0d95))

## [2.0.0](https://github.com/5alidz/tiny-schema-validator/compare/v1.0.5...v2.0.0) (2021-03-04)


### ⚠ BREAKING CHANGES

* renamed recordOf -> recordof

* change helpers names to match docs ([65a1f29](https://github.com/5alidz/tiny-schema-validator/commit/65a1f298323d397d7399933252b2022bdacc784a))

### [1.0.5](https://github.com/5alidz/tiny-schema-validator/compare/v1.0.4...v1.0.5) (2021-03-02)
