import { traverse } from './traverse';
import { isPlainObject, isNumber, isString, isBool } from './utils';
import { Schema, Validator } from './validatorTypes';
import { TYPEERR } from './constants';

function shouldSkipValidation(value: unknown, validator: Validator) {
  return value == null && Boolean(validator.optional);
}

export function createErrors<T extends Schema>(schema: T, data: any, eager = false) {
  return traverse(
    schema,
    {
      string: ({ validator, value }) => {
        if (shouldSkipValidation(value, validator)) return null;
        if (!isString(value)) return TYPEERR;

        const [minLength, minLengthErrMsg] = validator.minLength ? validator.minLength : [];
        if (minLength && minLengthErrMsg && isNumber(minLength) && value.length < minLength)
          return minLengthErrMsg;

        const [maxLength, maxLengthErrMsg] = validator.maxLength ? validator.maxLength : [];
        if (maxLength && maxLengthErrMsg && isNumber(maxLength) && value.length > maxLength)
          return maxLengthErrMsg;

        const [pattern, patterErrMsg] = validator.pattern ? validator.pattern : [];
        if (pattern && patterErrMsg && pattern.test(value) == false) return patterErrMsg;

        return null;
      },
      number: ({ validator, value }) => {
        if (shouldSkipValidation(value, validator)) return null;

        if (!isNumber(value)) return TYPEERR;

        const [min, minErrMsg] = validator.min ? validator.min : [];
        if (isNumber(min) && value < min && minErrMsg) return minErrMsg;

        const [max, maxErrMsg] = validator.max ? validator.max : [];
        if (isNumber(max) && value > max && maxErrMsg) return maxErrMsg;

        const [is, isErrMsg] = validator.is ? validator.is : [];
        if (isString(is) && isErrMsg) {
          const isInt = Number.isInteger(value);
          if ((isInt && is == 'float') || (!isInt && is == 'integer')) return isErrMsg;
        }

        return null;
      },
      boolean: ({ validator, value }) => {
        if (shouldSkipValidation(value, validator)) return null;
        if (!isBool(value)) return TYPEERR;
        return null;
      },
      list: ({ validator, value }) => {
        if (shouldSkipValidation(value, validator)) return null;
        if (!Array.isArray(value)) return TYPEERR;
        return null;
      },
      listof: ({ validator, value }) => {
        if (shouldSkipValidation(value, validator)) return null;
        if (!Array.isArray(value)) return TYPEERR;
        return null;
      },
      record: ({ validator, value }) => {
        if (shouldSkipValidation(value, validator)) return null;
        if (!isPlainObject(value)) return TYPEERR;
        return null;
      },
      recordof: ({ validator, value }) => {
        if (shouldSkipValidation(value, validator)) return null;
        if (!isPlainObject(value)) return TYPEERR;
        return null;
      },
    },
    data,
    eager
  );
}
