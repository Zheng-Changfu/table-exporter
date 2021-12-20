# Table-Exporter

> 使用前端 **table** 结构, 导出 **excel** 结构, 基于 **exceljs + file-saver**

```bash
npm install table-excel
```

# 目录

- [导出正常表格到 Excel](#1)
- [导出表头合并到 Excel](#2)
- [导出表体合并到 Excel](#3)
- [导出混合合并到 Excel](#4)
- [导出树形表格到 Excel](#5)
- [导出图片到 Excel](#6)
- [设置 Excel 的列样式](#7)
- [设置 Excel 的行样式](#8)
- [设置 Excel 的单元格样式](#9)
- [自定义 Excel 单元格格式](#10)
- [设置 Excel-Sheet 样式](#11)
- [临时插入 Excel 头部数据](#12)
- [临时插入 Excel 尾部数据](#13)
- [导出多个 Sheet 到 Excel](#14)
- [导出大数据量表格到 Excel](#15)

## <h2 id="1">1. 导出正常表格到 Excel </h2>

![](/public/assets/导出正常表格-2.png) 

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

## <h2 id="2">2. 导出表头合并到 Excel </h2>

![](/public/assets/导出表头合并表格-2.png) 

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

## <h2 id="3">3. 导出表体合并到 Excel</h2>

![](/public/assets/导出表体合并表格-2.png) 

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
        {
            column,
            data,
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
        },
        {
          progress: progress => console.log(progress),
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

## <h2 id="4">4. 导出混合合并到 Excel</h2>

![](/public/assets/导出混合表格到Excel.png) 

> 混合合并，需要结合**表头合并 + 表体合并即可**

```js
# code
// 点击导出触发的函数
handleExport() {
      const instance = new ElMapExportTable(
        { 
            column,
            data,
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
        },
        {progress: progress => console.log(progress)}
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

## <h2 id="5">5. 导出树形表格到 Excel</h2>

![](/public/assets/导出树形表格.png) 

> 支持树形数据的导出,当数据中有 **children** 字段时会标记为树形的 **Excel** 如果不需要或配置为其他字段可以用 **childrenKey** 进行配置
>
> 可以通过 **indentSize** 以控制每一层的缩进宽度
>
> 必须添加 **treeNode:true** 字段
>
> 默认会取第一列的字段作为 **树形结构展示**，如果是其他列可以用 **treeField** 字段来指定列名
>
> 注意：**树形结构表体区域不支持合并、表头可以自定义合并**

```js
# code
// 点击导出触发的函数
handleExport() {
    const instance = new ElMapExportTable(
        { 
            column,
            data,
            treeNode:true,
            treeField: "name",
        },
        { 
            progress: progress => console.log(progress),
            indentSize: 1, // 默认是1,可自行调整
        }
    );
    instance.download("导出树形表格案例");
}

# column
const column = const column = [
        { title: "ID", dataIndex: "id" },
        { title: "日期", dataIndex: "date" },
        { title: "姓名", dataIndex: "name" },
        { title: "地址", dataIndex: "address" },
];

# data
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
```

## <h2 id="6">6. 导出图片到 Excel</h2>

![](/public/assets/导出图片到Excel.png) 

> 将 **dataIndex对应的数据源设置成数组结构即可**
>
> 另外对于图片的样式(目前只支持设置图片宽高)提供了 **setImageStyle 函数** ,参数格式为对象,包含 **data (数据源)、rowIndex (当前行索引)、columnIndex (当前列索引)、type (标识当前是表头还是表体)****
>
> 注意：数组中每一项都为 **图片url路径,错误路径会导致请求失败，保证图片路径和当前项目是同源，否则会导致跨域**

```js
# code
// 点击导出触发的函数
handleExport() {
	const instance = new ElMapExportTable(
        {
          column,
          data: this.tableData,
          setImageStyle: ({ data, rowIndex, columnIndex, type }) => {
            return {
              width: 100,
              height: 100,
            };
          },
        },
        { progress: val => console.log(val) }
      );
      instance.download("导出图片到Excel案例");
}

# column
const column = [
        { title: "日期", dataIndex: "date" },
        { title: "姓名", dataIndex: "name" },
        { title: "图片", dataIndex: "images" },
        { title: "地址", dataIndex: "address" },
      ];

# data
const data = [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
          images: [
            "/assets/插入数据到Excel尾部.png",
            "/assets/插入数据到Excel尾部.png",
            "/assets/插入数据到Excel尾部.png",
          ],
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

## <h2 id="7">7. 设置 Excel 的列样式</h2>

![](/public/assets/设置Excel的列样式.png) 

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

## <h2 id="8">8. 设置 Excel 的行样式</h2>

![](/public/assets/设置Excel的行样式.png) 

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

## <h2 id="9">9. 设置 Execl 的单元格样式</h2>

![](/public/assets/设置Excel的单元格样式.png) 

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

## <h2 id="10">10. 自定义 Excel 单元格格式</h2>

![](/public/assets/自定义单元格格式-1.png) 

![](/public/assets/自定义单元格格式-2.png) 

> 提供 **setCellFormat** 函数
>
> 该函数接收一个参数,参数格式为对象,包含 **data (数据源)、rowIndex (当前行索引)、columnIndex (当前列索引)、type (标识当前是表头还是表体)**
>
> 返回值为**对象,具体可写的所有样式参考https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E6%95%B0%E5%AD%97%E6%A0%BC%E5%BC%8F**

```js
# code 
// 点击导出触发的函数内
handleExport(){
    const instance = new ElMapExportTable(
        {
            column,
            data,
            setCellFormat: ({ data, rowIndex, columnIndex, type }) => {
                if (type === "header" && rowIndex === 0 && columnIndex === 0) {
                    return {
                        text: "我是超链接",
                        hyperlink: "http://www.chengxiaohui.com",
                        tooltip: "小郑同学的开发路",
                    };
                }
                if (rowIndex === 1 && columnIndex === 0) {
                    return {
                        numFmt: "yyyy-mm-dd",
                    };
                }
            },
        },
        { progress => console.log(progress) }
    );
    instance.download("自定义Excel单元格格式");
}
```

## <h2 id="11">11. 设置 Excel-Sheet 样式</h2>

![](/public/assets/设置Excel-Sheet样式.png) 

> 提供 **setSheetStyle** 函数
>
> 该函数接收一个参数,参数格式为对象,包含 **sheetIndex (当前sheet索引)**
>
> 返回值为**对象,具体可写的所有样式参考https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E6%B7%BB%E5%8A%A0%E5%B7%A5%E4%BD%9C%E8%A1%A8**

```js
# code
// 点击导出触发的函数内
handleExport(){
    const instance = new ElMapExportTable(
        {
            column,
            data,
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
        { progress => console.log(progress) }
    );
    instance.download("设置Excel-Sheet样式");
}
```

## <h2 id="12">12. 临时插入 Excel 头部数据</h2>

![](/public/assets/插入数据到Excel头部.png) 

> 提供 **setInsertHeader** 函数
>
> 该函数接收一个参数,参数格式为对象,包含 **sheetIndex (当前sheet索引)**
>
> 返回值为**对象,对象中可以写 cells (单元格信息及样式)、columnStyle (列样式)、rowStyle (行样式)**
>
> **注意**: 目前只支持插入数据到头部、尾部

```js
# code
// 点击导出触发的函数内
handleExport(){
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
        { progress => console.log(progress) }
    );
    instance.download("临时插入Excel头部数据");
}
```

## <h2 id="13">13. 临时插入 Excel 尾部数据</h2>

![](/public/assets/插入数据到Excel尾部.png) 

> 和 **setInsertHeader** 同配置
>
> 提供 **setInsertFooter** 函数
>
> 该函数接收一个参数,参数格式为对象,包含 **sheetIndex (当前sheet索引)**
>
> 返回值为**对象,对象中可以写 cells (单元格信息及样式)、columnStyle (列样式)、rowStyle (行样式)**
>
> **注意**: 目前只支持插入数据到头部、尾部
>
> **注意**: 内部会自动推断现在的位置，我们只需要考虑从尾部开始的位置即可,位置是从**(0 row,0 col)开始**

```js
# code
// 点击导出触发的函数内
handleExport(){
    const instance = new ElMapExportTable(
        {
            column,
            data,
            setInsertFooter: ({ sheetIndex }) => {
                console.log(sheetIndex);
                return {
                    cells: [
                        {
                            row: 0,
                            col: 0,
                            rowspan: 2, // 占2行
                            colspan: 3, // 占3列
                            text: "我是插入到Excel尾部的信息",
                        },
                        {
                            row: 2,
                            col: 0,
                            rowspan: 3,
                            colspan: 3,
                            text: "我也是插入到Excel尾部的信息",
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
        { progress => console.log(progress) }
    );
    instance.download("临时插入数据到Excel尾部");
}
```

## <h2 id="14">14. 导出多个 Sheet 到 Excel</h2>

![](/public/assets/导出多个sheet-1.png) 

![](/public/assets/导出多个sheet-2.png) 

> 传递为一个**数组**即可，数组中每一项都为一个**Sheet**,**Sheet的所有配置同之前一样**

```js
# code
// 点击导出触发的函数内
handleExport(){
    const instance = new ElMapExportTable(
        [
            { column: column1, data: data1, sheetName: "我是Sheet1" },
            { column: column2, data: data2, sheetName: "我是Sheet2" },
        ],
        { progress: this.handlePercentage }
    );
    instance.download("导出多个Sheet到Excel");
}
```

## <h2 id="15">15. 导出大数据量表格到 Excel</h2>

![](/public/assets/导出大数据量表格.png) 

> 目前在小于 **70W** 条总数据时，导出比较快
>
> 后续考虑增加 **web-worker机制** 来处理大数据量

```js
# code
const instance = new ElMapExportTable(
    { column, data },
    { progress: val => console.log(val) }
);
instance.download("导出大数据量表格到Excel");
```

## 参数说明

### column属性

| 参数      | 说明                                                | 类型   | 默认值 |
| --------- | --------------------------------------------------- | ------ | ------ |
| title     | 对应的 Excel 列名,可通过 **columnKey设置**          | any    | -      |
| dataIndex | Excel 列对应的数据源字段                            | string | ''     |
| children  | Excel 表头分组嵌套列配置,可通过 **childrenKey设置** | array  | -      |

### data属性

> 显示的数据

### 其他属性

| 参数            | <div style="width:200">说明</div>                            | 类型                                                    | 默认值                 |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------- | ---------------------- |
| progress        | 导出时触发的进度条方法                                       | Function(val)                                           | -                      |
| treeNode        | 标识导出后是否以 **树形结构** 展示                           | boolean                                                 | false                  |
| treeField       | 默认会取第一列的字段作为 **树形结构展示**，如果是其他列可以用 **treeField** 字段来指定列名 | string                                                  | 第一列的字段           |
| indentSize      | 控制 **树形结构的层级缩进**                                  | number                                                  | 1                      |
| spanMethod      | 合并行或列的计算方法                                         | Function({ row, column, rowIndex, columnIndex })/Object | -                      |
| sheetName       | **Excel** 中的 **Sheet** 名称                                | string                                                  | `sheet + i + 1`        |
| columnKey       | **Excel** 默认的列名配置名称                                 | string                                                  | title                  |
| childrenKey     | **Excel** 表头分组嵌套列/树形结构子节点 名称                 | string                                                  | children               |
| setColumnStyle  | 列的 **style** 方法                                          | Function({columnIndex})/Object                          | -                      |
| setRowStyle     | 行的 **style** 方法                                          | Function({data,rowIndex,columnIndex,type})/Object       | -                      |
| setCellStyle    | 单元格的 **style** 方法                                      | Function({data,rowIndex,columnIndex,type})/Object       | -                      |
| setImageStyle   | 图片的 **style** 方法                                        | Function({data,rowIndex,columnIndex,type})/Object       | {width:100,height:100} |
| setCellFormat   | 单元格的 **格式** 方法                                       | Function({data,rowIndex,columnIndex,type})/Object       | -                      |
| setSheetStyle   | **Excel** 中 **Sheet** 样式的方法                            | Function({sheetIndex})/Object                           | -                      |
| setInsertHeader | 临时插入数据到 **Excel头部** 的方法                          | Function({sheetIndex})/Object                           | -                      |
| setInsertFooter | 临时插入数据到 **Excel尾部** 的方法                          | Function({sheetIndex})/Object                           | -                      |
| tables          | 导出多个 **table**                                           | array                                                   | [{table}]              |
