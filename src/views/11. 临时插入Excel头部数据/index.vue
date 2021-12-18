<template>
  <div>
    <el-button
      type="warning"
      @click="handleExport"
    >导出</el-button>
    <el-progress
      :style="{margin:'10px 0'}"
      :text-inside="true"
      :stroke-width="20"
      :percentage="percentage"
    ></el-progress>
    <el-table
      border
      :data="tableData"
      style="width: 100%"
    >
      <el-table-column
        prop="date"
        label="日期"
        width="180"
      >
      </el-table-column>
      <el-table-column
        prop="name"
        label="姓名"
        width="180"
      >
      </el-table-column>
      <el-table-column
        prop="address"
        label="地址"
      >
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { ElMapExportTable } from "../../components/table-helpers/el-map-table";
export default {
  name: "ExportTable1",
  data() {
    return {
      tableData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄",
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄",
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄",
        },
      ],
      percentage: 0,
    };
  },
  methods: {
    handleExport() {
      const column = [
        { title: "日期", dataIndex: "date" },
        { title: "姓名", dataIndex: "name" },
        { title: "地址", dataIndex: "address" },
      ];
      const data = [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄",
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄",
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄",
        },
      ];
      const instance = new ElMapExportTable(
        {
          column,
          data,
          setInsertHeader: ({ sheetIndex }) => {
            console.log(sheetIndex);
            return {
              cells: [
                {
                  row: 0,
                  col: 0,
                  rowspan: 2, // 占2行
                  colspan: 3, // 占3列
                  text: "我是插入到Excel头部的信息",
                },
                {
                  row: 2,
                  col: 0,
                  rowspan: 3,
                  colspan: 3,
                  text: "我也是插入到Excel头部的信息",
                  style: {
                    font: {
                      size: 16, // 字体大小
                      bold: true, // 字体加粗
                      italic: true, // 字体倾斜
                      color: { argb: "FFFF0000" }, // 字体颜色
                    },
                  },
                },
              ],
            };
          },
        },
        { progress: this.handlePercentage }
      );
      instance.download("临时插入Excel数据");
    },
    handlePercentage(percentage) {
      this.percentage = percentage;
    },
  },
};
</script>

<style>
</style>