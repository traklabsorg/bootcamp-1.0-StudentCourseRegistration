import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ApiGatewayModule } from 'app-gateway.module';
import { apiGatewayConfig } from 'app/apiGatewayConfig';
import { SNS_SQS } from 'submodules/platform-3.0-Framework/aws/models/SNS_SQS';
import { AppModule } from './app.module';
// import { microserviceConfig } from "./app/microserviceConfig";

const logger = new Logger();
// let routes = new GroupRoutes();

var sns_sqs = SNS_SQS.getInstance();
// import config from "./config";
require('dotenv').config();

declare const module: any;

const port =  process.env.port || 3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.connectMicroservice(apiGatewayConfig);
  // const app1 = await NestFactory.createMicroservice(ApiGatewayModule, {
  //   transport: Transport.TCP,
  //   options: {
  //     host:'127.0.0.1',
  //     port: 3009,
  //   }
  // });
  // app.connectMicroservice({
  //   transport: Transport.TCP,
  //   options: {
  //     host: '127.0.0.1',
  //     port: 3000,
  //     retryAttempts: 5,
      
  //     retryDelay: 3000
  //   },
  // });
  // app.connectMicroservice(microserviceConfig);
  

  

  await app.startAllMicroservicesAsync();
  await app.listen(port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  
  // app1.listen(() => logger.log('Microservice A is listening'));
  // testTopicListener();
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

// sns_sqs.listenToService("CHANNEL_ADD", "CHANNEL_SERVICE", (result) => {
//   try {
//     console.log("result is" + JSON.stringify(result));
//     routes.creategroup(result);
//     for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
//       const element = result.OnSuccessTopicsToPush[index];
//       sns_sqs.publishMessageToTopic(element, { success: "on" })
//     }
//   }
//   catch (err) {
//     console.log("Error is...." + err);
//   }
  
// })

