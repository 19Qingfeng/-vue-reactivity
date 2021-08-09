import { hasChanged, isArray, isPlainObject } from '@vue/share';
import { track, trigger } from './effect';
import { TrackOpTypes, TriggerOpTypes } from './opterations';
import { reactive } from './reactive';

const convert = (val) => (isPlainObject(val) ? reactive(val) : val);

class RefImpl {
  private __v_isRef = true;
  private _value;
  constructor(private _rawValue, private _shallow) {
    // 传入的_rawValue也有可能是一个对象 是对象就要使用reactive进行内部包裹处理
    this._value = _shallow ? _rawValue : reactive(_rawValue);
  }
  get value() {
    // 依赖收集
    track(this, TrackOpTypes.GET, 'value');
    return this._value;
  }
  set value(newValue) {
    const oldValue = this._rawValue;
    if (hasChanged(oldValue, newValue)) {
      this._value = this._shallow ? newValue : convert(newValue);
      this._rawValue = newValue;
      trigger(this, TriggerOpTypes.SET, 'value', newValue, oldValue);
    }
  }
}

// 这里需要明确的是toRef 原始对象如果是非响应式的那么返回的就是非响应式
// 如果是响应式的 那么触发get 就会触发原始proxy对象的get 触发set就会触发原始对象`响应式`对象的set
// 本质上toRef 就是基于原始对象的包装 通过.value访问到原始对象的值。如果原始对象是响应式那么就会触发更新 原始对象不是响应式 那么就不会触发更新
class ObjectRefImpl {
  public __v_isRef = true;

  constructor(private _object, private _key) {}

  get value() {
    return this._object[this._key];
  }

  set value(newValue) {
    this._object[this._key] = newValue;
  }
}

// vue中高阶函数使用的真的多呀

// ref一层使用的类的属性访问器(本质上还是Object.defineProperty)
// 所以ref和reactive的响应式实现本质是不同的
// ref一层是基于Object.definePrototype，而reactive内部是基于Proxy
export function ref(value) {
  return createRef(value, false);
}

export function shallowRef(value) {
  return createRef(value, true);
}

function createRef(value, isShallow) {
  return new RefImpl(value, isShallow);
}

// toRef/toRefs
// toRef/toRefs 上边代码注释过 他们转化实际就是和原本传入对象息息相关
// 传入对象是一个响应式对象 那么转化后的结果就是响应式
// 如果传入对象是一个普通对象 那么转化后的同样也是普通对象
// 对与toRef/toRefs的所有操作都会影响到原本对象 本质上它就外层封装了一个对象 通过.value去访问原有对象的key
// 之所以这么做 是因为希望在结构后，再次访问的使用可以正常的触发响应式对象的getter
export function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}

export function toRefs(target) {
  const result = isArray(target)
    ? new Array(target.length)
    : Object.create(null);
  for (let key in target) {
    result[key] = toRef(target, key);
  }
  return result;
}
