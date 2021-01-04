import {KafkaOptions, Transport} from "@nestjs/microservices";

export const apiGatewayConfig: any = {
    transport: Transport.TCP,

    options: {
      host: '127.0.0.1',
      port: 3009,
      retryAttempts: 5,
      
      retryDelay: 3000
    }
};
