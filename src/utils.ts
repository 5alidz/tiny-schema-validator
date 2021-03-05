import { BOOLEAN, NUMBER, OBJECT, STRING } from './constants';

export const ObjectKeys = Object.keys.bind(Object);

export const isBool = (value: unknown): value is boolean => typeof value == BOOLEAN;
export const isString = (value: unknown): value is string => typeof value == STRING;
export const isNumber = (value: unknown): value is number =>
  typeof value == NUMBER && !isNaN(value as number) && Number.isFinite(value);

export const UnknownKey = Symbol.for('gssu5l');

export const safeSpread = <T extends object>(o?: T) => (o ? o : {});

export function isPlainObject(maybeObject: unknown): maybeObject is Record<string, unknown> {
  return (
    typeof maybeObject == OBJECT &&
    maybeObject != null &&
    Object.prototype.toString.call(maybeObject) == '[object Object]'
  );
}
