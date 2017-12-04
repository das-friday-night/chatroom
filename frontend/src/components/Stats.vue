<template>
  <el-container>
    <el-aside width="200px">
      <el-button type="success" @click="goRooms" round>Go Back</el-button>
      <div>Existed room: {{rooms_amount}}</div>
      <div>Existed user: {{user_amount}}</div>
    </el-aside>
    <el-main>
      <el-table :data="logs" style="width: 100%">
        <el-table-column prop="t"></el-table-column>
        <el-table-column prop="u"></el-table-column>
        <el-table-column prop="act"></el-table-column>
        <el-table-column prop="m"></el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script>
  import Vue from 'vue'
  import socketio from 'socket.io-client'

  export default {
    data() {
//      var socket = socketio('http://localhost:8080');
      var socket = socketio();

      return {
        rooms_amount: 0,
        user_amount: 0,
        socket: socket,
        logs:[]
      };
    },
    beforeRouteEnter (to, from, next) {
      Vue.http.get('/v1/stats')
        .then(res => {
          if(res.body.logs && res.body.room && res.body.user){
            next(vm => vm.setData(res.body));
          }
          else {
            throw new Error('missing info in log object');
          }

        })
        .catch(err => {
          console.log(err);
          console.log('fetch stats failed!');
          next('/rooms');
        })
    },
    created() {
      this.socket.on('stats', (msg) => {
        let date = new Date(msg.t);
        msg.t = date.toLocaleString();
        this.logs.push(msg);
      });
    },
    methods: {
      goRooms() {
        this.socket.close();
        this.$router.replace('/rooms');
      },

      setData (data) {
        data.logs.forEach(log => {
          let date = new Date(log.t);
          log.t = date.toLocaleString();
          return log;
        });
        this.logs = data.logs;
        this.rooms_amount = data.room;
        this.user_amount = data.user;
      }
    }

  }
</script>

