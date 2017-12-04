<template>
  <el-container>
    <el-container>
      <el-aside width="200px">
        <el-form ref="form">
          Create a new room
          <el-form-item>
            <el-button type="primary" @click="onSubmit">Create</el-button>
          </el-form-item>
        </el-form>
      </el-aside>

      <el-main>
        <el-col v-for="room in all_rooms" :key="room">
          <el-button
            type="primary"
            v-on:click="enter(room)"
            v-bind:disabled="my_rooms.indexOf(room) === -1">{{room}}</el-button>

          <el-button
            type="danger"
            v-if="my_rooms.indexOf(room) !== -1"
            v-on:click="leave(room)"
            round>Leave Room</el-button>

          <el-button
            type="success"
            v-else
            v-on:click="join(room)"
            round>Join Room</el-button>
        </el-col>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
  import Vue from 'vue'
  import socketio from 'socket.io-client'

  export default {
    data () {
      // var socket = socketio('http://localhost:8080');
      var socket = socketio();

      return {
        my_rooms: [],
        all_rooms: [],
        socket: socket
      }
    },

    mounted() {
      localStorage.removeItem('current_room');
      Vue.http.get('/v1/rooms/'+localStorage.getItem('userid'))
        .then(res => {
          if(res.data) {
            this.my_rooms = res.data.join_rooms;
            this.all_rooms = res.data.allrooms.map(room => room._id);
            localStorage.setItem('joined_rooms', this.my_rooms);
          }
        })
        .catch(err => {
          if(localStorage.getItem('joined_rooms')){
            this.my_rooms = localStorage.getItem('joined_rooms');
            console.log('load local');
          }
        })
    },

    methods: {
      enter(roomid) {
        localStorage.setItem('current_room',roomid);
        this.socket.close();
        this.$router.replace('/chat');
      },

      leave(roomid) {
        Vue.http.post('/v1/room', {action: 'leave', roomid: roomid, userid: localStorage.getItem('userid')})
          .then(res => {
            if(res.body.roomid){
              // delete room from rooms that I joined
              var index = this.my_rooms.indexOf(roomid);
              this.my_rooms.splice(index,1);
              localStorage.setItem('joined_rooms', this.my_rooms);

              // if this is the room I have entered recently, remove it from localStorage
              if(localStorage.getItem('current_room') === roomid){
                localStorage.removeItem('current_room');
              }

              // if I am the last one in room, room is deleted after my leave.
              if(res.body.roomid === 'room deleted'){
                // delete room from all rooms
                index = this.all_rooms.indexOf(roomid);
                this.all_rooms.splice(index,1);
              }

              this.socket.emit('stats', {
                userid: localStorage.getItem('userid'),
                action: 'leave room',
                message: roomid
              });
            }
            else {
              this.$message.error('leave room failed');
              this.socket.emit('stats', {
                userid: localStorage.getItem('userid'),
                action: 'leave room',
                message: 'failed'
              });
            }
          })
          .catch(err => {
            this.$message.error('leave room failed');
            this.socket.emit('stats', {
              userid: localStorage.getItem('userid'),
              action: 'leave room',
              message: 'failed'
            });
          });
      },

      join(roomid) {
        Vue.http.post('/v1/room', {action: 'enter', roomid: roomid, userid: localStorage.getItem('userid')})
          .then((res) => {
            if(res.body.roomid){
              this.my_rooms.push(res.body.roomid);
              localStorage.setItem('joined_rooms', this.my_rooms);

              this.socket.emit('stats', {
                userid: localStorage.getItem('userid'),
                action: 'join room',
                message: roomid
              });
            }
            else {
              this.$message.error('join room failed');
              this.socket.emit('stats', {
                userid: localStorage.getItem('userid'),
                action: 'join room',
                message: 'failed'
              });
            }
          })
          .catch(err => {
            this.$message.error('join room failed');
            this.socket.emit('stats', {
              userid: localStorage.getItem('userid'),
              action: 'join room',
              message: 'failed'
            });
          })
      },

      onSubmit() {
        Vue.http.post('/v1/room', {action: 'enter', roomid: null, userid: localStorage.getItem('userid')})
          .then((res) => {
            if(res.body.roomid){
              this.my_rooms.push(res.body.roomid);
              this.all_rooms.push(res.body.roomid);
              localStorage.setItem('joined_rooms', this.my_rooms);

              this.socket.emit('stats', {
                userid: localStorage.getItem('userid'),
                action: 'create a new room',
                message: res.body.roomid
              });
            }
            else {
              this.$message.error('enter new room failed');
              this.socket.emit('stats', {
                userid: localStorage.getItem('userid'),
                action: 'enter new room',
                message: 'failed'
              });
            }
          })
          .catch(err => {
            this.$message.error('enter new room failed');
            this.socket.emit('stats', {
              userid: localStorage.getItem('userid'),
              action: 'enter new room',
              message: 'failed'
            });
          });
      },
    }
  }
</script>

<style>
  .el-header, .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
  }

  .el-aside {
    background-color: #D3DCE6;
    color: #333;
    text-align: center;
    line-height: 200px;
  }

  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 160px;
  }

  body > .el-container {
    margin-bottom: 40px;
  }

  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }

  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
</style>
