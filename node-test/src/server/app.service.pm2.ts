import * as pm2 from 'pm2';
import { exec, getRoot } from './util';
import * as shelljs from 'shelljs';

const getPm2Status = name => {
  return new Promise((r, j) => {
    pm2.connect(() => {
      pm2.describe(name, (err, des) => {
        r(des.find(d => d.name === name));
      });
    });
  });
};
export class Pm2Service {
  async getStatus(data) {
    const name = `${data.dirname}_${data.id}`;
    const desc = await getPm2Status(name);
    if (desc) {
      // @ts-ignore
      return desc.pm2_env.status === 'stopped' ? false : true;
    }
    return false;
  }
  async has(data) {
    const name = `${data.dirname}_${data.id}`;
    const desc = await getPm2Status(name);
    return desc ? true : false;
  }
  async start(data) {
    const root = getRoot(data);
    const has = await this.has(data);
    if (has) {
      await exec(`pm2 restart ${data.dirname}_${data.id}`);
    } else {
      await exec(
        `cd ${root}/${data.dirname} && pm2 start npm --name=${data.dirname}_${
          data.id
        } -- run dev`,
      );
    }
  }
  async stop(data) {
    const root = getRoot(data);
    await exec(
      `cd ${root}/${data.dirname} && pm2 stop ${data.dirname}_${data.id}`,
    );
  }
  async delete(data) {
    const root = getRoot(data);
    await exec(
      `cd ${root}/${data.dirname} && pm2 delete ${data.dirname}_${data.id}`,
    );
  }
}
