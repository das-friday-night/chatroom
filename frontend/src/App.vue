<template>
  <div id="app">
    <el-menu
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
      <el-menu-item index="1" v-on:click="logout">Log Out</el-menu-item>
    </el-menu>

    <router-view/>
  </div>
</template>

<script>
  import Vue from 'vue'

  export default {
    name: 'app',
    methods: {
      logout() {
        Vue.http.get('/auth/logout')
          .then(res => {
            if(res.body === 'logout success!'){
              localStorage.removeItem('userid');
              localStorage.removeItem('current_room');
              localStorage.removeItem('joined_rooms');
              this.$router.replace('/');
            }
            else {
              console.log('logout failed!');
            }
          })
      }
    }
  }
</script>

