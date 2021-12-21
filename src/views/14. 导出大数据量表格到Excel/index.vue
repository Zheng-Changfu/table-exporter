<template>
  <div v-loading="loading">
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
import { ElMapExportTable } from "table-excel";
export default {
  name: "ExportTable1",
  data() {
    return {
      loading: false,
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
    async handleExport() {
      const data = [];
      const dataTime = 100000;
      for (let i = 0; i < dataTime; i++) {
        data.push({
          id: i + 1,
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        });
      }
      const column = [];
      const columnInfoMap = {
        0: { title: "ID", dataIndex: "id" },
        1: { title: "日期", dataIndex: "date" },
        2: { title: "姓名", dataIndex: "name" },
        3: { title: "地址", dataIndex: "address" },
      };
      const columnTime = 6;
      for (let i = 0; i < columnTime; i++) {
        const columnInfo = columnInfoMap[i % 4];
        column.push({ ...columnInfo });
      }
      const instance = new ElMapExportTable({ column, data });
      await instance.download("导出大数据量表格到Excel");
    },
    handlePercentage(percentage) {
      this.percentage = percentage;
    },
  },
};
</script>

<style>
</style>