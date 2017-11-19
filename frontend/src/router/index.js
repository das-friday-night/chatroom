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
      component: HelloWorld
    },
    {
      path: '/chat',
      name: 'ChatPanel',
      component: ChatPanel
    },
    {
      path: '/rooms',
      name: Rooms,
      component: Rooms
    }
  ]
})
