import * as git from 'simple-git';
import * as shelljs from 'shelljs';
import { gitroot, dataspath } from './config';
import { read, write } from './util';
function exec(command) {
  return new Promise((resolve, reject) =>
    shelljs.exec(command, {}, (code, value, error) => {
      if (error) {
        return reject(error);
      }
      resolve(value);
    }),
  );
}
export class FileService {
  async gitpull(data) {
    const { remote, dirname, id } = data;
    await git(gitroot).clone(remote);
    await exec(`mv ${gitroot}/${dirname} ${gitroot}/${dirname}_${id}`);
    shelljs.cd(`${gitroot}/${dirname}_${id}`);
    await exec('npm install');
  }
  async gitbranch(data) {
    return await new Promise((resolve, reject) => {
      git(`${gitroot}/${data.dirname}_${data.id}`)
        .fetch(['--prune'])
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
    const fielpath = `${gitroot}/${data.dirname}_${data.id}/nodetest.json`;
    return read(fielpath);
  }
  async updateConfig(data) {
    const fielpath = `${gitroot}/${data.dirname}_${data.id}/nodetest.json`;
    // 修改config文件
    // 切换分支
    await git(`${gitroot}/${data.dirname}_${data.id}`)
      // .reset(['--hard'])
      .checkout('-f', data.currentBranch);
    // .reset(['--hard']);
    // 写文件
    await write(fielpath, {
      port: data.port,
      proxy: data.proxy,
    });
    // 启动服务
    await exec(`pm2 start npm --name=${data.dirname}_${data.id} -- run dev`);
  }
}
