import { hasChanged, isPlainObject } from '@vue/share';
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

// vue中高阶函数使用的真的多呀

// ref一层使用的类的属性访问器(本质上还是Object.defineProperty)
// 所以ref和reactive的响应式实现本质是不同的
// ref一层是基于Object.defaultPrototype，而reactive内部是基于Proxy
export function ref(value) {
  return createRef(value, false);
}

export function shallowRef(value) {
  return createRef(value, true);
}

function createRef(value, isShallow) {
  return new RefImpl(value, isShallow);
}
