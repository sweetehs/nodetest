import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import * as request from 'request';
import { DbService } from './app.service.db';
import { FileService } from './app.service.file';
import { Pm2Service } from './app.service.pm2';
import { resolve } from 'path';

@Controller()
export class ProxyController {
  constructor(
    private readonly dbService: DbService,
    private readonly fileService: FileService,
    private readonly pm2Service: Pm2Service,
  ) {}

  private async getId(req) {
    const { headers } = req;
    const { referer } = headers;
    const projectnames = referer.match(/\/project\/(.*?)\//)[1].split('_');
    const id = projectnames[projectnames.length - 1];
    return this.dbService.getDataById(id);
  }

  @Get('*')
  async rootGet(@Req() req, @Query() query) {
    const { url } = req;
    const data: any = await this.getId(req);
    const { proxy } = data.config;
    // 需要转发的路径
    const proxydata = await new Promise((reslove, reject) => {
      request(
        {
          url: proxy['*'].target + url,
          method: 'get',
          qs: query,
        },
        (err, res, bd) => {
          console.error(bd);
          reslove(JSON.parse(bd ? bd : '{}'));
        },
      );
    });
    return proxydata;
  }

  @Post('*')
  async rootPost(@Req() req, @Body() body) {
    const { url } = req;
    const data: any = await this.getId(req);
    const { proxy } = data.config;
    // 需要转发的路径
    const proxydata = await new Promise((reslove, reject) => {
      request(
        {
          url: proxy['*'].target + url,
          method: 'post',
          form: body,
        },
        (err, res, bd) => {
          console.error(bd);
          reslove(JSON.parse(bd ? bd : '{}'));
        },
      );
    });
    return proxydata;
  }
}
