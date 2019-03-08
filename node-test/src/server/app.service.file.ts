import * as git from 'simple-git';
import * as shelljs from 'shelljs';
import { gitroot, projectroot, dataspath } from './config';
import { read, write, exec, getRoot, isExists } from './util';

const getProPath = data => {
  return `${gitroot}/${data.dirname}`;
};
export class FileService {
  async gitpull(data) {
    // const root = getRoot(data);st
    // const gitpath = `${gitroot}/${data.dirname}`;
    // shelljs.mkdir(gitpath);
    await new Promise((r, j) => {
      git(gitroot).clone(data.remote, [], () => {
        r();
      });
    });
    // await exec(`cd ${root}/${data.dirname} && npm install`);
  }
  async gitbranch(data) {
    return await new Promise((resolve, reject) => {
      const root = getProPath(data);
      git(`${root}`)
        // .fetch(['--prune'])
        .branch(['-a'], (err, branches) => {
          if (err) {
            reject(err);
          } else {
            resolve(branches);
          }
        });
    });
  }
  async filedelete(data) {
    const fielpath = `${gitroot}/${data.dirname}_${data.id}`;
    shelljs.rm('-rf', fielpath);
  }
  async readconfig(data) {
    // const root = getRoot(data);
    const root = getProPath(data);
    const fielpath = `${root}/nodetest.json`;
    return read(fielpath);
  }
  async updateConfig(data) {
    const root = getProPath(data);
    const fielpath = `${root}/nodetest.json`;
    await write(fielpath, data.config);
  }
  async isaccord(data) {
    const root = getProPath(data);
    return isExists(`${root}/nodetest.json`);
  }
  async checkout(branch, data) {
    const gitpath = getProPath(data);
    // 切换分支之前要保存修改的proxy内容
    return new Promise((r, j) => {
      git(gitpath)
        .reset('--hard')
        .stash()
        .checkout(`${branch}`, () => {
          r();
        });
    });
  }
  async createProjet(data) {
    const gitpath = getProPath(data);
    const propath = `${projectroot}/${data.dirname}_${data.id}`;
    // 如果有 则需要先删除目标目录
    await exec(`rm -rf ${propath}`);
    // 生成目标文件夹
    await exec(`mkdir ${propath}`);
    // 修改打包config
    await this.updateConfig(data);
    // 打包项目文件
    await exec(`cd ${gitpath} && npm install && npm run build`);
    // 移动到项目录
    await exec(`cd ${gitpath}/dist && cp -rf * ${propath}`);
  }
}
