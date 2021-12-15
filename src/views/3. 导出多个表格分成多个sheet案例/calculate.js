
import { STableExporter } from '../../components/excel-download'
import { mapCreateTable, mapCreateMergeHeaderTable } from '../../components/table-helpers/helpers'
import { createArray } from '../../components/excel-download/util'
export default class Control {
  constructor(options) {
    this.progress = options.progress
    this.data = options.data
  }
  export () {
    this.handleExcelHeader()
    this.handleExcelMain()

  }
  handleExcelHeader () {
    // 如果想导出复杂表格,将数据整理成树形结构，交给辅助函数即可

    const data1 = [
      { name: 'ID' },
      { name: '姓名' },
      { name: '数值1（元）' },
      { name: '数值2（元）' },
      { name: '数值3（元）' },
    ]
    // b ==> a ==> b a
    const result1 = mapCreateMergeHeaderTable({
      data: data1,
      mapCreateColumn: ({ columnLen }) => {
        return createArray(columnLen, index => {
          return {
            field: `${index}-field`,
            excel: {
              width: 20
            }
          }
        })
      },
      mapCreateData: ({ data, columnIndex }) => {
        const key = `${columnIndex}-field`
        const value = data.name
        return {
          key,
          value,
          excel: {
            text: value,
            font: {
              bold: true // 字体加粗
            },
            height: 20
          }
        }
      }
    })
    const { mergeCells, data, excel: { rowStyle, columnStyle } } = result1
    return {
      cells: mergeCells,
      rowLength: data.length,
      rowStyle,
      columnStyle
    }
  }

  handleExcelMain () {
    const columnList = ['date', 'name', 'province', 'city', 'address', 'zip']
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
    exportInstance.download('导出合并单元格的表格案例');
  }
}
