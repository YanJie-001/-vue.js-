// 将get中存储副作用函数封装为track函数
// 将set中的触发副租用函数封装为trigger函数

const bucket = new WeakMap()
const data = { text: 'hello world' }
let activeEffect
function effect(fn) {
  activeEffect = fn
  fn()
}
const obj = new Proxy(data, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    trigger(target, key)
  }
})

function track(target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  effects && effects.forEach(fn => fn())
}

effect(() => {
  console.log('effect run')
  document.body.innerText = obj.text
})

setTimeout(() => {
  // 新增其他的key也触发的副作用函数
  obj.notExist = 'hello vue3'
}, 1000);

setTimeout(() => {
  obj.text = 'hello vue3'
}, 2000);