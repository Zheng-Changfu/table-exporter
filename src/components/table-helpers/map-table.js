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
        field
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
      reverse: false, // 是否反转合并
      combin: false // 不需要组合
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
        // 等待处理
        cell.text = moment(text).format(excel.format.toUpperCase())
      }
    }
  }

  // 处理excel列
  handleExcelColumn (columns) {
    const firstColumn = columns[0]
    if (isObject(firstColumn) && firstColumn.excel && isObject(firstColumn.excel)) {
      this.excel.columnStyle = columns.map(item => item.excel)
    }
  }

  // 处理excel行
  handleExcelRow (excel) {
    if (isObject(excel)) {
      const copyStyle = { ...excel }
      // text和format单独被handleExcelText处理
      // 单元格样式单独被handleExcelCellStyle处理
      const dirtyFields = ['text', 'style', 'format']
      const dirtyFieldsLen = dirtyFields.length
      for (let i = 0; i < dirtyFieldsLen; i++) {
        const field = dirtyFields[i]
        if (hasOwnProperty(copyStyle, field)) {
          delete copyStyle[field]
        }
      }
      this.excel.rowStyle.push(copyStyle)
    }
  }

  // 处理excel单元格
  handleExcelCell (cell, excel = {}) {
    let style = {}
    const userStyle = excel.style
    if (isObject(userStyle)) {
      style = userStyle
    }
    cell.style = style
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
      this.handleExcelCell(cell, excel)
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
      reverse: false, // 不需要反转
      combin: false // 不需要组合
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
          columnIndex: columnIndex + startCol,
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
        // 等待处理
        cell.text = moment(text).format(excel.format.toUpperCase())
      }
    }
  }

  // 处理excel列
  handleExcelColumn (columns) {
    const firstColumn = columns[0]
    if (isObject(firstColumn) && firstColumn.excel && isObject(firstColumn.excel)) {
      this.excel.columnStyle = columns.map(item => item.excel)
    }
  }

  // 处理excel行
  handleExcelRow (excel) {
    if (isObject(excel)) {
      const copyStyle = { ...excel }
      // text和format单独被handleExcelText处理
      const dirtyFields = ['text', 'style', 'format']
      const dirtyFieldsLen = dirtyFields.length
      for (let i = 0; i < dirtyFieldsLen; i++) {
        const field = dirtyFields[i]
        if (hasOwnProperty(copyStyle, field)) {
          delete copyStyle[field]
        }
      }
      this.excel.rowStyle.push(copyStyle)
    }
  }

  // 处理excel单元格
  handleExcelCell (cell, excel = {}) {
    let style = {}
    const userStyle = excel.style
    if (isObject(userStyle)) {
      style = userStyle
    }
    cell.style = style
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
      this.handleExcelCell(cell, excel)
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

// 辅助创建组合的表格
export class MapCreateCombinMainTable extends MapTable {
  constructor(options) {
    const {
      startCol = 0,
      data = { rowList: [], columnList: [] },
      field = 'children',
      mapCreateColumn,
      mapCreateData,
      spanMethod,
    } = options
    const tableOptions = {
      startCol,
      data,
      field,
      mapCreateColumn,
      mapCreateData,
      spanMethod,
      merge: false, // 不需要合并
      reverse: false, // 不需要反转
      combin: true // 不需要组合
    }
    super(tableOptions)
    this.calculate()
  }

  calculate () {
    const {
      startCol,
      spanMethod,
      data: {
        rowList,
        columnList
      },
    } = this.options
    const mergeCells = []
    const isCursomMerge = isFunction(spanMethod)
    for (let rowIndex = 0; rowIndex < rowList.length; rowIndex++) {
      const row = rowList[rowIndex]
      for (let columnIndex = 0; columnIndex < columnList.length; columnIndex++) {
        // 跳过已经被合并的单元格
        const dirtyKey = `_dirty${rowIndex}${columnIndex}`
        const dirty = row[dirtyKey]
        if (dirty) {
          delete row[dirtyKey]
          continue
        }
        const column = columnList[columnIndex]
        const cell = isCursomMerge
          ? spanMethod({
            row,
            column,
            rowIndex,
            columnIndex: startCol + columnIndex
          })
          : {
            rowspan: 1,
            colspan: 1
          }
        cell.row = rowIndex
        cell.col = startCol + columnIndex
        const dirtyRowNumber = cell.rowspan - 1
        const dirtyColNumber = cell.colspan - 1

        if (dirtyRowNumber > 0 && dirtyColNumber > 0) {
          // 多行多列合并
          const { rowspan, colspan } = cell
          for (let i = 1; i <= rowspan; i++) {
            const currentRowIndex = rowIndex + i - 1
            const currentRow = rowList[currentRowIndex]
            if (isObject(currentRow)) {
              currentRow[`_dirty${currentRowIndex}${columnIndex}`] = true
              for (let j = 1; j <= colspan; j++) {
                const currentColumnIndex = columnIndex + j - 1
                const dirty = currentRow[`_dirty${currentRowIndex}${currentColumnIndex}`]
                if (!dirty) {
                  currentRow[`_dirty${currentRowIndex}${currentColumnIndex}`] = true
                }
              }
            }
          }
          // 当前行当前列不是脏数据,不能跳过
          delete row[`_dirty${rowIndex}${columnIndex}`]
        } else {
          // 行合并或者列合并
          for (let i = 1; i <= dirtyColNumber; i++) {
            row[`_dirty${rowIndex}${columnIndex + i}`] = true
          }
          for (let i = 1; i <= dirtyRowNumber; i++) {
            const nextRow = rowList[rowIndex + i]
            if (isObject(nextRow)) {
              nextRow[`_dirty${rowIndex + i}${columnIndex}`] = true
            }
          }
        }

        this.mapCreateData({
          row,
          rowIndex,
          column,
          columnIndex: startCol + columnIndex,
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
        // 等待处理
        cell.text = moment(text).format(excel.format.toUpperCase())
      }
    }
  }

  // 处理excel列
  handleExcelColumn (columns) {
    const firstColumn = columns[0]
    if (isObject(firstColumn) && firstColumn.excel && isObject(firstColumn.excel)) {
      this.excel.columnStyle = columns.map(item => item.excel)
    }
  }

  // 处理excel行
  handleExcelRow (excel) {
    if (isObject(excel)) {
      const copyStyle = { ...excel }
      // text和format单独被handleExcelText处理
      const dirtyFields = ['text', 'style', 'format']
      const dirtyFieldsLen = dirtyFields.length
      for (let i = 0; i < dirtyFieldsLen; i++) {
        const field = dirtyFields[i]
        if (hasOwnProperty(copyStyle, field)) {
          delete copyStyle[field]
        }
      }
      this.excel.rowStyle.push(copyStyle)
    }
  }

  // 处理excel单元格
  handleExcelCell (cell, excel = {}) {
    let style = {}
    const userStyle = excel.style
    if (isObject(userStyle)) {
      style = userStyle
    }
    cell.style = style
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
      this.handleExcelCell(cell, excel)
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
