const bucket = new Set()
const data = { text: 'hello world' }
const obj = new Proxy(data, {
  get(target, key) {
    if (activeEffect) {
      bucket.add(activeEffect)
    }
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    bucket.forEach(fn => fn())
    return true
  }
})

let activeEffect
function effect(fn) {
  activeEffect = fn
  fn()
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
