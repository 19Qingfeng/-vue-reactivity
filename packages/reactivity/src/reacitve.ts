import { isPlainObject } from '@vue/share';
import {
  mutableHandle,
  shallowReactiveHandle,
  readonlyHandle,
  shallowReadonlyHandle,
} from './baseHandlers';

export function reactive(target: any) {
  return createReactiveObject(target, false, mutableHandle, reactiveMap);
}

export function shallowReactive(target: any) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandle,
    shallowReactiveMap
  );
}

export function readonly(target: any) {
  return createReactiveObject(target, true, readonlyHandle, readonlyMap);
}

export function shallowReadonly(target: any) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandle,
    shallowReadOnlyMap
  );
}

// 防止多次代理 缓存
const reactiveMap = new WeakMap();
const shallowReactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
const shallowReadOnlyMap = new WeakMap();
// 函数颗柯里化
export function createReactiveObject(
  target: any,
  isReadonly: boolean,
  baseHandler: object,
  proxyMap: WeakMap<object, any>
) {
  // 保证target必须是对象
  if (isPlainObject(target)) {
    console.warn(`${target} must be object can reactive or readonly`);
    return target;
  }

  // 防止所以进行相同对象的代理
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return target;
  }

  const proxy = new Proxy(target, baseHandler);
  proxy.set(target);

  return proxy;
}
