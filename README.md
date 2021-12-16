# Table-Exporter

> 使用前端 **table** 结构, 导出 **excel** 结构

## 1. 导出正常表格到 Excel 

![](/src/assets/导出正常表格-2.png) 

> 正常按表格格式书写 **column 和 data, dataIndex 为对应数据源的字段**
>
> 注意：**column 中的 key 默认为 title，可通过 columnKey 设置**

```js
# code
// 点击导出触发的函数
handleExport() {
      const instance = new ElMapExportTable(
        { column, data },
        { progress: progress => console.log(progress) }// 进度条回调
      );
      instance.download("导出正常表格案例");
}

# column
const column = [
        { title: "日期", dataIndex: "date" }, // title为excel列名称,dataIndex为当前列对应的数据源字段
        { title: "姓名", dataIndex: "name" },
        { title: "地址", dataIndex: "address" },
];

# data
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
]
```

## 2. 导出表头合并到 Excel

![](/src/assets/导出表头合并表格-2.png) 

> 表头的合并，将对应的**列设置成相应的树形结构**
>
> 注意：**树形结构默认的孩子字段为 children,可通过 childrenKey 设置**

```js
# code
// 点击导出触发的函数
handleExport() {
      const instance = new ElMapExportTable(
        { column, data },
        { progress: progress => console.log(progress) }// 进度条回调
      );
      instance.download("导出表头合并的表格案例");
}

# column
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

# data
const data = [
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
]
```

## 3. 导出表体合并到 Excel

![](/src/assets/导出表体合并表格-2.png) 

> 表体的合并，指定 **spanMethod**函数，该函数接收 **4 个参数**，返回值为**对象格式,可写参数为 rowspan、colspan**
>
> **row**：当前行数据
>
> **column**：当前列数据
>
> **rowIndex**：当前行索引
>
> **columnIndex**：当前列索引

```js
# code
// 点击导出触发的函数
handleExport() {
      const instance = new ElMapExportTable(
        { column, data },
        {
          progress: progress => console.log(progress),
          spanMethod: ({ row, column, rowIndex, columnIndex }) => {
            if (columnIndex === 0) {
              if (rowIndex % 2 === 0) {
                return {
                  rowspan: 2,
                  colspan: 1,
                };
              }
            }
          },
        }
      );
      instance.download("导出表体合并案例");
}

# column
const column = [
        { title: "ID", dataIndex: "id" },
        { title: "姓名", dataIndex: "name" },
        { title: "数值1（元）", dataIndex: "amount1" },
        { title: "数值2（元）", dataIndex: "amount2" },
        { title: "数值3（元）", dataIndex: "amount3" },
];

# data
const data = [
        {
          id: "12987122",
          name: "王小虎1",
          amount1: "234",
          amount2: "3.2",
          amount3: 10,
        },
        {
          id: "12987123",
          name: "王小虎2",
          amount1: "165",
          amount2: "4.43",
          amount3: 12,
        },
        {
          id: "12987124",
          name: "王小虎3",
          amount1: "324",
          amount2: "1.9",
          amount3: 9,
        },
        {
          id: "12987125",
          name: "王小虎4",
          amount1: "621",
          amount2: "2.2",
          amount3: 17,
        },
        {
          id: "12987126",
          name: "王小虎5",
          amount1: "539",
          amount2: "4.1",
          amount3: 15,
        },
];
```

## 4. 导出混合合并到 Excel

![](/src/assets/导出混合表格到Excel.png) 

> 混合合并，只需要结合**表头合并 + 表体合并即可**

```js
# code
// 点击导出触发的函数
handleExport() {
      const instance = new ElMapExportTable(
        { column, data },
        {
            progress: progress => console.log(progress),
            spanMethod: ({ rowIndex, columnIndex }) => {
            if (columnIndex === 0 && rowIndex === 0) {
              return {
                rowspan: 2,
                colspan: 2,
              };
            }
            if (rowIndex === 2 && columnIndex === 2) {
              return {
                rowspan: 1,
                colspan: 3,
              };
            }
            if (rowIndex === 0 && columnIndex === 4) {
              return {
                rowspan: 2,
                colspan: 1,
              };
            }
            if (rowIndex === 6 && columnIndex === 0) {
              return {
                rowspan: 1,
                colspan: 6,
              };
            }
          },
        }
      );
      instance.download("导出正常表格案例");
}

# column
const column = [
        { title: "姓名", dataIndex: "name" },
        { title: "年龄", dataIndex: "age" },
        {
          title: "配送信息",
          children: [
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

# data
const data = [
        {
          date: "2016-05-03",
          name: "王小虎",
          age: 20,
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          age: 20,
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          age: 20,
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          age: 20,
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
        {
          date: "2016-05-08",
          name: "王小虎",
          age: 20,
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
        {
          date: "2016-05-08",
          name: "王小虎",
          age: 20,
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
        {
          date: "2016-05-07",
          name: "王小虎",
          age: 20,
          province: "上海",
          city: "普陀区",
          address: "上海市普陀区金沙江路 1518 弄",
          zip: 200333,
        },
]
```

## 5. 导出图片到 Excel

## 6. 设置 Excel 的列样式

![](/src/assets/设置Excel的列样式.png) 

> 提供 **setColumnStyle 函数, 该函数接收一个参数,参数格式为对象,包含 columnIndex (当前列索引)**
>
> 返回值为**对象,具体可写的所有样式参考https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E6%A0%B7%E5%BC%8F**

```js
# code
// 点击导出触发的函数内
handleExport(){
  const instance = new ElMapExportTable(
     {
         column,
         data,
         setColumnStyle({ columnIndex }) {
             if (columnIndex === 2) {
                 return { width: 40, style: { font: { bold: true } } };
             }
         },
     },
     { progress: progress => console.log(progress) }
 );
  instance.download("设置Excel的列样式");
}
```

## 7. 设置 Excel 的行样式

![](/src/assets/设置Excel的行样式.png) 

提供 **setRowStyle** 函数

该函数接收一个参数,参数格式为对象,包含 **data (数据源)、rowIndex (当前行索引)、columnIndex (当前列索引)、type (标识当前是表头还是表体)**

返回值为**对象,具体可写的所有样式参考https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E8%A1%8C**

```js
# code
// 点击导出触发的函数内
handleExport(){
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
     { progress: progress => console.log(progress) }
 );
  instance.download("设置Excel的行样式");
}
```

## 8. 设置 Execl 的单元格样式

![](/src/assets/设置Excel的单元格样式.png) 

> 提供 **setCellStyle** 函数
>
> 该函数接收一个参数,参数格式为对象,包含 **data (数据源)、rowIndex (当前行索引)、columnIndex (当前列索引)、type (标识当前是表头还是表体)**
>
> 返回值为**对象,具体可写的所有样式参考https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E6%A0%B7%E5%BC%8F**

```js
// 点击导出触发的函数内
handleExport(){
  const instance = new ElMapExportTable(
     {
         column,
         data,
         setCellStyle({ data, columnIndex, rowIndex, type }) {
            console.log({ data, columnIndex, rowIndex, type });
            if (type === "main" && columnIndex === 2) {
              return {
                font: {
                  size: 16, // 字体大小
                  bold: true, // 字体加粗
                  italic: true, // 字体倾斜
                  color: { argb: "FFFF0000" }, // 字体颜色
                },
                // fill: {
                //   type: "pattern",
                //   pattern: "solid",
                //   fgColor: { argb: "FF0000FF" }, // 填充背景颜色
                // },
              };
            }
          },
     },
     { progress: progress => console.log(progress) }
 );
  instance.download("设置Excel的单元格样式");
}
```

## 9. 自定义 Excel 单元格格式

## 10. 设置 Excel-Sheet 样式

## 11. 导出多个 Sheet 到 Excel

## 12. 临时插入 Excel 数据

## 13. 导出表尾统计到 Excel

## 14. 导出大数据量表格到 Excel

## 参数说明


