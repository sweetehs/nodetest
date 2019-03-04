import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbService } from './app.service.db';
import { FileService } from './app.service.file';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [DbService, FileService],
})
export class AppModule {}
