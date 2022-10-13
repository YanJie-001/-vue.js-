// WeakMap的key为原始对象data，value为Map
// Map的key为原始对象的key，Map的value为Set
// Set是由副作用函数组成的（依赖集合）

const bucket = new WeakMap()
const data = { text: 'hello world' }
let activeEffect
function effect(fn) {
  activeEffect = fn
  fn()
}
const obj = new Proxy(data, {
  get(target, key) {
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

    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)
    effects && effects.forEach(fn => fn())
  }
})

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