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
import { ElMapExportTable } from "table-excel";
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
      // 如果是合并单元格的列,设置成相应的树形结构即可
      const column = [
        { title: "日期", dataIndex: "date" },
        {
          title: "配送信息",
          children: [
            { title: "姓名", dataIndex: "name" },
            {
              title: "地址",
              children: [
                { title: "省份", dataIndex: "province" },
                { title: "市区", dataIndex: "city" },
                { title: "地址", dataIndex: "address" },
                { title: "邮编", dataIndex: "zip" },
              ],
            },
          ],
        },
      ];
      const instance = new ElMapExportTable(
        { data: this.tableData, column },
        { progress: this.handlePercentage }
      );
      instance.download("导出合并单元格的表格案例");
    },
    handlePercentage(percentage) {
      this.percentage = percentage;
    },
  },
};
</script>

<style>
</style>