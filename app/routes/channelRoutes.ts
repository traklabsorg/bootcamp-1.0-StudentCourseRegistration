 import { Body, Controller, Delete, Get, Headers, HttpException, HttpStatus, Inject, Injectable, OnModuleInit, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { ChannelDto } from 'app/smartup_dtos/channelDto';
// import { Channel } from 'app/smartup_entities/channel';
import { ChannelFacade } from 'app/facade/channelFacade';
import { plainToClass } from 'class-transformer';
// import { Client, ClientKafka, EventPattern, MessagePattern } from '@nestjs/microservices';
// import { microserviceConfig } from 'app/microserviceConfig';
import { Request } from 'express';
import { ChannelDto } from '../../submodules/platform-3.0-Dtos/channelDto';
import { RequestModel} from '../../submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from '../../submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
import { SNS_SQS } from '../../submodules/platform-3.0-Framework/submodules/platform-3.0-AWS/SNS_SQS';
import { json } from 'body-parser';
import { RequestModelQuery } from '../../submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
// let dto_maps = require('../smartup_dtos/channelDto')
var objectMapper = require('object-mapper');

@Controller('channel')
export class ChannelRoutes implements OnModuleInit{

  

  constructor(private channelFacade: ChannelFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['CHANNEL_ADD','CHANNEL_UPDATE','CHANNEL_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];
  
  private children_array = ['community'];


  
  

  // @Client(microserviceConfig)
  // client: ClientKafka;


  onModuleInit() {
    // const requestPatterns = [
    //   'channel-create'
    // ];
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          await console.log("Result is........" + result);
          try {
            let responseModelOfChannelDto: any = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'CHANNEL_ADD':
                console.log("Inside Channel_ADD Topic");
                responseModelOfChannelDto = this.createChannel(result["message"]);
                break;
              case 'CHANNEL_UPDATE':
                console.log("Inside Channel_UPDATE Topic");
               responseModelOfChannelDto = this.updateChannel(result["message"]);
                break;
              case 'CHANNEL_DELETE':
                console.log("Inside Channel_DELETE Topic");
                responseModelOfChannelDto = this.deleteChannel(result["message"]);
                break;
  
            }
  
            console.log("Result of aws  is...." + JSON.stringify(result));
            // let responseModelOfChannelDto = this.channelFacade.create(result["message"]);
  
            //this.createchannel(result["message"])
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, result)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, result);
            }
          }
        }
      })())
    }

    
    
    // requestPatterns.forEach(pattern => {
    //   this.client.subscribeToResponseOf(pattern);
    // });
  }

  // @EventPattern('channel-create')
  // async handleEntityCreated(payload: Request): Promise<boolean> {
  //   console.log("Calling to create channel");
    
  //   console.log(JSON.stringify(payload.body) + ' created');
  //   this.client.emit<any>('success', 'Message received by handleEntityCreated SuccessFully' + JSON.stringify(payload['value']))
  //   // this.createchannel(payload);
  //   return true;
  // }


  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......channel");
      return this.channelFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get("/page")
  async allProductsByPage(@Req() req:Request,@Headers() headers) {
    try {
      console.log("Inside controller ......channel");
      let requestModel: RequestModelQuery = JSON.parse(JSON.stringify(req.headers['RequestModel']));
      console.log("RequestModel is......" + JSON.stringify(headers['requestmodel']));
      let result = await this.channelFacade.search(requestModel);
      return result;
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get(':id')

  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<ChannelDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.channelFacade.getByIds([id]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  

  @Get("/page/:pageSize/:pageNumber")
  async allProductsByPageSizeAndPageNumber(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Body() requestModel:RequestModelQuery) {
    try {
      console.log("Inside controller ......channel by pageSize & pageNumber");
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let result = await this.channelFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createChannel(@Body() body:RequestModel<ChannelDto>): Promise<ResponseModel<ChannelDto>> {  //requiestmodel<ChannelDto></ChannelDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.channelFacade.create(body);
      // this.sns_sqs.publishMessageToTopic("CHANNEL_ADDED",{success:body})  // remove from here later
      return result;
      // return null;
    } catch (error) {
      await console.log("Error is....." + error);
      // this.sns_sqs.publishMessageToTopic("ERROR_RECEIVER",{error:error})
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateChannel(@Body() body:RequestModel<ChannelDto>): Promise<ResponseModel<ChannelDto>> {  //requiestmodel<ChannelDto></ChannelDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.channelFacade.updateEntity(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get("/expt/query1")
  // async func2(): Promise<any>{
  //   this.channelFacade.getChannelRequestModel();
  //   return null;
  // }

  @Delete(':id')
  deleteChannel(@Param('id') pk: string): Promise<ResponseModel<ChannelDto>>{
    try {
      console.log("Id is......" + pk);
          return this.channelFacade.deleteById([parseInt(pk, 10)])
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

  @Get('/findTenant/:uri')
  findTenantId(@Param('uri') uri: string): number{
    return this.channelFacade.getTenantId(uri);
  }
}