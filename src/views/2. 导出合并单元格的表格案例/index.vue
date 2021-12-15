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
      style="width: 100%"
    >
      <el-table-column
        prop="date"
        label="日期"
        width="150"
      >
      </el-table-column>
      <el-table-column label="配送信息">
        <el-table-column
          prop="name"
          label="姓名"
          width="120"
        >
        </el-table-column>
        <el-table-column label="地址">
          <el-table-column
            prop="province"
            label="省份"
            width="120"
          >
          </el-table-column>
          <el-table-column
            prop="city"
            label="市区"
            width="120"
          >
          </el-table-column>
          <el-table-column
            prop="address"
            label="地址"
            width="300"
          >
          </el-table-column>
          <el-table-column
            prop="zip"
            label="邮编"
            width="120"
          >
          </el-table-column>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import Control from "./calculate";
export default {
  name: "ExportTable2",
  data() {
    return {
      tableData: [
        {
          date: "2016-05-03",
          name: "王小虎",
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
        {
          date: "2016-05-02",
          name: "王小虎",
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
        {
          date: "2016-05-08",
          name: "王小虎",
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
        {
          date: "2016-05-06",
          name: "王小虎",
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
        {
          date: "2016-05-07",
          name: "王小虎",
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
      ],
      percentage: 0,
    };
  },
  methods: {
    handleExport() {
      const control = new Control({
        data: this.tableData,
        progress: this.handlePercentage,
      });
      control.export();
    },
    handlePercentage(percentage) {
      this.percentage = percentage;
    },
  },
};
</script>

<style>
</style>