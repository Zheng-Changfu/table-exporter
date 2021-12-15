
import { STableExporter } from '../../components/excel-download'
import { mapCreateTable } from '../../components/table-helpers/helpers'
import { createArray } from '../../components/excel-download/util'
export default class Control {
  constructor(options) {
    this.progress = options.progress
    this.data = options.data
  }
  export () {
    const headerData = this.handleExcelHeader()
    const mainData = this.handleExcelMain()
    const table = {
      headerData,
      mainData,
      // excel表格配置(非必填)
      options: {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] // 冻结第一行
      }
    }
    console.log(table, 'table')
    this.download(table)
  }
  handleExcelHeader () {
    // 可以写死列配置，如果是动态列配置，请用辅助函数
    const cells = [
      { row: 0, col: 0, rowspan: 1, colspan: 1, text: '日期', style: { bold: true } }, // excel单元格样式
      { row: 0, col: 1, rowspan: 1, colspan: 1, text: '姓名', style: { bold: true } },
      { row: 0, col: 2, rowspan: 1, colspan: 1, text: '地址', style: { bold: true } },
    ]
    // excel列样式(非必填))
    const columnStyle = createArray(cells.length, (index) => {
      return index === cells.length - 1 ? { width: 40 } : { width: 20 }
    })
    // excel行样式(非必填)
    const rowStyle = [{ height: 20 }]
    // 总共有多少行(row + rowspan)
    const rowLength = 1
    return {
      cells,
      columnStyle,
      rowStyle,
      rowLength,
    }
  }

  handleExcelMain () {
    const defaultRow = { date: '日期', name: '姓名', address: '地址' };
    const columnList = Object.keys(defaultRow)
    const {
      mergeCells,
      excel: {
        rowStyle
      },
      data
    } = mapCreateTable({
      data: {
        rowList: this.data,
        columnList
      },
      mapCreateColumn: ({ columnLen }) => {
        return createArray(columnLen, index => {
          return {
            field: `${index}-field`,
          }
        })
      },
      mapCreateData: ({ row, column, columnIndex }) => {
        const key = `${columnIndex}-field`
        const value = row[column]
        return {
          key,
          value,
          excel: {
            text: value,
            height: 20
          }
        }
      }
    })

    return {
      cells: mergeCells,
      rowStyle,
      rowLength: data.length
    }
  }

  async download (table) {
    const exportInstance = new STableExporter({
      progress: this.progress,
      tables: [table]
    });
    await exportInstance.init();
    exportInstance.export();
    exportInstance.download('导出正常表格案例');
  }
}
