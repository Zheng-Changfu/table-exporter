import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/export-table-1',
      component: () => import('../views/1. 导出正常表格到Excel/index.vue'),
    },
    {
      path: '/export-table-2',
      component: () => import('../views/2. 导出表头合并到Excel/index.vue'),
    },
    {
      path: '/export-table-3',
      component: () => import('../views/3. 导出表体合并到Excel/index.vue'),
    },
    {
      path: '/export-table-4',
      component: () => import('../views/4. 导出混合合并到Excel/index.vue'),
    },
    {
      path: '/export-table-5',
      component: () => import('../views/5. 导出图片到Excel/index.vue'),
    },
    {
      path: '/export-table-6',
      component: () => import('../views/6. 设置Excel的列样式/index.vue'),
    },
    {
      path: '/export-table-7',
      component: () => import('../views/7. 设置Excel的行样式/index.vue'),
    },
    {
      path: '/export-table-8',
      component: () => import('../views/8. 设置Execl的单元格样式/index.vue'),
    },
    {
      path: '/export-table-9',
      component: () => import('../views/9. 设置Excel单元格格式/index.vue'),
    },
    {
      path: '/export-table-10',
      component: () => import('../views/10. 设置Excel-Sheet样式/index.vue'),
    },
    {
      path: '/export-table-11',
      component: () => import('../views/11. 临时插入Excel头部数据/index.vue'),
    },
    {
      path: '/export-table-12',
      component: () => import('../views/12. 临时插入Excel尾部数据/index.vue'),
    },
    {
      path: '/export-table-13',
      component: () => import('../views/13. 导出多个Sheet到Excel/index.vue'),
    },
    {
      path: '/export-table-14',
      component: () => import('../views/14. 导出大数据量表格到Excel/index.vue'),
    },
    {
      path: '/export-table-15',
      component: () => import('../views/15. 导出树形结构表格到Excel/index.vue'),
    },
  ]
})
