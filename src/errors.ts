function parseMessage(msg: string): [string, string] {
  const parts = msg.split(' ');
  const messagePart = [...parts];
  let key = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('[]')) {
      messagePart.shift();
      const [, , ...id] = part.split('');
      key += `[${id.join('')}]`;
    } else if (part.startsWith('{}')) {
      messagePart.shift();
      const [, , ...id] = part.split('');
      key += `.${id.join('')}`;
    } else {
      break;
    }
  }
  return [key, messagePart.join(' ')];
}

export function makeErr(key: string, errStr: string) {
  if (errStr.startsWith('[]') || errStr.startsWith('{}')) {
    const [id, message] = parseMessage(errStr);
    return { key: `${key}${id}`, message };
  } else {
    return { key, message: errStr };
  }
}
