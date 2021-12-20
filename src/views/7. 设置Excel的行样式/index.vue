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
  </div>
</template>

<script>
import { ElMapExportTable } from "table-excel";
export default {
  name: "ExportTable1",
  data() {
    return {
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
          setRowStyle({ data, columnIndex, rowIndex, type }) {
            console.log({ data, columnIndex, rowIndex, type });
            if (type === "main") {
              return {
                height: 40,
              };
            }
          },
        },
        { progress: this.handlePercentage }
      );
      instance.download("设置Excel的行样式");
    },
    handlePercentage(percentage) {
      this.percentage = percentage;
    },
  },
};
</script>

<style>
</style>