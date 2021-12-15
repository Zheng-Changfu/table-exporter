import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/export-table-1',
      component: () => import('../views/1. 导出正常表格案例/index.vue'),
      meta: {
        desc: '1. 导出正常表格案例'
      }
    },
    {
      path: '/export-table-2',
      name: 'ExportTable2',
      component: () => import('../views/2. 导出合并单元格的表格案例/index.vue'),
      meta: {
        desc: '2. 导出合并单元格的表格案例'
      }
    },
    {
      path: '/export-table-3',
      name: 'ExportTable3',
      component: () => import('../views/3. 导出多个表格分成多个sheet案例/index.vue'),
      meta: {
        desc: '3. 导出多个表格分成多个sheet案例'
      }
    },
    {
      path: '/export-table-5',
      name: 'ExportTable5',
      component: () => import('../views/5. 导出插入表头额外数据案例/index.vue'),
      meta: {
        desc: '5. 导出插入表头额外数据案例'
      }
    },
  ]
})
