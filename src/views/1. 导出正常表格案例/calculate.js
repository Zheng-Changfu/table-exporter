
import { ElMapExportTable } from '../../components/table-helpers/el-map-table'
export default class Control {
  constructor(options) {
    this.progress = options.progress
    this.data = options.data
    this.column = options.column
  }
  export () {
    const instance = new ElMapExportTable({
      column: this.column,
      data: this.data,
      setColumnStyle: ({ columnIndex }) => {
        return columnIndex !== this.column.length - 1
          ? { width: 20 }
          : { width: 40 }
      },
      setSheetStyle: () => {
        return {
          views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] // 冻结第一行
        }
      }
    }, {
      progress: this.progress
    })
    instance.download('导出正常表格案例')
  }
}
