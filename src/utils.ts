export const UnknownKey = Symbol.for('schema.object.unknown');

export const safeSpread = (o?: Record<string, unknown>) => (o ? o : {});

export function isPlainObject(maybeObject: unknown): maybeObject is Record<string, unknown> {
  return (
    typeof maybeObject == 'object' &&
    maybeObject != null &&
    Object.prototype.toString.call(maybeObject) == '[object Object]'
  );
}
