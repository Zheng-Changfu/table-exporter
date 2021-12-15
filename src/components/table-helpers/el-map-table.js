import {
  mapCreateMergeHeaderTable,
  // mapCreateMergeMainTable,
  mapCreateTable
} from '../table-helpers/helpers'
import { STableExporter } from '../excel-download'
import { createArray, isFunction, isObject, hasOwnProperty } from "../excel-download/util"
import { defaultColumnStyle, defaultThRowStyle } from '../excel-download/excel-style'


export class ElMapExportTable {
  constructor(configData = {}, options = {}) {
    this.tables = []
    this.progress = options.progress
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
            ...this.setRowStyle(rest.setRowStyle, { data, columnIndex, rowIndex }, true),
            ...this.setCellStyle(rest.setCellStyle, { data, columnIndex, rowIndex })
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
      dataMergeRange = [],
      childrenKey = 'children',
      ...rest
    } = config
    dataMergeRange = isObject(dataMergeRange) ? [dataMergeRange] : dataMergeRange
    let result = null
    if (dataMergeRange.length > 0) {
      // 组合
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
              ...this.setRowStyle(rest.setRowStyle, { row, columnIndex, rowIndex }, false),
              ...this.setCellStyle(rest.setCellStyle, { row, columnIndex, rowIndex })
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
  setRowStyle (userSetRowStyle, { data, columnIndex, rowIndex }, isHeaderRow = false) {
    let style = isHeaderRow ? defaultThRowStyle : {}
    if (isFunction(userSetRowStyle)) {
      const userStyle = userSetRowStyle({ data, columnIndex, rowIndex })
      if (isObject(userStyle)) {
        style = userStyle
      }
    }
    return style
  }

  // 设置单元格样式
  setCellStyle (userSetCellStyle, { data, columnIndex, rowIndex }) {
    let result = {
      style: {}
    }
    if (isFunction(userSetCellStyle)) {
      const userStyle = userSetCellStyle({ data, columnIndex, rowIndex })
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
// fn({
//   // 指定所有的列,如果是需要合并,请用树形结构来描述
//   // dataIndex: 这一列对应的数据源字段
//   columns: [
//     { title: '日期', dataIndex: 'date' },
//     {
//       title: '配送信息', children: [
//         { title: '姓名', dataIndex: 'name' },
//         {
//           title: '地址', children: [
//             { title: '省份', dataIndex: 'province' },
//             { title: '市区', dataIndex: 'city' },
//             { title: '地址', dataIndex: 'address' },
//             { title: '邮编', dataIndex: 'zip' }
//           ]
//         }
//       ]
//     }
//   ],
//   data: [
//     {
//       date: "2016-05-03",
//       name: "王小虎",
//       province: "上海",
//       city: "普陀区",
//       address: "上海市普陀区金沙江路 1518 弄",
//       zip: 200333,
//     },
//     {
//       date: "2016-05-02",
//       name: "王小虎",
//       province: "上海",
//       city: "普陀区",
//       address: "上海市普陀区金沙江路 1518 弄",
//       zip: 200333,
//     },
//     {
//       date: "2016-05-04",
//       name: "王小虎",
//       province: "上海",
//       city: "普陀区",
//       address: "上海市普陀区金沙江路 1518 弄",
//       zip: 200333,
//     },
//     {
//       date: "2016-05-01",
//       name: "王小虎",
//       province: "上海",
//       city: "普陀区",
//       address: "上海市普陀区金沙江路 1518 弄",
//       zip: 200333,
//     },
//     {
//       date: "2016-05-08",
//       name: "王小虎",
//       province: "上海",
//       city: "普陀区",
//       address: "上海市普陀区金沙江路 1518 弄",
//       zip: 200333,
//     },
//     {
//       date: "2016-05-06",
//       name: "王小虎",
//       province: "上海",
//       city: "普陀区",
//       address: "上海市普陀区金沙江路 1518 弄",
//       zip: 200333,
//     },
//     {
//       date: "2016-05-07",
//       name: "王小虎",
//       province: "上海",
//       city: "普陀区",
//       address: "上海市普陀区金沙江路 1518 弄",
//       zip: 200333,
//     },
//   ],
//   // 如果表体区域也要进行合并,请指定需要合并的范围索引,索引从0开始
//   dataMergeRange: {
//     start: 0, end: 4,
//   },
//   setColumnStyle ({ columnLen }) {

//   },
//   setRowStyle () {

//   },
//   setCellStyle () {

//   },
//   setSheetStyle () {

//   },
//   setInsertData () {

//   },
//   columnKey: 'title', // 用列中的哪个字段来进行渲染excel文本
//   childrenKey: 'children',// 如果有嵌套列配置，请指定 子配置字段名
//   sheetName: '123', // 当前sheet名字
// })

// 导出多个sheet
// 每一个对象遵循上面配置即可
// const exportInstance = fn([{}, {}, {}])
// exportInstance.download('12213123')
