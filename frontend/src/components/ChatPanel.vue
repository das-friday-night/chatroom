<template>
  <div>
    <el-row>
      <el-col :span="22">
        <h4 style="text-align: left;">
          <i class="el-icon-star-on"></i> {{current_room}} <i class="el-icon-star-on"></i>
        </h4>
      </el-col>

      <el-col :span="2">
        <el-button type="success" @click="goRooms" round>Go Back</el-button>
      </el-col>
    </el-row>


    <el-table :data="msgs" style="width: 100%" :row-class-name="tableRowClassName">
      <el-table-column prop="u" width="180"></el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          <img v-if="isImage(scope.row.m)" :src="scope.row.m" class="chat-img"/>
          <div v-else>{{scope.row.m}}</div>
        </template>
      </el-table-column>
    </el-table>

    <el-row :gutter="20">
      <form ref="form" id="fix-form" v-on:submit.prevent="send(temp_msg)">
        <el-col :span="20">
          <el-input v-model="temp_msg"></el-input>
        </el-col>
        <el-col :span="2">
          <el-button @click="send(temp_msg)" round>Send</el-button>
        </el-col>
        <el-col :span="2">
          <el-button @click="dialog_visible = true" round><i class="el-icon-picture-outline"></i></el-button>
        </el-col>
      </form>
    </el-row>

    <!--upload image-->
    <el-dialog
      :visible.sync="dialog_visible"
      width="35%">
      <el-upload
        drag
        class="upload-demo"
        ref="upload"
        action="/v1/image"
        accept="image/jpeg"
        list-type="picture"
        name="uploadimg"
        :limit="max_file_amount"
        :file-list="file_list"
        :on-remove="handleRemove"
        :on-exceed="handleExceed"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-change="handleChange"
        :before-upload="beforeUpload"
        :auto-upload="false"
        :with-credentials="true">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Drop image here or <em>click to upload</em></div>
        <div class="el-upload__tip" slot="tip">jpg files with a size less than 2MB</div>
      </el-upload>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialog_visible = false">Cancel</el-button>
        <el-button type="primary" @click="upload">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import socketio from 'socket.io-client'
  import Vue from 'vue'
  import uuid from 'uuid/v4'

  export default {
    data() {
     // var socket = socketio('http://localhost:8080', {
     //   query: {u: localStorage.getItem('userid'), r: localStorage.getItem('current_room')}
     // });

      var socket = socketio({
        query: {u: localStorage.getItem('userid'), r: localStorage.getItem('current_room')}
      });

      return {
        socket: socket,
        current_room: localStorage.getItem('current_room'),
        msgs: [],
        temp_msg: '',
        dialog_visible: false,
        file_list: [],
        max_file_amount: 1,
        url: 'https://chat-room-image.s3.us-west-1.amazonaws.com'
      };
    },
    created() {
      this.socket.on('chat', (msg)=> {
        this.msgs.push(msg);
      });

      if(!localStorage.getItem('logs')){
        localStorage.setItem('logs', {});
      }

      if(localStorage.getItem('logs')[this.current_room]){
        this.msgs = localStorage.getItem('logs')[this.current_room]
      }
      else {
        Vue.http.get('v1/logs/' + this.current_room)
          .then(res => {
            this.msgs = res.data.logs;
          })
          .catch(err => {
            this.$message.error('failed to load chat history');
            console.log(err);
          })
      }
    },
    methods: {
      isImage(msg){
        return msg.indexOf(this.url) !== -1;
      },

      send(temp_msg) {
        this.socket.emit('chat', temp_msg);
        this.temp_msg = '';
      },

      tableRowClassName({row, rowIndex}) {
        if(row.who === localStorage.getItem('userid')){
          return 'your-word';
        }
        return '';
      },

      goRooms() {
        this.socket.close();
        this.$router.replace('/rooms');
      },

      handleRemove(file, file_list) {
        console.log(file);
      },

      handleExceed() {
        this.$message.warning(`Only upload file ${this.maxFileAmount} at a time`);
      },

      handleSuccess(response) {
        this.$message.success('Upload success');
        this.socket.emit('chat', response.url);
      },

      handleError(err, file, fileList){
        console.log(err);
      },

      handleChange(file, fileList) {
        const isJPG = file.raw.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('picture must be JPG format!');
        }
        if (!isLt2M) {
          this.$message.error('picture size can not exceed 2MB!');
        }

        if(!isJPG || !isLt2M){
          fileList = [];
        }
      },

      beforeUpload(file){
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('picture must be JPG format!');
        }
        if (!isLt2M) {
          this.$message.error('picture size can not exceed 2MB!');
        }
        return isJPG && isLt2M;
      },

      upload(){
        this.dialog_visible = false;
        this.$refs.upload.submit();
      }
    }
  }
</script>

<style scoped>
  .el-table .your-word {
    background: #a0f9a0;
  }

  form { background: #000; padding: 3px; position: fixed; bottom: 0; width: 100%; height: 10vh}
  /*form input { border: 0; padding: 10px; width: 90%; margin-right: .5%; }*/
  /*form button { width: 9%; background: rgb(130, 224, 255); border: none; padding: 10px; }*/

  .chat-img {
    width: 250px;
  }
</style>
