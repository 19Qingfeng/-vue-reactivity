class RefImpl {
  private __v_isRef = true;
  private _rawValue // 暂留位置 原始值
  private _value // 暂留位置
  constructor(public value, private _shallow) {}
}

export function ref(value) {
  return createRef(value, false);
}

export function shallowRef(value) {
  return createRef(value, true);
}

function createRef(value, isShallow) {
  return new RefImpl(value, isShallow);
}
