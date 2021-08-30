export const ObjectKeys = Object.keys.bind(Object);
export const isArray = (value: unknown): value is any[] => Array.isArray(value);
export const isBool = (value: unknown): value is boolean => typeof value == 'boolean';
export const isString = (value: unknown): value is string => typeof value == 'string';
export const isNumber = (value: unknown): value is number =>
  typeof value == 'number' && Number.isFinite(value);

export function isPlainObject(maybeObject: any): maybeObject is Record<string, any> {
  return (
    typeof maybeObject == 'object' &&
    maybeObject != null &&
    Object.prototype.toString.call(maybeObject) == '[object Object]'
  );
}

export function toObj(value: any) {
  return isArray(value) ? { ...value } : isPlainObject(value) ? value : ({} as Record<string, any>);
}
