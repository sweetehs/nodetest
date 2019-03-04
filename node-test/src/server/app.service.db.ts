import * as fs from 'fs';
import { join } from 'path';
import { Injectable } from '@nestjs/common';

const dataspath = join(__dirname, '../', `gitdatas`);
const read = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(dataspath, 'utf8', (err, filelist) => {
      resolve(JSON.parse(filelist || '[]'));
    });
  });
};
const write = data => {
  return new Promise((resolve, reject) => {
    fs.writeFile(dataspath, JSON.stringify(data), () => {
      resolve();
    });
  });
};
@Injectable()
export class DbService {
  async getall(): Promise<any> {
    const list = await read();
    return list;
  }
  async create(data) {
    const list = await read();
    //@ts-ignore
    list.push(data);
    await write(list);
  }
  async delete(id: string) {
    const list = await read();
    //@ts-ignore
    await write(list.filter(d => d.id !== id));
  }
}
