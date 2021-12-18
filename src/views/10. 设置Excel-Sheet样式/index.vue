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
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄",
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄",
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
        { title: "ID", dataIndex: "id" },
        { title: "日期", dataIndex: "date" },
        { title: "姓名", dataIndex: "name" },
        { title: "地址", dataIndex: "address" },
      ];
      const instance = new ElMapExportTable(
        {
          column,
          data: this.tableData,
          sheetName: "~~~ 我有名字了 ~~~", // sheet名称
          setSheetStyle: ({ sheetIndex }) => {
            console.log(sheetIndex, "sheetIndex");
            return {
              properties: { tabColor: { argb: "FFC0000" } }, // 创建带有红色标签颜色的工作表
              views: [
                {
                  state: "frozen",
                  xSplit: 1, // 固定1列(同表格固定列)
                  ySplit: 1, // 固定1行(同表格固定行)
                },
              ],
            };
          },
        },
        { progress: this.handlePercentage }
      );
      instance.download("设置Excel-Sheet样式");
    },
    handlePercentage(percentage) {
      this.percentage = percentage;
    },
  },
};
</script>

<style>
</style>