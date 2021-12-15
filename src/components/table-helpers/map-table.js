import moment from 'moment'
import { eachTree, noop, isFunction, isObject, hasOwnProperty } from '../excel-download/util'
const hooks = [
  'beforeMapCreateColumn', // 创建列之前被调用
  'mapCreateColumned', // 创建列之后被调用
  'beforeMapCreateData', // 创建数据之前被调用
  'mapCreateDataed', // 创建数据之后被调用
  'mounted' // 全部计算完成后，返回数据前被调用
]
class MapTable {
  constructor(options) {
    this.options = options
    this.init()
    this.generateHooks()
    if (options.merge) {
      /**
       * 叶子节点的信息集合，方便外界去操作
       *  对于表头合并来说，叶子节点集合 === 列数据的集合
       *  对于表体合并来说，叶子节点集合 === 行数据的集合
       */
      this.leafNodes = []
      this.calculateMergeCells()
    }
  }

  // 生成hooks
  generateHooks () {
    const stracts = this.initHooks()
    const options = this.options
    const hooks = options.hooks || {}
    Object.keys(stracts).forEach(hookName => {
      const userHook = hooks[hookName]
      const noopHook = stracts[hookName]
      stracts[hookName] = isFunction(userHook) ? userHook : noopHook
    })
    this.hooks = stracts
  }

  // 初始化hooks
  initHooks () {
    const stracts = {}
    for (let i = 0; i < hooks.length; i++) {
      const hookName = hooks[i]
      stracts[hookName] = noop
    }
    return stracts
  }

  // 调用hook
  callhook (instance, hookName) {
    this.hooks[hookName].call(instance)
  }

  // 初始化表格数据
  init () {
    this.columns = []
    this.data = []
    this.mergeCells = []
    this.excel = {
      columnStyle: [],
      rowStyle: []
    }
  }

  // 获取表格数据
  getTableData () {
    return {
      columns: this.columns,
      data: this.data,
      mergeCells: this.mergeCells,
      excel: this.excel
    }
  }

  // 计算合并单元格
  calculateMergeCells () {
    const { data, reverse, field, startCol } = this.options
    //#region 
    /**
     * 规则:
     *  row: 当前节点的层级 - 1
     * 
     *  col: 是否只是1级
     *       ? 叠加
     *       : 看当前节点在父级中的索引 === 0
     *         ? 父级的col位置
     *         : 取前一个兄弟的col + colspan
     * 
     *  rowspan: 看当前是否为叶子节点
     *           ? 最大深度 - 当前层级 + 1
     *           : 1
     * 
     *  colspan: 当前层级下的叶子节点数量
     */
    //#endregion
    const infos = []
    let prevCol = startCol, maxDepth = 0, totalLen = 0;
    //#region 
    eachTree(data,
      item => {
        // 入栈
        const level = item.$level
        const isLeafNode = item.$leafNode
        const row = level - 1
        const cell = !reverse
          ? { row, col: level === 1 ? prevCol : null }
          : { col: row, row: level === 1 ? prevCol : null }

        if (isLeafNode) {
          const key = !reverse ? 'colspan' : 'rowspan'
          cell[key] = 1
          totalLen++
          this.leafNodes.push(item)
        }

        if (level === 1 && isLeafNode) {
          prevCol++
        }

        item._cell = cell
        item._leafNodeNum = 1

        infos.push(item)
        maxDepth = Math.max(maxDepth, level)
      },
      item => {
        // 出栈
        const children = item[field]
        const level = item.$level
        const leafNodeNum = children.reduce((p, child) => p + child._leafNodeNum, 0)

        const cell = !reverse
          ? { colspan: leafNodeNum }
          : { rowspan: leafNodeNum }

        item._leafNodeNum = leafNodeNum
        item._cell = { ...item._cell, ...cell }
        if (level === 1) {
          prevCol += leafNodeNum
        }
      },
      {
        field: 'children'
      }
    );
    //#endregion
    const mergeCells = []
    this.callhook(this, 'beforeMapCreateData')
    for (let i = 0; i < infos.length; i++) {
      const item = infos[i]
      const children = item[field]
      const hasChildren = children && children.length > 0
      const level = item.$level
      const sort = item.$sort
      const parent = item.$parent
      const cell = item._cell
      const rowspan = hasChildren ? 1 : maxDepth - level + 1
      const key = !reverse ? 'rowspan' : 'colspan'
      cell[key] = rowspan

      if (level !== 1) {
        const key = !reverse ? 'col' : 'row'
        let value
        if (!reverse) {
          value = sort === 0
            ? parent._cell.col
            : parent[field][sort - 1]._cell.col + parent[field][sort - 1]._cell.colspan;
        } else {
          value = sort === 0
            ? parent._cell.row
            : parent[field][sort - 1]._cell.row + parent[field][sort - 1]._cell.rowspan;
        }
        cell[key] = value
      }
      this.mapCreateData(item)
      mergeCells.push(cell)
    }
    this.callhook(this, 'mapCreateDataed')
    this.mergeCells = mergeCells
    this.totalLen = totalLen
    this.maxDepth = maxDepth
  }

}

// 辅助创建需要合并的表头
export class MapCreateMergeHeaderTable extends MapTable {
  constructor(options) {
    const {
      data = [],
      hooks = {},
      field = 'children',
      startCol = 0,
      mapCreateColumn,
      mapCreateData,
    } = options
    const tableOptions = {
      data,
      hooks,
      field,
      startCol,
      mapCreateColumn,
      mapCreateData,
      merge: true, // 需要合并
      reverse: false // 是否反转合并
    }

    super(tableOptions)
    this.callhook(this, 'beforeMapCreateColumn')
    this.mapCreateColumn()
    this.callhook(this, 'mapCreateColumned')
  }

  // 辅助创建列数据
  mapCreateColumn () {
    const { totalLen, options } = this
    if (options.mapCreateColumn) {
      const columns = options.mapCreateColumn({ columnLen: totalLen })
      this.handleExcelColumn(columns)
      this.columns = columns
    }
  }

  // 处理excel中的文字内容
  handleExcelText (cell, excel) {
    if (isObject(excel)) {
      /**
       * excel单元格格式根据text格式决定
       * text为字符串:excel单元格格式就是字符串
       * text为数字:excel单元格格式就是数字
       * text为日期:excel单元格格式就是日期
       */
      const text = excel.text
      cell.text = text ? text : ''

      if (hasOwnProperty(excel, 'format')) {
        cell.numFmt = excel.format
        cell.text = moment(text).format(excel.format.toUpperCase())
      }
    }
  }

  // 处理excel列
  handleExcelColumn (columns) {
    if (columns[0].excel && isObject(columns[0].excel)) {
      this.excel.columnStyle = columns.map(item => item.excel)
    }
  }

  // 处理excel行
  handleExcelRow (excel) {
    if (isObject(excel)) {
      const copyStyle = { ...excel }
      // text和format单独被handleExcelText处理
      if (hasOwnProperty(copyStyle, 'text')) {
        delete copyStyle.text
      }
      if (hasOwnProperty(copyStyle, 'format')) {
        delete copyStyle.format
      }
      this.excel.rowStyle.push(copyStyle)
    }
  }

  // 辅助创建行数据
  mapCreateData (item) {
    const { options } = this
    if (options.mapCreateData) {
      const cell = item._cell
      const rowIndex = cell.row
      const columnIndex = cell.col
      const { key, value, excel } = options.mapCreateData({
        data: item,
        rowIndex,
        columnIndex
      }) || { key: '', value: '', excel: {} }
      if (this.data[rowIndex]) {
        this.data[rowIndex] = { ...this.data[rowIndex], [key]: value }
      } else {
        this.data[rowIndex] = { [key]: value }
        this.handleExcelRow(excel)
      }
      this.handleExcelText(cell, excel)
    }
  }
}

// 辅助创建需要合并的表体
export class MapCreateMergeMainTable extends MapTable {
  constructor(options) {
    const {
      data = [],
      hooks = {},
      field = 'children',
      startCol = 0,
      mapCreateColumn,
      mapCreateData
    } = options
    const tableOptions = {
      data,
      hooks,
      field,
      startCol,
      mapCreateColumn,
      mapCreateData,
      merge: true, // 需要合并
      reverse: true // 需要反转
    }
    super(tableOptions)
    this.callhook(this, 'beforeMapCreateColumn')
    this.mapCreateColumn()
    this.callhook(this, 'mapCreateColumned')
  }

  // 处理excel中的文字内容
  handleExcelText (cell, excel) {
    if (isObject(excel)) {
      /**
       * excel单元格格式根据text格式决定
       * text为字符串:excel单元格格式就是字符串
       * text为数字:excel单元格格式就是数字
       * text为日期:excel单元格格式就是日期
       */
      const text = excel.text
      cell.text = text ? text : ''

      if (hasOwnProperty(excel, 'format')) {
        cell.numFmt = excel.format
        // 设置日期格式,可以自行处理日期格式,不必使用moment
        cell.text = moment(text).format(excel.format.toUpperCase())
      }
    }
  }

  // 处理excel列
  handleExcelColumn (columns) {
    if (columns[0].excel && isObject(columns[0].excel)) {
      this.excel.columnStyle = columns.map(item => item.excel)
    }
  }

  // 处理excel行
  handleExcelRow (excel) {
    if (isObject(excel)) {
      const copyStyle = { ...excel }
      // text和format单独被handleExcelText处理
      if (hasOwnProperty(copyStyle, 'text')) {
        delete copyStyle.text
      }
      if (hasOwnProperty(copyStyle, 'format')) {
        delete copyStyle.format
      }
      this.excel.rowStyle.push(copyStyle)
    }
  }

  mapCreateColumn () {
    const { maxDepth, options } = this
    if (options.mapCreateData) {
      const columns = options.mapCreateColumn({ columnLen: maxDepth })
      this.handleExcelColumn(columns)
      this.columns = columns
    }
  }

  // 辅助创建行数据
  mapCreateData (item) {
    const { options } = this
    if (options.mapCreateData) {
      const cell = item._cell
      const rowIndex = cell.row
      const columnIndex = cell.col
      const { key, value, excel } = options.mapCreateData({
        data: item,
        rowIndex,
        columnIndex
      }) || { key: '', value: '', excel: {} }
      if (this.data[rowIndex]) {
        this.data[rowIndex] = { ...this.data[rowIndex], [key]: value }
      } else {
        this.data[rowIndex] = { [key]: value }
        this.handleExcelRow(excel)
      }
      this.handleExcelText(cell, excel)
    }
  }
}

// 辅助创建不需要合并的表格
export class MapCreateNoMergeTable extends MapTable {
  constructor(options) {
    const {
      startCol = 0,
      data = { rowList: [], columnList: [] },
      field = 'children',
      mapCreateColumn,
      mapCreateData
    } = options
    const tableOptions = {
      startCol,
      data,
      field,
      mapCreateColumn,
      mapCreateData,
      merge: false, // 不需要合并
      reverse: false // 不需要反转
    }
    super(tableOptions)
    this.calculate()
  }

  calculate () {
    const {
      startCol,
      data: {
        rowList,
        columnList
      }
    } = this.options
    const mergeCells = []
    for (let rowIndex = 0; rowIndex < rowList.length; rowIndex++) {
      const row = rowList[rowIndex]
      for (let columnIndex = 0; columnIndex < columnList.length; columnIndex++) {
        const column = columnList[columnIndex]
        const cell = {
          row: rowIndex,
          col: columnIndex + startCol,
          rowspan: 1,
          colspan: 1
        }
        this.mapCreateData({
          row,
          rowIndex,
          column,
          columnIndex,
          cell
        })

        mergeCells.push(cell)
      }
    }
    this.mergeCells = mergeCells
    this.mapCreateColumn()
  }

  // 处理excel中的文字内容
  handleExcelText (cell, excel) {
    if (isObject(excel)) {
      /**
       * excel单元格格式根据text格式决定
       * text为字符串:excel单元格格式就是字符串
       * text为数字:excel单元格格式就是数字
       * text为日期:excel单元格格式就是日期
       */
      const text = excel.text
      cell.text = text ? text : ''

      if (hasOwnProperty(excel, 'format')) {
        cell.numFmt = excel.format
        cell.text = moment(text).format(excel.format.toUpperCase())
      }
    }
  }

  // 处理excel列
  handleExcelColumn (columns) {
    if (columns[0].excel && isObject(columns[0].excel)) {
      this.excel.columnStyle = columns.map(item => item.excel)
    }
  }

  // 处理excel行
  handleExcelRow (excel) {
    if (isObject(excel)) {
      const copyStyle = { ...excel }
      // text和format单独被handleExcelText处理
      if (hasOwnProperty(copyStyle, 'text')) {
        delete copyStyle.text
      }
      if (hasOwnProperty(copyStyle, 'format')) {
        delete copyStyle.format
      }
      this.excel.rowStyle.push(copyStyle)
    }
  }

  mapCreateData ({ row, rowIndex, column, columnIndex, cell }) {
    const { options } = this
    if (options.mapCreateData) {
      const { key, value, excel } = options.mapCreateData({ row, rowIndex, column, columnIndex }) || { key: '', value: '', excel: {} }
      if (this.data[rowIndex]) {
        this.data[rowIndex] = { ...this.data[rowIndex], [key]: value }
      } else {
        this.data[rowIndex] = { [key]: value }
        this.handleExcelRow(excel)
      }
      this.handleExcelText(cell, excel)
    }
  }

  mapCreateColumn () {
    const {
      options: {
        data: {
          columnList
        }
      }, options } = this
    if (options.mapCreateColumn) {
      const columns = options.mapCreateColumn({ columnLen: columnList.length })
      this.handleExcelColumn(columns)
      this.columns = columns
    }
  }
}