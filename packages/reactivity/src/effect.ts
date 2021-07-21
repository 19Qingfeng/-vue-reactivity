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
  reactiveEffect._isEffect = true;
  reactiveEffect._raw = fn;
  reactiveEffect._options = options;

  return reactiveEffect;
}

// track关联响应式对象的属性和相应的effect进行关联
export function track(target: any, type: number, key: string) {
  console.log(target, key, activeEffect);
  // 当前属性 依赖收集相关联的Effect
  // activeEffect; // 当前触发的effect
}
