// setTimeout(() => {
//   let ans = 0
//   for (let i = 0; i < 10000000; i++) {
//     ans += i
//   }
// })







function fn (event) {
  console.log(event, 44444)
  let ans = 0
  const time = 1000000000
  class A {
    constructor() {

    }
    for () {
      for (let i = 0; i < time; i++) {
        ans += 1
      }
    }
  }
  class B {
    constructor() {
    }
    for () {
      for (let i = 0; i < time; i++) {
        ans += 1
      }
    }
  }
  const a = new A
  const b = new B
  a.for()
  b.for()
  self.postMessage({
    method: 'p',
    val: 'ok---lets render'
  })
}

const f = fn.toString()
const blob = new Blob([`onmessage=${f}`], { type: 'text/javascript' });
const url = window.URL.createObjectURL(blob);
const myWorker = new Worker(url);
myWorker.postMessage({
  method: 'p',
  val: 1
})

myWorker.onmessage = function (event) {
  console.log(event, '计算完成')
  document.body.innerHTML = '1'
}
