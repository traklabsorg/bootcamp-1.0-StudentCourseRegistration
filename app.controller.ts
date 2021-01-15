import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { Client, ClientKafka, MessagePattern } from '@nestjs/microservices';
// import { microserviceConfig } from 'app/microserviceConfig';
// import { GroupRoutes } from 'app/routes/groupRoutes';
import { AppService } from './app.service';

@Controller("/")
export class AppController{
  constructor(private readonly appService: AppService) {}
  // onModuleInit() {
  //   throw new Error('Method not implemented.');
  // }

  // @Client(microserviceConfig)
  // client: ClientKafka;

  
  @Get()
  getHello(): any {
    console.log("Inside hello......");
    return this.appService.getHello();
  }

  // @MessagePattern('ping')
  // ping(_: any) {
  //   console.log("Inside controller of service ")
  //   console.log(JSON.stringify(_) + JSON.stringify(_));
  //   this.client.emit<any>('group-create', _);

    
    
  // }
}
