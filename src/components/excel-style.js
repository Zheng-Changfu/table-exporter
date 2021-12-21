// 头部默认样式
export const defaultTHCellStyle = {
  alignment: {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true
  },
  fill: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF4F5FA' },
  },
  border: {
    top: { style: 'thin', color: { argb: 'FFD4D4D4' } },
    left: { style: 'thin', color: { argb: 'FFD4D4D4' } },
    bottom: { style: 'thin', color: { argb: 'FFD4D4D4' } },
    right: { style: 'thin', color: { argb: 'FFD4D4D4' } },
  },
};
// 单元格默认样式
export const defaultTdCellStyle = {
  alignment: {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true
  },
  fill: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFFF' },
  },
  border: {
    top: { style: 'thin', color: { argb: 'FFD4D4D4' } },
    left: { style: 'thin', color: { argb: 'FFD4D4D4' } },
    bottom: { style: 'thin', color: { argb: 'FFD4D4D4' } },
    right: { style: 'thin', color: { argb: 'FFD4D4D4' } },
  },
};
// 插入到头部的默认样式
export const defaultInsertTHCellStyle = {
  alignment: {
    vertical: 'middle',
    horizontal: 'left',
    wrapText: true
  },
  border: {
    top: { style: 'thin', color: { argb: 'FFD4D4D4' } },
    left: { style: 'thin', color: { argb: 'FFD4D4D4' } },
    bottom: { style: 'thin', color: { argb: 'FFD4D4D4' } },
    right: { style: 'thin', color: { argb: 'FFD4D4D4' } },
  },
  font: {
    bold: true,
    color: {
      argb: "FFFF0000"
    }
  }
}
// 默认的excel列样式
export const defaultColumnStyle = {
  width: 20,
}
// 默认的excel表头的行样式
export const defaultThRowStyle = {
  height: 20,
  font: {
    bold: true
  },
}