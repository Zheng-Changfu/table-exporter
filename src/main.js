import Vue from 'vue'
import ElementUI from 'element-ui';
import 'xe-utils'
import VxeTable from 'vxe-table';
import App from './App.vue'
import router from './router'
import 'element-ui/lib/theme-chalk/index.css';
import 'vxe-table/lib/style.css';

Vue.use(VxeTable);
Vue.use(ElementUI);
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')