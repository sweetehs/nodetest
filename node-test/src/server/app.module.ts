import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProxyController } from './app.controller.proxy';
import { DbService } from './app.service.db';
import { FileService } from './app.service.file';
import { Pm2Service } from './app.service.pm2';

@Module({
  imports: [],
  controllers: [AppController, ProxyController],
  providers: [DbService, FileService, Pm2Service],
})
export class AppModule {}
