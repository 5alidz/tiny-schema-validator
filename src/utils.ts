export const ObjectKeys = Object.keys.bind(Object);
export const isBool = (value: unknown): value is boolean => typeof value == 'boolean';
export const isString = (value: unknown): value is string => typeof value == 'string';
export const isNumber = (value: unknown): value is number =>
  typeof value == 'number' && !isNaN(value as number) && Number.isFinite(value);

export const UnknownKey = Symbol.for('gssu5l');

export const safeSpread = <T extends object>(o?: T) => (o ? o : {});

export function isPlainObject(maybeObject: any): maybeObject is Record<string, any> {
  return (
    typeof maybeObject == 'object' &&
    maybeObject != null &&
    Object.prototype.toString.call(maybeObject) == '[object Object]'
  );
}
