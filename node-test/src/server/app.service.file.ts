import * as git from 'simple-git';
import * as shelljs from 'shelljs';
import { gitroot, projectroot, dataspath } from './config';
import { read, write, exec, getRoot, isExists } from './util';

export class FileService {
  async gitpull(data) {
    const root = getRoot(data);
    shelljs.mkdir(root);
    await new Promise((r, j) => {
      git(root).clone(data.remote, [], () => {
        r();
      });
    });
    await exec(`cd ${root}/${data.dirname} && npm install`);
  }
  async gitbranch(data) {
    return await new Promise((resolve, reject) => {
      git(`${gitroot}/${data.dirname}_${data.id}/${data.dirname}`)
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
    const root = getRoot(data);
    const fielpath = `${root}/${data.dirname}/nodetest.json`;
    return read(fielpath);
  }
  async updateConfig(data) {
    const path = `${getRoot(data)}/${data.dirname}/nodetest.json`;
    await write(path, {
      ...data.config,
    });
  }
  async isaccord(data) {
    const path = `${getRoot(data)}/${data.dirname}/nodetest.json`;
    return isExists(path);
  }
  async checkout(branch, data) {
    const gitpath = `${getRoot(data)}/${data.dirname}`;
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
    const gitpath = `${getRoot(data)}/${data.dirname}`;
    // 如果有 则需要先删除目标目录
    await exec(`rm -rf ${projectroot}/${data.dirname}_${data.id}`);
    // 生成目标文件夹
    await exec(`cd ${projectroot} && mkdir ${data.dirname}_${data.id}`);
    // 打包项目文件
    await exec(`cd ${gitpath} && npm run build`);
    // 移动到项目录
    await exec(
      `cd ${gitpath}/dist && cp -rf * ${projectroot}/${data.dirname}_${
        data.id
      }`,
    );
  }
}
