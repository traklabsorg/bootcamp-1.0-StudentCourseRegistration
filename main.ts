//import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';



require('dotenv').config();

declare const module: any;

// if (process.env.NODE_ENV === "prod" || process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "prod") {
//   console.log = function () {};
// }

const port =  process.env.port || 3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('Channel Microservice')
    .setDescription('Channel Microservice API Documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  

  await app.startAllMicroservicesAsync();
  await app.listen(port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  
 
}
bootstrap();

async function testTopicListener(){
  while (true) {
    await sleep(5000);
    console.log("Printitng time...." + 12345);
  }
}
async function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}



