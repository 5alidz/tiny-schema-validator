export const UnknownKey = Symbol.for('schema.object.unknown');

export function isPlainObject(maybeObject: unknown) {
  return (
    typeof maybeObject == 'object' &&
    maybeObject != null &&
    Object.prototype.toString.call(maybeObject) == '[object Object]'
  );
}
