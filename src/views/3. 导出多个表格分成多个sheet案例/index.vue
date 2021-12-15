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
    <el-tabs v-model="activeName">
      <el-tab-pane
        v-for="item in count"
        :key="item"
        :label="`表格${item}`"
        :name="'' + item"
      >
        <el-table
          :data="tableData"
          border
          show-summary
          style="width: 100%"
        >
          <el-table-column
            prop="id"
            :label="`ID${item}`"
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
            sortable
            label="数值 1"
          >
          </el-table-column>
          <el-table-column
            prop="amount2"
            sortable
            label="数值 2"
          >
          </el-table-column>
          <el-table-column
            prop="amount3"
            sortable
            label="数值 3"
          >
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Control from "./calculate";
export default {
  name: "ExportTable4",
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
      activeName: "0",
      count: 5,
    };
  },
  methods: {
    handleExport() {
      const control = new Control({
        data: [this.tableData, this.count],
        progress: this.handlePercentage,
      });
      control.export();
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