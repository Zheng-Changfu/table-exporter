export const noop = () => { }

export const isObject = val => Object.prototype.toString.call(val).slice(8, -1) === 'Object'

export const isFunction = val => typeof val === 'function'

export const isNumber = val => typeof val === 'number'

export const isString = val => typeof val === 'string'

export const isEmptyObj = obj => JSON.stringify(obj) === JSON.stringify({})

export const isArray = val => Array.isArray(val)

export const warn = val => console.warn(val)

/**
 * @description 递归遍历树,会对源数据增加一些额外字段
 * @param {*} data 树形结构的数组
 * @param {*} callback1 入栈时调用的回调
 * @param {*} callback2 出栈时调用的回调
 */
export function eachTree (data, callback1 = noop, callback2 = noop, options = {}) {
  /**
    $level:当前数据的层级
    $parent:当前数据的父级
    $sort:当前数据在父级中的排序
    $leafNode:是否为叶子节点
   */
  const field = options.field ? options.field : 'children';
  function fn (data, parent = null, level = 1) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const children = item[field]
      const hasChildren = children && children.length > 0
      item.$level = level
      item.$parent = parent
      item.$sort = i
      item.$leafNode = !hasChildren
      callback1(item)
      if (hasChildren) {
        item[field] = fn(children, item, level + 1)
        callback2(item)
      }
    }
    return data
  }
  return fn(data)
}

export const createArray = (len, cb) => {
  return Array.from({ length: len }, (v, k) => {
    return cb(k, v)
  });
}

// 扁平化树,增加level字段
export const flatTree = (data, field = 'children', level = 1) => {
  let result = []
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const children = item[field]
    const hasChildren = children && children.length > 0
    item.$level = level
    result.push(item)
    if (hasChildren) {
      delete item[field]
      result = result.concat(
        flatTree(children, field, level + 1)
      )
    }
  }
  return result
}

export const hasOwnProperty = (obj, prop) => Object.hasOwnProperty.call(obj, prop)

export const getObjectLen = obj => Object.keys(obj).length

export const getImageSuffix = url => (url.match(/data:image\/(.*);base64/) || [])[1]

export const hasWorkerByBrower = () => isFunction(window.Worker)


