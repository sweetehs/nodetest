import * as fs from 'fs';
import { Controller, Get, Post, Render, Body, Query } from '@nestjs/common';
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

  @Get('/alllist')
  async getAll() {
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
    // 删除数据
    await this.dbService.delete(body.id);
    // 删除文件
    await this.fileService.filedelete(body);
    return {
      type: 'success',
    };
  }

  @Get('/branches')
  async getBranches(@Query() query) {
    const data = await this.dbService.getDataById(query.id);
    const branchInfo = await this.fileService.gitbranch(data);
    const config = await this.fileService.readconfig(data);
    return {
      type: 'success',
      data: {
        config,
        branchInfo,
      },
    };
  }

  @Post('/update')
  async updateData(@Body() body) {
    // 写到数据里
    // proxy 修改
    body.proxy = body.proxy.reduce((r, d) => {
      r[d.rule] = {};
      r[d.rule].target = d.url;
      r[d.rule].changeOrigin = true;
      return r;
    }, {});
    await this.fileService.updateConfig(body);
    return {
      type: 'success',
    };
  }
}
