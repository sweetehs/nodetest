<style lang="less">
.dialog-form {
  .rules {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    .small {
      width: 200px;
      margin-right: 5px;
    }
    .icon {
      margin-left: 10px;
      font-size: 24px;
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>

<template>
  <div class="list-wrapper">
    <div class="action">
      <el-button type="primary" @click="shaHandleDialog('create')">添加git</el-button>
    </div>
    <el-table :data="list">
      <el-table-column width="100px" label="id" prop="id"></el-table-column>
      <el-table-column width="200px" label="服务名称" prop="name"></el-table-column>
      <el-table-column label="git-remote" prop="remote"></el-table-column>
      <el-table-column width="200px" label="操作">
        <div slot-scope="scope">
          <el-button type="primary" size="mini" @click="shaHandleDialog('update', scope.row)">修改</el-button>
          <el-button type="danger" size="mini" @click="deleteItem(scope.row)">删除</el-button>
        </div>
      </el-table-column>
    </el-table>
    <el-dialog class="dialog-form" width="800px" :visible.sync="dialogHandle">
      <el-form label-width="100px">
        <el-form-item label="项目名称">
          <el-input v-model="currentData.name"></el-input>
        </el-form-item>
        <el-form-item label="git-remote">
          <el-input :disabled="isUpdate" v-model="currentData.remote"></el-input>
        </el-form-item>
        <el-form-item label="branches" v-if="isUpdate">
          <el-select v-model="currentData.currentBranch">
            <el-option v-for="item in currentBranches" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="端口" v-if="isUpdate">
          <el-input v-model="currentData.port"></el-input>
        </el-form-item>
        <el-form-item label="proxy" v-if="isUpdate">
          <div class="rules" v-for="(item, i) in currentData.proxy" :key="i">
            <el-input class="small" v-model="item.rule"></el-input>
            <el-input class="middle" v-model="item.url"></el-input>
            <span v-if="i === 0" class="icon el-icon-circle-plus" @click="addRule()"></span>
            <span
              class="icon el-icon-remove"
              @click="deleteRule(i)"
              v-if="currentData.proxy.length > 1"
            ></span>
          </div>
        </el-form-item>
        <div class="fn-center">
          <el-button type="primary" @click="handleUpdate">提交</el-button>
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
      dialogHandle: false,
      currentType: 'create',
      currentBranches: [],
      currentData: {
        name: '测试',
        currentBranch: '',
        port: '',
        proxy: {},
        remote: 'git@code.byted.org:zhaoweinan.vernon/bussiness_operate.git',
      },
    };
  },
  created() {
    this.ajaxGetList();
  },
  computed: {
    isUpdate() {
      return this.currentType === 'update';
    },
  },
  methods: {
    shaHandleDialog(type, data) {
      this.dialogHandle = true;
      this.currentType = type;
      if (type === 'update') {
        this.currentData = data;
        // 获取分支
        axios({
          url: '/branches',
          params: {
            id: data.id,
          },
        }).then(ajaxData => {
          const { all, current } = ajaxData.data.data.branchInfo;
          const { config } = ajaxData.data.data;
          this.currentBranches = all;
          this.currentData.currentBranch = current;
          this.currentData.port = config.port;
          // 处理proxy
          this.currentData.proxy = [];
          for (var i in config.proxy) {
            const _data = config.proxy[i];
            if (_data) {
              this.currentData.proxy.push({
                rule: i,
                url: _data.target,
              });
            }
          }
        });
      }
    },
    ajaxGetList() {
      axios({
        url: 'alllist',
      }).then(ajaxData => {
        this.list = ajaxData.data.data.list;
      });
    },
    handleUpdate() {
      if (!this.isUpdate) {
        axios({
          url: '/pull',
          method: 'post',
          data: this.currentData,
        }).then(() => {
          this.dialogHandle = false;
          this.ajaxGetList();
        });
      } else {
        axios({
          url: '/update',
          method: 'post',
          data: this.currentData,
        }).then(() => {
          this.dialogHandle = false;
          this.ajaxGetList();
        });
      }
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
    addRule() {
      this.currentData.proxy.push({
        rule: '',
        url: '',
      });
    },
    deleteRule(index) {
      this.currentData.proxy.splice(index, 1);
    },
  },
};
</script>
