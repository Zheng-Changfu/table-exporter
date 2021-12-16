import {
  mapCreateMergeHeaderTable,
  mapCreateCombinTable,
  mapCreateTable,
} from '../table-helpers/helpers'
import { STableExporter } from '../excel-download'
import { createArray, isFunction, isObject, isNumber, hasOwnProperty } from "../excel-download/util"
import { defaultColumnStyle, defaultThRowStyle } from '../excel-download/excel-style'


export class ElMapExportTable {
  constructor(configData = {}, options = {}) {
    this.tables = []
    this.progress = options.progress
    this.spanMethod = options.spanMethod || undefined
    this.calculate(configData)
  }

  calculate (configData) {
    configData = isObject(configData) ? [configData] : configData
    const configLen = configData.length
    // 循环的是多个sheet,常数级 
    for (let i = 0; i < configLen; i++) {
      const config = configData[i]
      const sheetName = config.sheetName
      const insertData = this.handleInsertExcelHeader(config)
      const headerData = this.handleExcelHeader(config)
      const mainData = this.handleExcelMain(config, headerData.columnKeys)
      const options = this.handleExcelSheet(config, insertData, headerData, mainData)
      const table = {
        insertData,
        headerData,
        mainData,
        sheetName,
        options,
      }
      console.log(table, 'table')
      this.tables.push(table)
    }
  }

  handleInsertExcelHeader (config) {
    return this.setInsertHeader(config.setInsertData)
  }

  handleExcelHeader (config) {
    const {
      column = [],
      columnKey: field = 'title',
      childrenKey = 'children',
      ...rest
    } = config
    const columnKeys = []
    const result = mapCreateMergeHeaderTable({
      data: column,
      mapCreateColumn: ({ columnLen }) => {
        return createArray(columnLen, index => {
          return {
            field: `${index}-field`,
            excel: this.setColumnStyle(rest.setColumnStyle, index)
          }
        })
      },
      mapCreateData: ({ data, columnIndex, rowIndex }) => {
        const key = `${columnIndex}-field`
        const value = data[field]
        if (hasOwnProperty(data, 'dataIndex')) {
          const columnKey = data.dataIndex
          columnKeys.push(columnKey)
        }
        return {
          key,
          value,
          excel: {
            text: value, // 预留覆盖文本
            ...this.setRowStyle(rest.setRowStyle, { data, columnIndex, rowIndex, type: 'header' }, true),
            ...this.setCellStyle(rest.setCellStyle, { data, columnIndex, rowIndex, type: 'header' })
          }
        }
      },
      field: childrenKey
    })
    const {
      mergeCells,
      data: tableData,
      excel: {
        rowStyle,
        columnStyle
      }
    } = result
    return {
      cells: mergeCells,
      rowLength: tableData.length,
      rowStyle,
      columnStyle,
      columnKeys
    }
  }

  handleExcelMain (config, columnKeys) {
    let {
      data: userData = [],
      childrenKey = 'children',
      ...rest
    } = config
    let result = null
    const spanMethod = this.spanMethod
    const isCombin = spanMethod && isFunction(spanMethod)
    if (isCombin) {
      // 组合
      const {
        mergeCells,
        data,
        excel: {
          rowStyle
        }
      } = mapCreateCombinTable({
        data: {
          rowList: userData,
          columnList: columnKeys
        },
        mapCreateColumn: ({ columnLen }) => {
          return createArray(columnLen, index => {
            return {
              field: `${index}-field`,
            }
          })
        },
        mapCreateData: ({ row, column, rowIndex, columnIndex }) => {
          const key = `${columnIndex}-field`
          const value = row[column]
          return {
            key,
            value,
            excel: {
              text: value,
              ...this.setRowStyle(rest.setRowStyle, { data: row, columnIndex, rowIndex, type: 'main' }, false),
              ...this.setCellStyle(rest.setCellStyle, { data: row, columnIndex, rowIndex, type: 'main' })
            }
          }
        },
        spanMethod: ({ row, column, rowIndex, columnIndex }) => {
          let result = { rowspan: 1, colspan: 1 }
          const { rowspan, colspan } = spanMethod({ row, column, rowIndex, columnIndex }) || {}
          if (isNumber(rowspan) && rowspan > 1) {
            // 如果行超出范围就进行修正
            result.rowspan = rowIndex + rowspan - 1 > userData.length - 1
              ? userData.length - rowIndex
              : rowspan
          }
          if (isNumber(colspan) && colspan > 1) {
            // 如果列超出范围就进行修正
            result.colspan = columnIndex + colspan - 1 > columnKeys.length - 1
              ? columnKeys.length - columnIndex
              : colspan
          }
          return result
        },
        field: childrenKey
      })
      result = {
        cells: mergeCells,
        rowStyle,
        rowLength: data.length
      }
    } else {
      // 不合并
      const {
        mergeCells,
        data,
        excel: {
          rowStyle
        }
      } = mapCreateTable({
        data: {
          rowList: userData,
          columnList: columnKeys
        },
        mapCreateColumn: ({ columnLen }) => {
          return createArray(columnLen, index => {
            return {
              field: `${index}-field`,
            }
          })
        },
        mapCreateData: ({ row, column, rowIndex, columnIndex }) => {
          const key = `${columnIndex}-field`
          const value = row[column]
          return {
            key,
            value,
            excel: {
              text: value,
              ...this.setRowStyle(rest.setRowStyle, { data: row, columnIndex, rowIndex, type: 'main' }, false),
              ...this.setCellStyle(rest.setCellStyle, { data: row, columnIndex, rowIndex, type: 'main' })
            }
          }
        },
        field: childrenKey
      })
      result = {
        cells: mergeCells,
        rowStyle,
        rowLength: data.length
      }
    }
    return result
  }

  handleExcelSheet (config, insertData, headerData, mainData) {
    return this.setSheetStyle(config.setSheetStyle, insertData, headerData, mainData)
  }

  // 设置列样式
  setColumnStyle (userSetColumnStyleFn, columnIndex) {
    let style = defaultColumnStyle
    if (isFunction(userSetColumnStyleFn)) {
      const userStyle = userSetColumnStyleFn({ columnIndex })
      if (isObject(userStyle)) {
        style = userStyle
      }
    }
    return style
  }

  // 设置行样式
  setRowStyle (userSetRowStyle, { data, columnIndex, rowIndex, type }, isHeaderRow = false) {
    let style = isHeaderRow ? defaultThRowStyle : {}
    if (isFunction(userSetRowStyle)) {
      const userStyle = userSetRowStyle({ data, columnIndex, rowIndex, type })
      if (isObject(userStyle)) {
        style = userStyle
      }
    }
    return style
  }

  // 设置单元格样式
  setCellStyle (userSetCellStyle, { data, columnIndex, rowIndex, type }) {
    let result = {
      style: {}
    }
    if (isFunction(userSetCellStyle)) {
      const userStyle = userSetCellStyle({ data, columnIndex, rowIndex, type })
      if (isObject(userStyle)) {
        result.style = userStyle
      }
    }
    return result
  }

  // 设置sheet相关样式
  setSheetStyle (userSetSheetStyle, ...rest) {
    let style = {}
    if (isFunction(userSetSheetStyle)) {
      const userStyle = userSetSheetStyle({ ...rest })
      if (isObject(userStyle)) {
        style = userStyle
      }
    }
    return style
  }

  // 设置插入到头部的内容
  setInsertHeader (userSetInsertHeader) {
    let result = {}
    if (isFunction(userSetInsertHeader)) {
      const userResult = userSetInsertHeader()
      if (isObject(userResult)) {
        result = userResult
      }
    }
    return result
  }

  async download (fileName) {
    const tables = this.tables
    const progress = this.progress
    const exportInstance = new STableExporter({
      progress,
      tables: tables
    });
    await exportInstance.init();
    exportInstance.export();
    exportInstance.download(fileName);
  }
}

