import { extend, isPlainObject } from '@vue/share';
import { reactive, readonly } from './reactive';

// 实现代理劫持内容
// getter
const get = createGetter(false, false);
const shallow = createGetter(false, true);
const readonlyGet = createGetter(true, false);
const shallowReadonly = createGetter(true, true);

// setter
const set = createSetter(false);
const shallowSet = createSetter(true);

// 获取拦截
function createGetter(isReadonly: boolean, isShallow: boolean) {
  return function (target: object, key: string, receiver: any) {
    const res = Reflect.get(target, key, receiver);
    if (!isReadonly) {
      // 非只读 一系列依赖收集功能
    }
    if (isShallow) {
      // shallow 不需要内部进行递归监听
      return res;
    }
    /* 
      非shallow 递归进行处理
      vue3这里是一个懒处理 相对于vue2来说  Vue2是一上来就递归data进行reactive
      只有getters触发的时候才会递归相应属性进行懒代理(readonly/reactive)
      返回经过处理过后的对象
    */
    if (isPlainObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    return res;
  };
}

// 赋值属性
function createSetter(isShallow: boolean) {
  return function (target: object, key: string, value: any, receiver: any) {
    const res = Reflect.set(target, key, value, receiver);
    return res;
  };
}

const readonlyHandler = {
  set(target: any, key: string) {
    console.warn(
      `Set operation on key "${String(key)}" failed: target is readonly.`
    );
    return true;
  },
};

export const mutableHandle = {
  get,
  set,
};
export const shallowReactiveHandle = {
  get: shallow,
  set: shallowSet,
};
export const readonlyHandle = extend({}, { get: readonlyGet }, readonlyHandler);
export const shallowReadonlyHandle = extend(
  {},
  {
    get: shallowReadonly,
  },
  readonlyHandler
);