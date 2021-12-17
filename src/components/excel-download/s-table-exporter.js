// 虚拟表格导出excel
import ExcelJS from 'exceljs'
import { getImageSuffix, isArray, isObject, noop, warn, isEmptyObj } from './util'
import { STYLEMAP, TYPE2DATANAMEMAP } from './enum'
/**
 * 时间复杂度:O(N) * O(log26^N)
 * log26^N主要是因为里面做了一层 10进制 => 26进制的转换
 */

export class STableExporter {
  constructor(options) {
    this.options = options
  }

  validate (options) {
    return new Promise((resolve, reject) => {
      if (!isObject(options)) {
        return reject('格式错误')
      }
      if (!isArray(options.tables) || options.tables.length <= 0) {
        return reject('格式错误')
      }
      resolve(options)
    })
  }

  init () {
    const options = this.options
    this.validate(options)
      .then(this.initExcel.bind(this))
      .catch((error) => {
        return warn(error)
      })
  }

  initExcel (options) {
    this.workbook = new ExcelJS.Workbook
    this.workSheets = []
    this.processCallback = options.progress || noop
    this.percentage = 0
    this.keepAlive = options.keepAlive || true // 多个sheet共享一份配置，如果要单独配置每个sheet,请设置为false
    this.totalOffset = 1 // 表格从0开始,excel从1开始
    this.generateSheets(options)
    this.setProgress(10)
  }

  generateSheets (options) {
    const tables = options.tables
    const workbook = this.workbook
    const sheetLen = tables.length
    for (let i = 0; i < sheetLen; i++) {
      const table = tables[i]
      const tableConfig = table.options || {}
      const sheetName = table.sheetName || `sheet${i + 1}`
      const workSheet = workbook.addWorksheet(sheetName, tableConfig)
      this.workSheets.push(workSheet)
    }
  }

  // 根据(row/col/rowspan/colspan)获取excel对应的列名
  getCellId (cell, rowOffset) {
    /**
     * 10进制转26进制的算法
     * 考虑特殊情况:excel是从1开始，并且有Z
     */
    const { row, col } = cell
    const colOffset = 1 // 表格从0开始，excel从1开始 
    const realRow = row + rowOffset
    const realCol = col + colOffset
    const stack = []
    let excelNumber = realCol
    while (excelNumber > 0) {
      stack.push(String.fromCharCode((excelNumber - 1) % 26 + 'A'.charCodeAt()))
      excelNumber = ~~((excelNumber - 1) / 26)
    }
    const cellId = stack.reverse().join('') + realRow
    return cellId
  }

  // 开始导出(不会下载，会处理成excel需要的数据)
  export () {
    this.setProgress(11)
    const workSheets = this.workSheets
    const tables = this.options.tables
    const tableLen = tables.length
    for (let i = 0; i < tableLen; i++) {
      const worksheet = workSheets[i]
      const table = tables[i]
      this.totalOffset = 1 // 表格从0开始,excel从1开始
      this.handleCells(worksheet, table)
    }
    this.setProgress(70)
  }

  handleCells (worksheet, table) {
    const {
      headerData,
      mainData,
      footerData,
      insertHeaderData,
    } = table

    // 计算插入到头部的数据
    this.calculateInsertHeaderCells(worksheet, insertHeaderData)
    // 计算excel头部数据
    this.calculateHeaderCells(worksheet, headerData)
    // 计算excel身体数据
    this.calculateMainCells(worksheet, mainData)
    // 计算excel尾巴数据
    this.calculateFooterCells(worksheet, footerData)
    // 插入背景图
    this.insertBackgroundImage(worksheet)
  }

  formatData (data, type) {
    if (!isObject(data)) return false
    const {
      cells = [],
      columnStyle = [],
      rowStyle = [],
      rowLength = 0
    } = data
    if (data.rowLength === 0) {
      warn(`原数据${TYPE2DATANAMEMAP[type]}中缺少rowLength字段`)
      return false
    }
    const offset = this.totalOffset
    this.totalOffset += rowLength
    return {
      cells,
      columnStyle,
      rowStyle,
      offset,
      type
    }
  }

  // 计算插入到头部的数据
  calculateInsertHeaderCells (worksheet, data) {
    const type = 'insert-header'
    const info = this.formatData(data, type)
    if (!info) return
    this.dispatch(worksheet, info)
  }

  // 计算excel头部数据
  calculateHeaderCells (worksheet, data) {
    const type = 'header'
    const info = this.formatData(data, type)
    if (!info) return
    this.dispatch(worksheet, info)
  }

  // 计算excel身体数据
  calculateMainCells (worksheet, data) {
    const type = 'main'
    const info = this.formatData(data, type)
    if (!info) return
    this.dispatch(worksheet, info)
  }

  // 计算excel尾巴数据
  calculateFooterCells (worksheet, data) {
    const type = 'footer'
    const info = this.formatData(data, type)
    if (!info) return
    this.dispatch(worksheet, info)
  }

  // 派发信息，处理excel样式文字字体冻结...信息
  dispatch (worksheet, info) {
    const { cells, rowStyle, columnStyle, offset, type } = info
    const columnStyleLen = columnStyle.length
    const rowStyleLen = rowStyle.length
    const len = cells.length

    for (let i = 0; i < len; i++) {
      const cell = cells[i]
      const cellId = this.getCellId(cell, offset)
      this.handleValue(worksheet, cellId, cell)
      this.handleStyle(worksheet, cellId, cell, type)
      this.handleMergeCells(worksheet, cell, offset)
    }

    for (let i = 0; i < columnStyleLen; i++) {
      const colStyle = columnStyle[i]
      const columnId = i + offset
      this.handleColumnStyle(worksheet, columnId, colStyle)
    }

    for (let i = 0; i < rowStyleLen; i++) {
      const rStyle = rowStyle[i]
      const rowId = i + offset
      this.handleRowStyle(worksheet, rowId, rStyle)
    }
  }

  // 处理excel文字及单元格格式
  handleValue (worksheet, cellId, cell) {
    const {
      text,
      format = {},
    } = cell
    const numFmt = format.numFmt
    const excelCell = worksheet.getCell(cellId)
    if (numFmt !== undefined) {
      excelCell.numFmt = numFmt
      delete format.numFmt
    }
    excelCell.value = !isEmptyObj(format)
      ? format
      : text
  }

  // 处理excel单元格样式
  handleStyle (worksheet, cellId, cell, type) {
    const { style = {} } = cell
    const excelCell = worksheet.getCell(cellId)
    const defaultStyle = STYLEMAP[type]
    const excelStyle = {
      ...defaultStyle,
      ...style,
    }
    for (let key in excelStyle) {
      excelCell[key] = excelStyle[key]
    }
  }

  // 处理excel合并
  handleMergeCells (worksheet, cell, rowOffset) {
    const { row, col, rowspan, colspan } = cell
    const colOffset = 1
    const startRow = row + rowOffset
    const startCol = col + colOffset
    const endRow = startRow + rowspan - 1
    const endCol = col + colspan
    worksheet.mergeCells(
      startRow, startCol,
      endRow, endCol
    )
  }

  // 处理excel列样式
  handleColumnStyle (worksheet, columnId, colStyle) {
    const excelColumn = worksheet.getColumn(columnId)
    const copyStyle = this.copyStyle(colStyle)
    for (let key in copyStyle) {
      excelColumn[key] = copyStyle[key]
    }
  }

  // 处理excel行样式
  handleRowStyle (worksheet, rowId, rStyle) {
    const excelRow = worksheet.getRow(rowId)
    const copyStyle = this.copyStyle(rStyle)
    for (let key in copyStyle) {
      excelRow[key] = copyStyle[key]
    }
  }

  async insertBackgroundImage (worksheet) {
    try {
      const workbook = this.workbook
      const u = '/src/assets/导出混合表格到Excel.png'
      const buffer = await this.requestImage(u)
      const imageId = workbook.addImage({
        buffer,
        extension: getImageSuffix(u)
      })
      console.log(getImageSuffix(u), imageId)
      worksheet.addBackgroundImage(imageId)
    } catch (error) {
      console.log(`图片请求失败:${JSON.stringify(error)}`)
    }
  }

  requestImage (url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onerror = reject
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status <= 299) {
          resolve(xhr.response)
        }
      }
      // https://github.com/exceljs/exceljs/issues/1244
      xhr.responseType = 'arraybuffer'
      xhr.open('get', url)
      xhr.send()
    })
  }

  copyStyle (style) {
    return this.keepAlive ? JSON.parse(JSON.stringify(style)) : style
  }

  setProgress (endProgress) {
    if (this.timer) {
      clearInterval(this.timer)
    }
    const progressFn = this.processCallback
    let percentage = this.percentage
    let end = endProgress
    this.timer = setInterval(() => {
      if (percentage < end) {
        percentage++
        progressFn(percentage)
      } else {
        this.percentage = percentage
        clearInterval(this.timer)
      }
    })
  }

  // 下载excel
  async download (fileName) {
    this.setProgress(71)
    let fileSaver = await import("file-saver");
    const workbook = this.workbook
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    fileSaver.saveAs(blob, fileName);
    this.setProgress(100)
  }
}