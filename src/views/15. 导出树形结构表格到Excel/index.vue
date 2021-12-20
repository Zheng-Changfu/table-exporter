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
import { ElMapExportTable } from "table-excel/table-helpers/el-map-table";
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
        { title: "ID", dataIndex: "id" },
        { title: "日期", dataIndex: "date" },
        { title: "姓名", dataIndex: "name" },
        { title: "地址", dataIndex: "address" },
      ];
      const data = [
        {
          id: "1",
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
          children: [
            {
              id: "1-1",
              date: "2016-05-02",
              name: "王小虎-1",
              address: "上海市普陀区金沙江路 1518 弄",
            },
            {
              id: "1-2",
              date: "2016-05-02",
              name: "王小虎-2",
              address: "上海市普陀区金沙江路 1518 弄",
              children: [
                {
                  id: "1-2-1",
                  date: "2016-05-02",
                  name: "王小虎-1",
                  address: "上海市普陀区金沙江路 1518 弄",
                },
                {
                  id: "1-2-2",
                  date: "2016-05-02",
                  name: "王小虎-2",
                  address: "上海市普陀区金沙江路 1518 弄",
                },
                {
                  id: "1-2-3",
                  date: "2016-05-02",
                  name: "王小虎-2",
                  address: "上海市普陀区金沙江路 1518 弄",
                },
              ],
            },
          ],
        },
        {
          id: "2",
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄",
        },
        {
          id: "3",
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄",
          children: [
            {
              id: "3-1",
              date: "2016-05-02",
              name: "王小虎-1",
              address: "上海市普陀区金沙江路 1518 弄",
            },
            {
              id: "3-2",
              date: "2016-05-02",
              name: "王小虎-2",
              address: "上海市普陀区金沙江路 1518 弄",
            },
            {
              id: "3-3",
              date: "2016-05-02",
              name: "王小虎-2",
              address: "上海市普陀区金沙江路 1518 弄",
            },
          ],
        },
        {
          id: "4",
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄",
        },
      ];
      const instance = new ElMapExportTable(
        {
          column,
          data,
          sheetName: "我是Sheet1",
          treeNode: true,
          treeField: "name",
        },
        {
          progress: this.handlePercentage,
          indentSize: 1,
        }
      );
      instance.download("导出树形表格案例");
    },
    handlePercentage(percentage) {
      this.percentage = percentage;
    },
  },
};
</script>

<style>
</style>