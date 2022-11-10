import Vue from 'vue'
import App from './App.vue'
import router from './route'
import axios from './request'
import './assets/all.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.prototype.$request = axios.request
Vue.prototype.$baseURL = axios.baseURL
Vue.prototype.$videojs = videojs
router.beforeEach((to,from,next) => {
  next()
})


new Vue({
  render: h => h(App),
  router
}).$mount('#app')
