export const isPlainObject = (param: any): param is object => {
  return typeof param === 'object' && param !== null;
};

export const extend = Object.assign;

export const isArray = Array.isArray;

export const isInteger = (value): value is number =>
  parseInt(value) + '' === value;

export const hasOwn = (target, key) =>
  Object.prototype.hasOwnProperty.call(target, key);

export const hasChanged = (oldValue, newValue): boolean => {
  return oldValue !== newValue;
};
