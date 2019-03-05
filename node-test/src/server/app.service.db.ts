import { Injectable } from '@nestjs/common';
import { gitroot, dataspath } from './config';
import { read, write } from './util';

@Injectable()
export class DbService {
  async getall(): Promise<any> {
    return await read(dataspath);
  }
  async create(data) {
    const list = await read(dataspath);
    // @ts-ignore
    list.push(data);
    await write(dataspath, list);
  }
  async delete(id: string) {
    const list = await read(dataspath);
    // @ts-ignore
    await write(dataspath, list.filter(d => d.id !== id));
  }
  async getDataById(id) {
    const list = await read(dataspath);
    // @ts-ignore
    return list.find(d => d.id === id);
  }
}
