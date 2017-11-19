import Vue from 'vue'
import VueResource from 'vue-resource'
import Router from 'vue-router'
import HelloWorld from '../components/HelloWorld'
import ChatPanel from '../components/ChatPanel'
import Rooms from '../components/Rooms'


Vue.use(VueResource)
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld,
      beforeEnter: (to, from, next) => {
        if(localStorage.getItem('userid')) next('/rooms');
        else next();
      }
    },
    {
      path: '/chat',
      name: 'ChatPanel',
      component: ChatPanel,
      beforeEnter: (to, from, next) => {
        if(!localStorage.getItem('userid')) next('/');
        if(!localStorage.getItem('current_room')) next('/rooms');
        else next();
      }
    },
    {
      path: '/rooms',
      name: Rooms,
      component: Rooms,
      beforeEnter: (to, from, next) => {
        if(!localStorage.getItem('userid')) next('/');
        else next();
      }
    }
  ]
})
