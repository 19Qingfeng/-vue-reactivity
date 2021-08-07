import {
  extend,
  hasChanged,
  hasOwn,
  isArray,
  isInteger,
  isPlainObject,
} from '@vue/share';
import { track, trigger } from './effect';
import { TrackOpTypes, TriggerOpTypes } from './opterations';
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
    debugger
    const res = Reflect.get(target, key, receiver);
    if (!isReadonly) {
      // 非只读 一系列依赖收集功能
      track(target, TrackOpTypes.GET, key);
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
  return function (target, key, value: any, receiver: any) {
    const oldValue = target[key];

    const hadKey =
      isArray(target) && isInteger(key)
        ? key < target.length
        : hasOwn(target, key);

    // 修改值
    const result = Reflect.set(target, key, value, receiver);

    // 触发更新
    if (!hadKey) {
      trigger(target, TriggerOpTypes.ADD, key, value);
    } else if (hasChanged(oldValue, value)) {
      trigger(target, TriggerOpTypes.SET, key, value, oldValue);
    }

    return result;
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
