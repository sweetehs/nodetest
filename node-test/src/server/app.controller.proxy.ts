import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import * as request from 'request';
import * as minimatch from 'minimatch';
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
    const referers = referer.match(/\/project\/(.*?)\//);
    const projectnames = referers ? referers[1].split('_') : '';
    const id = projectnames[projectnames.length - 1];
    return this.dbService.getDataById(id);
  }
  private match(url, proxy) {
    let result = '';
    for (const exep in proxy) {
      if (proxy[exep]) {
        const exep1 = exep.replace(/\*/g, '**');
        if (minimatch(url, exep1)) {
          result = proxy[exep].target;
        }
      }
    }
    return result;
  }
  private makeHeaders(url, headers) {
    const hosts = url.match(/\/\/(.*?)\//);
    let host = '';
    if (!hosts) {
      // 如果代理路径不存在，host需要拿referer的
      host = headers.referer.match(/\/\/(.*?)\//)[1];
    } else {
      host = hosts[1];
    }
    return Object.assign({
      host,
      referer: `${url}/index.html`,
      cookie: headers.cookie,
      // connection: 'keep-alive',
      // 'x-forwarded-for': '127.0.0.1',
      // 'x-forwarded-host': host,
      // 'x-forwarded-port': '80',
      // 'x-forwarded-proto': 'http',
    });
  }
  private async getResquestData(method, body, req) {
    let { url } = req;
    const data: any = await this.getId(req);
    const { replaceurlbefore, replaceurlafter } = data.config;
    if (!data) {
      return;
    }
    if (replaceurlbefore && replaceurlafter) {
      url = url.replace(replaceurlbefore, replaceurlafter).replace('//', '/');
    }
    const { proxy } = data.config;
    let proxyUrl = this.match(url, proxy);
    const headers = this.makeHeaders(proxyUrl, req.headers);
    // 需要转发的路径
    if (proxyUrl) {
      proxyUrl += url;
    } else {
      proxyUrl = `http://${headers.host}${url}`;
    }
    const requestData = {
      url: proxyUrl,
      method,
      headers,
    };
    if (method === 'get') {
      return {
        ...requestData,
        qs: body,
      };
    } else {
      return {
        ...requestData,
        form: body,
      };
    }
  }
  @Get('*')
  async rootGet(@Req() req, @Query() query) {
    const requestData = await this.getResquestData('get', query, req);
    if (!requestData) {
      return;
    }
    const proxydata = await new Promise((reslove, reject) => {
      request(requestData, (err, res, bd) => {
        if (!err) {
          reslove(bd);
        } else {
          reslove(err);
        }
      });
    });
    return proxydata;
  }

  @Post('*')
  async rootPost(@Req() req, @Body() body) {
    const requestData = await this.getResquestData('post', body, req);
    if (!requestData) {
      return;
    }
    // 需要转发的路径
    const proxydata = await new Promise((reslove, reject) => {
      request(requestData, (err, res, bd) => {
        if (!err) {
          reslove(bd);
        } else {
          reslove(err);
        }
      });
    });
    return proxydata;
  }
}
