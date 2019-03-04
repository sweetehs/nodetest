<style lang="less">
.dialog-form {
}
</style>

<template>
  <div class="list-wrapper">
    <div class="action">
      <el-button type="primary" @click="dialogAdd = true">添加git</el-button>
    </div>
    <el-table :data="list">
      <el-table-column width="100px" label="id" prop="id"></el-table-column>
      <el-table-column width="200px" label="服务名称" prop="name"></el-table-column>
      <el-table-column label="git-remote" prop="remote"></el-table-column>
      <el-table-column width="200px" label="操作">
        <div slot-scope="scope">
          <el-button type="primary" size="mini">修改</el-button>
          <el-button type="danger" size="mini" @click="deleteItem(scope.row)">删除</el-button>
        </div>
      </el-table-column>
    </el-table>
    <el-dialog width="600px" :visible.sync="dialogAdd">
      <el-form label-width="100px">
        <el-form-item label="项目名称">
          <el-input v-model="currentData.name"></el-input>
        </el-form-item>
        <el-form-item label="git-remote">
          <el-input v-model="currentData.remote"></el-input>
        </el-form-item>
        <div class="fn-center">
          <el-button type="primary" @click="add">提交</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  data() {
    return {
      list: [],
      dialogAdd: false,
      currentData: {
        name: '测试',
        remote: 'git@code.byted.org:zhaoweinan.vernon/bussiness_operate.git',
      },
    };
  },
  created() {
    this.ajaxGetList();
  },
  methods: {
    ajaxGetList() {
      axios({
        url: 'alllist',
      }).then(ajaxData => {
        this.list = ajaxData.data.data.list;
      });
    },
    add() {
      axios({
        url: '/pull',
        method: 'post',
        data: this.currentData,
      });
    },
    deleteItem(data) {
      axios({
        url: '/delete',
        method: 'post',
        data: {
          id: data.id,
          dirname: data.dirname,
        },
      }).then(ajaxData => {
        this.ajaxGetList();
      });
    },
  },
};
</script>
