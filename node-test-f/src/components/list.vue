<style lang="less">
.list-wrapper {
}
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
  .small {
    width: 200px;
    margin-right: 5px;
  }
  .rules {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
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
  <div class="list-wrapper"
    v-loading="loading">
    <div class="action">
      <el-button type="primary"
        @click="shaHandleDialog('create')">添加git</el-button>
      <a href="javascript:;"
        @click="dialogRule = true">查看规则</a>
    </div>
    <el-table :data="list">
      <el-table-column width="150px"
        label="id"
        prop="id"></el-table-column>
      <el-table-column width="150px"
        label="项目名称">
        <div slot-scope="scope">
          <a target="_blank"
            :href="scope.row.url">{{scope.row.name}}</a>
        </div>
      </el-table-column>
      <el-table-column label="git">
        <div slot-scope="scope">
          <p>仓库地址：{{scope.row.remote}}</p>
          <p>当前"仓库"分支：{{scope.row.branch.potcurrent}}</p>
          <p>当前"发布"分支：{{scope.row.branch.pubcurrent}}</p>
        </div>
      </el-table-column>
      <el-table-column width="300px"
        label="操作">
        <div slot-scope="scope">
          <div v-loading="scope.row.loading">
            <el-button v-if="scope.row.flag"
              size="mini"
              type="primary"
              @click="publish(scope.row)">发布</el-button>
            <el-button size="mini"
              type="primary"
              @click="showBranchDialog(scope.row)">切换分支</el-button>
            <el-button v-if="scope.row.flag"
              type="primary"
              size="mini"
              @click="shaHandleDialog('update', scope.row)">修改</el-button>
            <el-button v-if="scope.row.flag"
              type="danger"
              size="mini"
              @click="deleteItem(scope.row)">删除</el-button>
            <span v-if="!scope.row.flag"
              class="fn-ml10">该分支不符合项目请点击右上角查看规则</span>
          </div>
        </div>
      </el-table-column>
    </el-table>
    <el-dialog v-loading="loading"
      class="dialog-form"
      width="800px"
      :visible.sync="dialogHandle">
      <el-form label-width="150px">
        <el-form-item label="项目名称">
          <el-input v-model="currentData.name"></el-input>
        </el-form-item>
        <el-form-item label="git-remote">
          <el-select :disabled="isUpdate"
            v-model="currentData.remote">
            <el-option value="git@code.byted.org:zhaoweinan.vernon/bussiness_operate.git"
              label="运营管理系统"></el-option>
            <el-option value="git@code.byted.org:motor-fe/dealer.git"
              label="卖车通"></el-option>
            <el-option value="ssh://zhaoweinan.vernon@git.byted.org:29418/motor/fe/re_dealer_mobile"
              label="移动卖车通"></el-option>
            <!-- <el-option value="git@ffff/fdsfds.git"
              label="测试"></el-option> -->
          </el-select>
        </el-form-item>
        <el-form-item label="路径替换"
          v-if="isUpdate">
          <el-input class="small"
            v-model="currentData.config.replaceurlbefore" />替换为
          <el-input class="small"
            v-model="currentData.config.replaceurlafter" />
        </el-form-item>
        <el-form-item label="proxy"
          v-if="isUpdate">
          <div class="rules"
            v-for="(item, i) in currentData.proxy"
            :key="i">
            <el-input class="small"
              v-model="item.rule"></el-input>
            <el-input class="middle"
              v-model="item.url"></el-input>
            <span v-if="i === 0"
              class="icon el-icon-circle-plus"
              @click="addRule()"></span>
            <span class="icon el-icon-remove"
              @click="deleteRule(i)"
              v-if="currentData.proxy.length > 1"></span>
          </div>
        </el-form-item>
        <div class="fn-center">
          <el-button type="primary"
            @click="handleUpdate">提交</el-button>
        </div>
      </el-form>
    </el-dialog>
    <el-dialog title="切换分支"
      :visible.sync="dialogBranch">
      <el-radio-group v-model="currentBranches.current">
        <div class="fn-mb10"
          v-for="item in currentBranches.all"
          :key="item">
          <el-radio :label="item"
            :key="item">{{item}}</el-radio>
        </div>
      </el-radio-group>
      <div class="action fn-center">
        <el-button type="primary"
          size="small"
          @click="sureCheckBranch">切换并发布</el-button>
      </div>
    </el-dialog>
    <el-dialog class="dialog-rule"
      title="规则"
      :visible.sync="dialogRule">
      <div>提取配置参数文件，在根部录下简历文件名为nodetest.json</div>
      <div>
        <img width="600"
          src="@/assets/images/rule.png">
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
        // assetsPublicPath: '',
        port: '',
        proxy: {},
        remote: '',
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
      debugger;
      this.dialogHandle = true;
      this.currentType = type;
      if (type === 'update') {
        this.currentData = data;
        // 获取分支
        const { config } = data;
        // this.currentData.port = config.port;
        // this.currentData.assetsPublicPath = config.assetsPublicPath;
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
      }
    },
    ajaxGetList() {
      axios({
        url: '/node_self/alllist',
      }).then(ajaxData => {
        this.list = ajaxData.data.data.list.map(data => {
          data.pm2text = data.pm2status ? '正在运行' : '已停止';
          if (data.flag) {
            data.url = `${data.config.buildAssetsPublicPath}index.html`;
          } else {
            data.url = '项目不符合要求';
          }
          return data;
        });
      });
    },
    handleUpdate() {
      if (!this.isUpdate) {
        if (!this.currentData.remote) {
          return;
        }
        this.loading = true;
        axios({
          url: '/node_self/pull',
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
        const { name, proxy, port, id, replaceurlbefore, replaceurlafter } = this.currentData;
        const config = Object.assign(this.currentData.config, {
          port,
          proxy: proxy.reduce((r, d) => {
            r[d.rule] = {};
            r[d.rule].target = d.url;
            r[d.rule].changeOrigin = true;
            return r;
          }, {}),
        });
        axios({
          url: '/node_self/update',
          method: 'post',
          data: {
            id,
            name,
            config,
          },
        }).then(ajaxData => {
          if (ajaxData.data.type === 'success') {
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
          } else {
            this.$message.error(ajaxData.data.msg);
          }
        });
      }
    },
    deleteItem(data) {
      this.loading = true;
      axios({
        url: '/node_self/delete',
        method: 'post',
        data: {
          id: data.id,
          dirname: data.dirname,
        },
      })
        .then(() => {
          this.ajaxGetList();
        })
        .finally(() => {
          this.loading = false;
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
    publish(data) {
      this.loading = true;
      axios({
        url: '/node_self/publish',
        method: 'post',
        data: {
          id: data.id,
        },
      })
        .then(() => {
          this.$message.success('操作成功');
          this.ajaxGetList();
        })
        .finally(() => {
          this.loading = false;
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
        url: '/node_self/branch',
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
        url: '/node_self/checkoutpub',
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
