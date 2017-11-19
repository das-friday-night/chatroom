<template>
  <el-container>
    <el-container>
      <el-aside width="200px">
        <el-form ref="form">
          <!--<el-form-item label="new room name: ">-->
            <!--<el-input v-model="new_room_name"></el-input>-->
          <!--</el-form-item>-->

          <el-form-item>
            <el-button type="primary" @click="onSubmit">Submit</el-button>
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

  export default {
    data () {
      return {
        my_rooms: [],
        all_rooms: [],
        new_room_name: '',
        status: ''
      }
    },

    mounted() {
      localStorage.removeItem('current_room');
      Vue.http.get('/v1/user/'+localStorage.getItem('userid'))
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
        this.$router.replace('/chat');
      },

      leave(roomid) {
        Vue.http.post('/v1/room', {action: 'leave', roomid: roomid, userid: localStorage.getItem('userid')})
          .then(res => {
            if(res.body.roomid){
              var index = this.all_rooms.indexOf(roomid);
              this.all_rooms.splice(index,1);
              if(res.body.roomid === 'room deleted'){
                index = this.my_rooms.indexOf(roomid);
                this.all_rooms.splice(index,1);
              }
              if(localStorage.getItem('current_room') === roomid){
                localStorage.removeItem('current_room');
              }
            }
            else {
              this.status = 'leave room failed';
            }
          })
      },

      join(roomid) {
        Vue.http.post('/v1/room', {action: 'enter', roomid: roomid, userid: localStorage.getItem('userid')})
          .then((res) => {
            if(res.body.roomid){
              this.my_rooms.push(res.body.roomid);
              localStorage.setItem('joined_rooms', this.my_rooms);
            }
            else {
              this.status = 'join new room failed';
            }
          })
      },

      onSubmit() {
        Vue.http.post('/v1/room', {action: 'enter', roomid: null, userid: localStorage.getItem('userid')})
          .then((res) => {
            if(res.body.roomid){
              this.my_rooms.push(res.body.roomid);
              this.all_rooms.push(res.body.roomid);
              localStorage.setItem('joined_rooms', this.my_rooms);
            }
            else {
              this.status = 'enter new room failed';
            }
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
