import { isArray } from '@vue/share';

interface EffectOptions {
  lazy?: boolean;
}

// 数据变化重新执行
export function effect(fn: () => void, options: EffectOptions = {}) {
  const effect = createReactiveEffect(fn, options);

  if (!options.lazy) {
    effect(); // 默认先执行一次
  }

  return effect;
}

let uid = 0;
// 开始执行入盏 结束执行出盏 永远只找盏中最后一个
let effectStack = <any>[]; // 全局变量保存当前effect 嵌套逻辑无法处理 修改调用盏进行处理对应effect
let activeEffect: any;
function createReactiveEffect(fn: () => void, options: EffectOptions) {
  const reactiveEffect = function () {
    if (effectStack.includes(reactiveEffect)) {
      /* 
        防止死循环 这样的代码不做已经存在的判断那么就会一直添加effect进行执行
        当id在一个effect中未结束的时候改变 新的effect判断是否放入effectStack
        effect(() => {
          state.id++
        })
      */
      return;
    }
    try {
      activeEffect = reactiveEffect;
      effectStack.push(reactiveEffect);
      return fn(); // 函数执行时会取值 触发Proxy的getter进行依赖收集
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };

  reactiveEffect.uid = uid++;
  reactiveEffect._isEffect = true; // 当前是否是effect
  reactiveEffect._raw = fn; // 原函数
  reactiveEffect._options = options;

  return reactiveEffect;
}

// 保存相关依赖收集
/* 
    weakMap相关内容
      {
        { key:1 }: { 1: <effect>Set }
      }
*/
const weakMap = new WeakMap();
// track关联响应式对象的属性和相应的effect进行关联
export function track(target: any, type: number, key: string) {
  if (!activeEffect) {
    return;
  }
  let depsMap: any = weakMap.get(target);
  // 该对象第一次进行依赖收集 创建一个相关Map对象 关联key和<Effect>Set
  if (!depsMap) {
    weakMap.set(target, (depsMap = new Map()));
  }
  let depSet: any = depsMap.get(key);
  // 该对象下属性进行第一次依赖收集 进行赋值关联Effect
  if (!depSet) {
    depsMap.set(key, (depSet = new Set()));
  }
  // 关联对应的effect 同时注意set自身具有去重的性质
  // effect(() => a = state.name;b=state.name) 所以去重 state.name仅仅关联一个相同的effect
  depSet.add(activeEffect);
  // console.log('收集完成依赖的Map',weakMap)
}

function add(depList, effectList) {
  depList.forEach((value) => {
    effectList.add(value);
  });
}

// 触发更新 触发weakMap中的依赖收集
export function trigger(target, type, key?, newValue?, oldValue?) {
  // 触发WeakMap中更新逻辑执行

  // 这种情况 如果修改的是数组的长度
  // 比如修改 const a = [1,2,3,4,5,6]  我修改 a.length = 2
  // 那么对于索引2以后的依赖收集也全都得更新
  // 但是如果收集的是2之内索引 修改长度 那么就不会更新

  const depEffect = weakMap.get(target);
  if (!depEffect) {
    return;
  }
  const effects = new Set();
  // 如果target是一个数组 并且修改的是长度
  if (isArray(target) && key === 'length') {
    depEffect.forEach((dep, key) => {
      if (key >= newValue) {
        add(dep, effects);
      }
    });
  } else {
    // 直接就修改然后触发对应effect进行执行
  }
  effects.forEach((effect: any) => effect());
}
