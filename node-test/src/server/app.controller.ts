import * as fs from 'fs';
import { Controller, Get, Post, Render, Body, Query } from '@nestjs/common';
import { DbService } from './app.service.db';
import { FileService } from './app.service.file';
import { Pm2Service } from './app.service.pm2';

@Controller()
export class AppController {
  constructor(
    private readonly dbService: DbService,
    private readonly fileService: FileService,
    private readonly pm2Service: Pm2Service,
  ) {}

  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }

  @Get('/checklength')
  async checkLength() {
    const list = await this.dbService.getall();
    let flag = true;
    let error = '';
    if (list.length >= 10) {
      flag = false;
      error = '最多只能建立10个服务';
    }
    if (flag) {
      return {
        type: 'sueccess',
      };
    } else {
      return {
        type: 'error',
        msg: error,
      };
    }
  }

  @Get('/checkport')
  async checkPort(@Query() query) {
    const list = await this.dbService.getall();
    let flag = true;
    let error = '';
    console.log(list);
    list.forEach(data => {
      if (data.config.port === query.port) {
        flag = false;
        error = `存在端口${query.port}的服务，请更换接口`;
      }
    });
    if (flag) {
      return {
        type: 'sueccess',
      };
    } else {
      return {
        type: 'error',
        msg: error,
      };
    }
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
    // 拉取
    await this.fileService.gitpull(data);
    const config = await this.fileService.readconfig(data);
    data.config = config;
    // 读写数据文件
    await this.dbService.create(data);
    return { type: 'success' };
  }

  @Get('/alllist')
  async getAll() {
    const list = await this.dbService.getall();
    const configs = await Promise.all(
      list.map(data => this.fileService.readconfig(data)),
    );
    const pm2s = await Promise.all(
      list.map(data => this.pm2Service.getStatus(data)),
    );
    const flags = await Promise.all(
      list.map(data => this.fileService.isaccord(data)),
    );
    list.forEach((data, i) => {
      data.config = configs[i];
      data.pm2status = pm2s[i];
      data.flag = flags[i];
    });
    return {
      type: 'success',
      data: {
        list,
      },
    };
  }
  @Post('/delete')
  async deleteItem(@Body() body) {
    // // 停止pm2
    await this.pm2Service.delete(body);
    // 删除文件
    await this.fileService.filedelete(body);
    // 删除数据
    await this.dbService.delete(body.id);
    return {
      type: 'success',
    };
  }

  @Get('/devconfig')
  async getDevConfig(@Query() query) {
    const data = await this.dbService.getDataById(query.id);
    const config = await this.fileService.readconfig(data);
    return {
      type: 'success',
      data: {
        config,
      },
    };
  }

  @Get('/branch')
  async getBranches(@Query() query) {
    const data = await this.dbService.getDataById(query.id);
    const branchInfo = await this.fileService.gitbranch(data);
    return {
      type: 'success',
      data: {
        branchInfo,
      },
    };
  }

  @Post('/update')
  async updateData(@Body() body) {
    // 写到数据里
    const data = await this.dbService.update(body);
    // 写文件
    await this.fileService.updateConfig(data);
    return {
      type: 'success',
    };
  }

  @Post('/pm2start')
  async pm2Start(@Body() body) {
    const data = await this.dbService.getDataById(body.id);
    await this.pm2Service.start(data);
    return {
      type: 'success',
    };
  }

  @Post('/pm2stop')
  async pm2Stop(@Body() body) {
    const data = await this.dbService.getDataById(body.id);
    await this.pm2Service.stop(data);
    return {
      type: 'success',
    };
  }

  @Post('/checkoutbranch')
  async checkoutbranch(@Body() body) {
    const data = await this.dbService.getDataById(body.id);
    await this.fileService.checkout(body.branch, data);
    return {
      type: 'success',
    };
  }
}
