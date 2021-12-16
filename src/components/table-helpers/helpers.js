import {
  MapCreateMergeHeaderTable,
  MapCreateMergeMainTable,
  MapCreateNoMergeTable,
  MapCreateCombinMainTable
} from './map-table'

/**
 * 
 * @param {*} merge 是否需要合并
 * @param {*} header 是否为表头
 * @param {*} combin 是否启用组合
 */
function createMapTable (merge, header, combin, options) {
  if (!options) return console.warn('缺少必要的数据')
  const strategy = {
    'true-true-false': MapCreateMergeHeaderTable,
    'true-false-false': MapCreateMergeMainTable,
    'false-false-false': MapCreateNoMergeTable,
    'false-false-true': MapCreateCombinMainTable,
  }
  const key = `${merge}-${header}-${combin}`
  const Class = strategy[key]
  const instance = new Class(options)
  instance.callhook(instance, 'mounted')
  return instance.getTableData()
}

/**
 * @param {Object} options 用户配置
 * @argument {Array} data 数据源,默认为[]
 * @argument {String} field 递归的key,默认为children
 * @argument {Number} startCol 初始从哪里开始进行合并，默认从0开始
 * @argument {Function} mapCreateColumn 辅助创建列的函数
 * @argument {Function} mapCreateData 辅助创建行数据的函数
 * @returns {Object} 虚拟表格所需要的数据
 */
export function mapCreateMergeHeaderTable (options) {
  return createMapTable(true, true, false, options)
}

/**
 * 
 * @param {Object} options 用户配置
 * @argument {Array} data 数据源,默认为[]
 * @argument {String} field 递归的key,默认为children
 * @argument {Number} startCol 初始从哪里开始进行合并，默认从0开始
 * @argument {Function} mapCreateColumn 辅助创建列的函数
 * @argument {Function} mapCreateData 辅助创建行数据的函数
 * @returns {Object} 虚拟表格所需要的数据
 */
export function mapCreateMergeMainTable (options) {
  return createMapTable(true, false, false, options)
}

/**
 * 
 * @param {Object} options 用户配置
 * @argument {Object} data 数据源,包含rowList,columnList,默认为{rowList:[],columnList:[]}    
 * @argument {Number} startCol 初始从哪里开始进行合并，默认从0开始
 * @argument {Function} mapCreateColumn 辅助创建列的函数
 * @argument {Function} mapCreateData 辅助创建行数据的函数
 * @argument {String} field 递归的key,默认为children
 * @returns {Object} 虚拟表格所需要的数据
 */
export function mapCreateTable (options) {
  return createMapTable(false, false, false, options)
}

/**
 * 
 * @param {Object} options 用户配置
 * @argument {Object} data 数据源,包含rowList,columnList,默认为{rowList:[],columnList:[]}    
 * @argument {Number} startCol 初始从哪里开始进行合并，默认从0开始
 * @argument {Function} mapCreateColumn 辅助创建列的函数
 * @argument {Function} mapCreateData 辅助创建行数据的函数
 * @argument {String} field 递归的key,默认为children
 * @returns {Object} 虚拟表格所需要的数据
 */
export function mapCreateCombinTable (options) {
  return createMapTable(false, false, true, options)
}