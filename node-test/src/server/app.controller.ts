import * as fs from 'fs';
import { Controller, Get, Post, Render, Body } from '@nestjs/common';
import { DbService } from './app.service.db';
import { FileService } from './app.service.file';

@Controller()
export class AppController {
  constructor(
    private readonly dbService: DbService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }

  @Post('/pull')
  async pullGit(@Body() createGit) {
    // 文件夹名称
    const data = Object.assign(
      {
        id: '',
        dirname: '',
        name: '',
        remote: '',
      },
      createGit,
    );
    data.id = Math.floor(Math.random() * 100000).toString();
    data.dirname = data.remote.match(/\/(.*?).git/)[1];
    // 读写数据文件
    await this.fileService.gitpull(data);
    await this.dbService.create(data);
    return { type: 'success' };
  }

  @Get('/branch')
  branchGit() {
    return {};
  }

  @Get('/alllist')
  async getall() {
    const list = await this.dbService.getall();
    return {
      type: 'success',
      data: {
        list,
      },
    };
  }
  @Post('/delete')
  async deleteItem(@Body() body) {
    await this.dbService.delete(body.id);
    return {
      type: 'success',
    };
  }
}
