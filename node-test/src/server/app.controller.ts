import * as fs from 'fs';
import { Controller, Get, Post, Render, Body, Query } from '@nestjs/common';
import { DbService } from './app.service.db';
import { FileService } from './app.service.file';
import { Pm2Service } from './app.service.pm2';

@Controller('node_self')
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
        type: 'success',
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
    console.log(query.id);
    list.forEach(data => {
      if (data.config.port === query.port && data.id !== query.id) {
        flag = false;
        error = `存在端口${query.port}的服务，请更换接口`;
      }
    });
    if (flag) {
      return {
        type: 'success',
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
        branch: {},
      },
      createGit,
    );
    data.id = Math.floor(Math.random() * 100000).toString();
    // 获取文件夹名字
    const gitsplit = data.remote.split('/');
    data.dirname = gitsplit[gitsplit.length - 1].replace('.git', '');
    // 拉取
    await this.fileService.gitpull(data);
    // 写入当前仓库分支
    const branchInfo: any = await this.fileService.gitbranch(data);
    data.branch.potcurrent = branchInfo.current;
    // 修改打包路径
    const config: any = await this.fileService.readconfig(data);
    config.buildAssetsPublicPath = `/project/${data.dirname}_${data.id}/`;
    data.config = config;
    // 读写数据文件
    await this.dbService.create(data);
    return { type: 'success' };
  }

  @Get('/alllist')
  async getAll() {
    const list = await this.dbService.getall();
    const pm2s = await Promise.all(
      list.map(data => this.pm2Service.getStatus(data)),
    );
    const flags = await Promise.all(
      list.map(data => this.fileService.isaccord(data)),
    );
    const branchs = await Promise.all(
      list.map(data => this.fileService.gitbranch(data)),
    );
    list.forEach((data, i) => {
      // @ts-ignore
      data.branch.potcurrent = branchs[i].current;
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
    // 删除文件
    await this.fileService.filedelete(body);
    // 删除数据
    await this.dbService.delete(body.id);
    return {
      type: 'success',
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
    return {
      type: 'success',
    };
  }

  @Post('/publish')
  async pm2Start(@Body() body) {
    const data = await this.dbService.getDataById(body.id);
    // // 创建项目
    await this.fileService.createProjet(data);
    // 发布项目分支修改
    data.branch.pubcurrent = data.branch.potcurrent;
    await this.dbService.update(data);
    return {
      type: 'success',
    };
  }

  @Post('/checkoutpub')
  async checkoutbranch(@Body() body) {
    const data = await this.dbService.getDataById(body.id);
    // 切换git分支
    await this.fileService.checkout(body.branch, data);
    // 修改数据中的仓库分支
    data.branch.potcurrent = body.branch;
    await this.dbService.update(data);
    return {
      type: 'success',
    };
  }
}
