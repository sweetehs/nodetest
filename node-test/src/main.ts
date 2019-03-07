import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { AppModule } from './server/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useStaticAssets(join(__dirname, './view'));
  app.setBaseViewsDir(join(__dirname, './view'));
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();
