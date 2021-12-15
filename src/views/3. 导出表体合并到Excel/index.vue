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
      :data="tableData"
      :span-method="objectSpanMethod"
      border
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column
        prop="id"
        label="ID"
        width="180"
      >
      </el-table-column>
      <el-table-column
        prop="name"
        label="姓名"
      >
      </el-table-column>
      <el-table-column
        prop="amount1"
        label="数值 1（元）"
      >
      </el-table-column>
      <el-table-column
        prop="amount2"
        label="数值 2（元）"
      >
      </el-table-column>
      <el-table-column
        prop="amount3"
        label="数值 3（元）"
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
          id: "12987122",
          name: "王小虎",
          amount1: "234",
          amount2: "3.2",
          amount3: 10,
        },
        {
          id: "12987123",
          name: "王小虎",
          amount1: "165",
          amount2: "4.43",
          amount3: 12,
        },
        {
          id: "12987124",
          name: "王小虎",
          amount1: "324",
          amount2: "1.9",
          amount3: 9,
        },
        {
          id: "12987125",
          name: "王小虎",
          amount1: "621",
          amount2: "2.2",
          amount3: 17,
        },
        {
          id: "12987126",
          name: "王小虎",
          amount1: "539",
          amount2: "4.1",
          amount3: 15,
        },
      ],
      percentage: 0,
    };
  },
  methods: {
    handleExport() {
      const column = [
        { title: "ID", dataIndex: "id" },
        { title: "姓名", dataIndex: "name" },
        { title: "数值1（元）", dataIndex: "amount1" },
        { title: "数值2（元）", dataIndex: "amount2" },
        { title: "数值3（元）", dataIndex: "amount3" },
      ];
      const data = [
        {
          id: "12987122",
          name: "王小虎",
          amount1: "234",
          amount2: "3.2",
          amount3: 10,

          cell: {
            rowspan: 2,
            dataIndex: "id",
          },
        },
        {
          id: "12987123",
          name: "王小虎",
          amount1: "165",
          amount2: "4.43",
          amount3: 12,
        },
        {
          id: "12987124",
          name: "王小虎",
          amount1: "324",
          amount2: "1.9",
          amount3: 9,

          cell: {
            rowspan: 2,
            dataIndex: "id",
          },
        },
        {
          id: "12987125",
          name: "王小虎",
          amount1: "621",
          amount2: "2.2",
          amount3: 17,
        },
        {
          id: "12987126",
          name: "王小虎",
          amount1: "539",
          amount2: "4.1",
          amount3: 15,
        },
      ];
      const instance = new ElMapExportTable(
        { column, data },
        { progress: this.handlePercentage }
      );
      instance.download("导出表体合并案例");
    },
    handlePercentage(percentage) {
      this.percentage = percentage;
    },
    objectSpanMethod({ rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (rowIndex % 2 === 0) {
          return {
            rowspan: 2,
            colspan: 1,
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    },
  },
};
</script>

<style>
</style>