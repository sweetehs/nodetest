import * as git from 'simple-git';
import * as shelljs from 'shelljs';
import { gitroot, dataspath } from './config';
import { read, write, exec, getRoot, isExists } from './util';

export class FileService {
  async gitpull(data) {
    const root = getRoot(data);
    shelljs.mkdir(root);
    await git(root).clone(data.remote);
    shelljs.cd(`${root}/${data.dirname}`);
    await exec('npm install');
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
    shelljs.cd(fielpath);
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
    git(gitpath)
      .reset('--hard')
      .stash()
      .checkout(`${branch}`);
  }
}
