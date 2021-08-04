export const isPlainObject = (param: any): param is object => {
  return typeof param === 'object' && param !== null
};

export const extend = Object.assign;
