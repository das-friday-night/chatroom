<template>
  <el-row style="margin-top: 7%;">
    <el-col :span="8" :offset="7">
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="username">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="password">
          <el-input v-model="form.password"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">Login</el-button>
          <el-button>Cancel</el-button>
        </el-form-item>

        <div>{{status}}</div>
      </el-form>
    </el-col>
  </el-row>

</template>

<script>
  import Vue from 'vue'
  import socketio from 'socket.io-client'

  export default {
    data() {
      // var socket = socketio('http://localhost:8080');
      var socket = socketio();

      return {
        socket: socket,
        status: '',
        form: {
          username: '',
          password: '',
        }
      }
    },
    methods: {
      onSubmit() {
        Vue.http.post('/auth/login', {username: this.form.username, password: this.form.password})
          .then((res) => {
            if(res.body === 'login success'){
              this.status = 'login success';
              localStorage.setItem('userid', this.form.username);

              this.socket.emit('stats', {
                userid: this.form.username,
                action: 'login',
                message: ''
              });
              this.socket.close();

              this.$router.replace('/rooms');
            }
            else {
              this.status = res.body;
            }
          })
          .catch(err => {
            console.log(err);
            this.status = err.message;
          });

      }
    }
  }
</script>
