// 虚拟表格导出excel
import ExcelJS from 'exceljs'
import fileSaver from 'file-saver';
import { getImageSuffix, isArray, isObject, isFunction, noop, warn, isEmptyObj } from './util'
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
    this.preTotalOffset = 0 // 记录上次的偏移量
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

  // 开始导出
  async export () {
    this.setProgress(11)
    const workSheets = this.workSheets
    const tables = this.options.tables
    await this.handleSheet(tables, workSheets)
    this.setProgress(70)
  }

  async handleSheet (tables, workSheets) {
    const tableLen = tables.length
    for (let i = 0; i < tableLen; i++) {
      const worksheet = workSheets[i]
      const table = tables[i]
      const sheetIndex = i
      this.totalOffset = 1 // 表格从0开始,excel从1开始
      await this.handleCells(worksheet, table)
      this.handleCursomSheet(worksheet, table, sheetIndex)
    }
  }

  // 自定义处理sheet
  handleCursomSheet (worksheet, table, sheetIndex) {
    const sheetCallback = table.sheetCallback
    if (isFunction(sheetCallback)) {
      sheetCallback({ worksheet, sheetIndex })
    }
  }

  async handleCells (worksheet, table) {
    const {
      headerData,
      mainData,
      footerData,
      insertHeaderData,
    } = table
    // 计算插入到头部的数据
    await this.calculateInsertHeaderCells(worksheet, insertHeaderData)
    // 计算excel头部数据
    await this.calculateHeaderCells(worksheet, headerData)
    // 计算excel身体数据
    await this.calculateMainCells(worksheet, mainData)
    // 计算excel尾巴数据
    await this.calculateFooterCells(worksheet, footerData)
  }

  formatData (data, type) {
    if (!isObject(data) || isEmptyObj(data)) return false
    const {
      cells = [],
      columnStyle = [],
      rowStyle = [],
      rowLength = 0
    } = data
    if (rowLength === 0) {
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
  async calculateInsertHeaderCells (worksheet, data) {
    const type = 'insert-header'
    const info = this.formatData(data, type)
    if (!info) return
    await this.dispatch(worksheet, info)
    this.preTotalOffset += data.rowLength
  }

  // 计算excel头部数据
  async calculateHeaderCells (worksheet, data) {
    const type = 'header'
    const info = this.formatData(data, type)
    if (!info) return
    await this.dispatch(worksheet, info)
    this.preTotalOffset += data.rowLength
  }

  // 计算excel身体数据
  async calculateMainCells (worksheet, data) {
    const type = 'main'
    const info = this.formatData(data, type)
    if (!info) return
    await this.dispatch(worksheet, info)
    this.preTotalOffset += data.rowLength
  }

  // 计算excel尾巴数据
  async calculateFooterCells (worksheet, data) {
    const type = 'footer'
    const info = this.formatData(data, type)
    if (!info) return
    await this.dispatch(worksheet, info)
    this.preTotalOffset += data.rowLength
  }

  // 派发信息，处理excel样式文字字体冻结...信息
  async dispatch (worksheet, info) {
    const { cells, rowStyle, columnStyle, offset, type } = info
    const columnStyleLen = columnStyle.length
    const rowStyleLen = rowStyle.length
    const len = cells.length
    const preOffset = this.preTotalOffset

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

    for (let i = 0; i < len; i++) {
      const cell = cells[i]
      const isNeedMerge = cell.isNeedMerge
      const isImage = cell.isImage
      const cellId = this.getCellId(cell, offset)
      this.handleValue(worksheet, cellId, cell)
      this.handleStyle(worksheet, cellId, cell, type)
      if (isImage) {
        await this.handleImage(worksheet, cell, preOffset)
      }
      if (isNeedMerge) {
        this.handleMergeCells(worksheet, cell, offset)
      }
    }
  }

  // 处理excel文字及单元格格式
  handleValue (worksheet, cellId, cell) {
    if (cell.isImage) return
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

  // 处理图片
  handleImage (worksheet, cell, rowOffset) {
    return new Promise((resolve) => {
      const workbook = this.workbook
      const images = cell.text
      const promiseImages = images.reduce((p, url) => {
        const promiseImage = this.requestImage(url)
        p.push(promiseImage)
        return p
      }, [])
      Promise
        .all(promiseImages)
        .then((base64Array) => {
          this.addImage(workbook, worksheet, cell, base64Array, rowOffset)
          resolve()
        })
        .catch(error => {
          console.log(`图片获取失败:${JSON.stringify(error)}`)
        })
    })
  }

  // 请求图片
  requestImage (url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onerror = reject
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status <= 299) {
          // https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader
          const blob = xhr.response
          const fileReader = new FileReader()
          fileReader.readAsDataURL(blob)
          fileReader.onloadend = function (event) {
            const base64 = event.target.result
            resolve(base64)
          }
          fileReader.onerror = reject
        }
      }
      // https://github.com/exceljs/exceljs/issues/1244
      xhr.responseType = 'blob' // arraybuffer | blob
      xhr.open('get', url)
      xhr.send()
    })
  }

  // 将图片添加到Excel中
  addImage (workbook, worksheet, cell, base64Array, rowOffset) {
    const len = base64Array.length
    const { row, col, image: { width = 100, height = 100 } = {} } = cell
    for (let i = 0; i < len; i++) {
      const base64 = base64Array[i]
      const extension = (getImageSuffix(base64) || '').replace(/jpg/, 'jpeg')
      const nativeCol = col
      const nativeRow = row + rowOffset
      const imageId = workbook.addImage({
        base64,
        extension
      })
      worksheet.addImage(imageId, {
        tl: {
          nativeRow,
          nativeCol,
          nativeRowOff: ~~(i / 2) * height * 10000,
          nativeColOff: ((i & 1) ? width : 0) * 10000,
        },
        ext: { width, height },
        editAs: 'oneCell'
      })
    }
  }

  copyStyle (style) {
    return this.keepAlive ? JSON.parse(JSON.stringify(style)) : style
  }

  setProgress (endProgress) {
    const progressFn = this.processCallback
    let percentage = this.percentage
    let end = endProgress
    for (let i = percentage; i <= end; i++) {
      progressFn(i)
    }
    this.percentage = percentage
  }

  // 下载excel
  async download (fileName) {
    this.setProgress(71)
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