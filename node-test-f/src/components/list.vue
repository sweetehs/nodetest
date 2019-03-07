<style lang="less">
.action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  a {
    color: #409eff;
    font-weight: bold;
  }
}
.dialog-rule {
  font-size: 16px;
  font-weight: bold;
  div {
    margin-bottom: 10px;
  }
  img {
    display: block;
    margin: 0 auto;
  }
}
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
      <a href="javascript:;" @click="dialogRule = true">查看规则</a>
    </div>
    <el-table :data="list">
      <el-table-column width="100px" label="id" prop="id"></el-table-column>
      <el-table-column width="100px" label="服务名称" prop="name"></el-table-column>
      <el-table-column label="urls">
        <div slot-scope="scope">
          <p>git-remote：{{scope.row.remote}}</p>
          <p>
            url：
            <a target="_blank" :href="scope.row.url">{{scope.row.url}}</a>
          </p>
        </div>
      </el-table-column>
      <el-table-column width="100px" label="状态" prop="pm2text"></el-table-column>
      <el-table-column width="400px" label="操作">
        <div slot-scope="scope">
          <div v-loading="scope.row.loading">
            <el-switch
              v-if="scope.row.flag"
              class="fn-mr10"
              active-color="#13ce66"
              inactive-color="#F56C6C"
              :value="!scope.row.pm2status"
              @change="pm2Handle(scope.row)"
            ></el-switch>
            <el-button
              :disabled="scope.row.pm2status"
              size="mini"
              type="primary"
              @click="showBranchDialog(scope.row)"
            >切换分支</el-button>
            <el-button
              v-if="scope.row.flag"
              :disabled="scope.row.pm2status"
              type="primary"
              size="mini"
              @click="shaHandleDialog('update', scope.row)"
            >修改</el-button>
            <el-button
              v-if="scope.row.flag"
              type="danger"
              size="mini"
              :disabled="scope.row.pm2status"
              @click="deleteItem(scope.row)"
            >删除</el-button>
            <span v-if="!scope.row.flag" class="fn-ml10">该分支不符合项目请点击右上角查看规则</span>
          </div>
        </div>
      </el-table-column>
    </el-table>
    <el-dialog v-loading="loading" class="dialog-form" width="800px" :visible.sync="dialogHandle">
      <el-form label-width="150px">
        <el-form-item label="项目名称">
          <el-input v-model="currentData.name"></el-input>
        </el-form-item>
        <el-form-item label="git-remote">
          <el-input :disabled="true" v-model="currentData.remote"></el-input>
        </el-form-item>
        <el-form-item label="端口" v-if="isUpdate">
          <el-input v-model="currentData.port"></el-input>
        </el-form-item>
        <!-- <el-form-item label="assetsPublicPath" v-if="isUpdate">
          <el-input v-model="currentData.assetsPublicPath"></el-input>
        </el-form-item>-->
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
    <el-dialog title="切换分支" :visible.sync="dialogBranch">
      <el-radio-group v-model="currentBranches.current">
        <div class="fn-mb10" v-for="item in currentBranches.all" :key="item">
          <el-radio :label="item" :key="item">{{item}}</el-radio>
        </div>
      </el-radio-group>
      <div class="action fn-center">
        <el-button type="primary" size="small" @click="sureCheckBranch">切换</el-button>
      </div>
    </el-dialog>
    <el-dialog class="dialog-rule" title="规则" :visible.sync="dialogRule">
      <div>提取配置参数文件，在根部录下简历文件名为nodetest.json</div>
      <div>
        <img width="400" src="@/assets/images/rule.png">
      </div>
    </el-dialog>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  data() {
    return {
      list: [],
      loading: false,
      dialogBranch: false,
      dialogHandle: false,
      dialogRule: false,
      currentType: 'create',
      currentBranches: {
        list: [],
        current: '',
      },
      currentData: {
        name: '测试',
        currentBranch: '',
        assetsPublicPath: '',
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
          url: '/devconfig',
          params: {
            id: data.id,
          },
        }).then(ajaxData => {
          const { config } = ajaxData.data.data;
          this.currentData.port = config.port;
          this.currentData.assetsPublicPath = config.assetsPublicPath;
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
        url: '/alllist',
      }).then(ajaxData => {
        this.list = ajaxData.data.data.list.map(data => {
          data.pm2text = data.pm2status ? '正在运行' : '已停止';
          if (data.flag) {
            data.url = `http://localhost:${data.config.port}${data.config.assetsPublicPath}`;
          } else {
            data.url = '项目不符合要求';
          }
          return data;
        });
      });
    },
    handleUpdate() {
      if (!this.isUpdate) {
        this.loading = true;
        axios({
          url: '/pull',
          method: 'post',
          data: this.currentData,
        })
          .then(() => {
            this.dialogHandle = false;
            this.ajaxGetList();
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        const { name, proxy, port, id } = this.currentData;
        const config = {
          assetsPublicPath: this.currentData.assetsPublicPath,
          port,
          proxy: proxy.reduce((r, d) => {
            r[d.rule] = {};
            r[d.rule].target = d.url;
            r[d.rule].changeOrigin = true;
            return r;
          }, {}),
        };
        // debugger;
        axios({
          url: '/update',
          method: 'post',
          data: {
            id,
            name,
            config,
          },
        }).then(() => {
          this.dialogHandle = false;
          this.ajaxGetList();
        });
      }
    },
    deleteItem(data) {
      data.loading = true;
      axios({
        url: '/delete',
        method: 'post',
        data: {
          id: data.id,
          dirname: data.dirname,
        },
      })
        .then(ajaxData => {
          this.ajaxGetList();
        })
        .finally(() => {
          data.loading = false;
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
    pm2Handle(data) {
      let url = '';
      if (data.pm2status) {
        url = '/pm2stop';
      } else {
        url = '/pm2start';
      }
      axios({
        url: url,
        method: 'post',
        data: {
          id: data.id,
        },
      }).then(() => {
        this.$message.success('操作成功');
        this.ajaxGetList();
      });
    },
    showBranchDialog(data) {
      this.currentData = data;
      this.currentBranches = {
        all: [],
        current: '',
      };
      this.dialogBranch = true;
      axios({
        url: '/branch',
        params: {
          id: data.id,
        },
      }).then(ajaxData => {
        const { all, current } = ajaxData.data.data.branchInfo;
        this.currentBranches.all = all;
        this.currentBranches.current = current;
      });
    },
    sureCheckBranch() {
      axios({
        url: '/checkoutbranch',
        method: 'post',
        data: {
          id: this.currentData.id,
          branch: this.currentBranches.current,
        },
      }).then(ajaxData => {
        this.$message.success('切换成功');
        this.dialogBranch = false;
        this.ajaxGetList();
      });
    },
  },
};
</script>
