export const isPlainObject = (param: any): param is object => {
  return Object.prototype.toString.call(param) === '[object Object]';
};

export const extend = Object.assign;
