import { join } from 'path';

const shelljs = require('shelljs');
const git = require('simple-git');

const gitroot = join(__dirname, '../', `git`);

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
}
