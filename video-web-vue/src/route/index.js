import Router from 'vue-router'
import Vue from 'vue'
import Home from '../components/Home.vue'
Vue.use(Router)
export default new Router({
    routes: [
        { path: '/', redirect: '/home' },
        {
            path: '/', 
            component: Home, 
            children: [
                { path: '/home', component: re => require(['../components/videoList.vue'], re) },
                { path: '/sort', component: re => require(['../components/Sort.vue'], re) },
                { path: '/watch', component: re => require(['../components/Watching.vue'], re) },
                { path: '/upload', component: re => require(['../components/UploadList.vue'], re) },
            ]
        },
    ]
})