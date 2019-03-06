import { Injectable } from '@nestjs/common';
import { gitroot, dataspath } from './config';
import { read, write } from './util';

@Injectable()
export class DbService {
  async getall(): Promise<any> {
    return read(dataspath);
  }
  async create(data) {
    const list = await read(dataspath);
    // @ts-ignore
    list.push(data);
    return write(dataspath, list);
  }
  async delete(id: string) {
    const list = await read(dataspath);
    // @ts-ignore
    return write(dataspath, list.filter(d => d.id !== id));
  }
  async getDataById(id: number) {
    const list = await read(dataspath);
    // @ts-ignore
    return list.find(d => d.id === id);
  }
  async update(data) {
    const list = await read(dataspath);
    let td = {};
    // @ts-ignore
    list.forEach(d => {
      if (d.id === data.id) {
        Object.assign(d, data);
        td = d;
      }
    });
    await write(dataspath, list);
    return td;
  }
}
