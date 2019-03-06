import { exec, getRoot } from './util';
import * as shelljs from 'shelljs';
export class Pm2Service {
  async getStatus(data) {
    const name = `${data.dirname}_${data.id}`;
    return exec(`pm2 status ${name}`).then(d => {
      return d.toString().indexOf('online') !== -1;
    });
  }
  async has(data) {
    const name = `${data.dirname}_${data.id}`;
    return exec(`pm2 status ${name}`).then(d => {
      return d.toString().indexOf(name) !== -1;
    });
  }
  async start(data) {
    const root = getRoot(data);
    const has = await this.has(data);
    if (has) {
      await exec(`pm2 restart ${data.dirname}_${data.id}`);
    } else {
      shelljs.cd(`${root}/${data.dirname}`);
      await exec(`pm2 start npm --name=${data.dirname}_${data.id} -- run dev`);
    }
  }
  async stop(data) {
    const root = getRoot(data);
    shelljs.cd(`${root}/${data.dirname}`);
    await exec(`pm2 stop ${data.dirname}_${data.id}`);
  }
  async delete(data) {
    const root = getRoot(data);
    shelljs.cd(`${root}/${data.dirname}`);
    await exec(`pm2 delete ${data.dirname}_${data.id}`);
  }
}
