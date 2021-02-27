import { Body, Controller, Delete, Get, Headers, HttpException, HttpStatus, Inject, Injectable, OnModuleInit, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { ChannelUserDto } from 'app/smartup_dtos/channelUserDto';
// import { ChannelUser } from 'app/smartup_entities/channelUser';
import { ChannelUserFacade } from 'app/facade/channelUserFacade';
import { plainToClass } from 'class-transformer';
// import { Client, ClientKafka, EventPattern, MessagePattern } from '@nestjs/microservices';
// import { microserviceConfig } from 'app/microserviceConfig';
import { Request } from 'express';
import { ChannelUserDto } from '../../submodules/platform-3.0-Dtos/channelUserDto';
import { RequestModel} from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { json } from 'body-parser';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';
// let dto_maps = require('../smartup_dtos/channelUserDto')
var objectMapper = require('object-mapper');

@Controller('channelUser')
export class ChannelUserRoutes implements OnModuleInit{

  

  constructor(private channelUserFacade: ChannelUserFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['CHANNELUSER_ADD','CHANNELUSER_UPDATE','CHANNELUSER_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];
  
  private channelUser_children_array = ['channel','user'];


  
  

  // @Client(microserviceConfig)
  // client: ClientKafka;


  onModuleInit() {
    // const requestPatterns = [
    //   'group-create'
    // ];
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          await console.log("Result is........" + result);
          try {
            let responseModelOfChannelUserDto: ResponseModel<ChannelUserDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'CHANNELUSER_ADD':
                console.log("Inside CHANNELUSER_ADD Topic");
                responseModelOfChannelUserDto = await this.createChannelUser(result["message"]);
                break;
              case 'CHANNELUSER_UPDATE':
                console.log("Inside CHANNELUSER_UPDATE Topic");
               responseModelOfChannelUserDto = await this.updateChannelUser(result["message"]);
                break;
              case 'CHANNELUSER_DELETE':
                console.log("Inside CHANNELUSER_DELETE Topic");
                responseModelOfChannelUserDto = await this.deleteChannelUser(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfChannelUserDto: RequestModel<ChannelUserDto> = result["message"];
            responseModelOfChannelUserDto.setSocketId(requestModelOfChannelUserDto.SocketId)
            responseModelOfChannelUserDto.setCommunityUrl(requestModelOfChannelUserDto.CommunityUrl);
            responseModelOfChannelUserDto.setRequestId(requestModelOfChannelUserDto.RequestGuid);
            responseModelOfChannelUserDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            // let responseModelOfChannelUserDto = this.channelUserFacade.create(result["message"]);

            // result["message"].DataCollection = responseModelOfChannelUserDto.DataCollection;
            //this.creategroup(result["message"])
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, responseModelOfChannelUserDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<ChannelUserDto> = new ResponseModel<ChannelUserDto>(null,null,null,null,null,null,null,null,null);
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

    
    
    // requestPatterns.forEach(pattern => {
    //   this.client.subscribeToResponseOf(pattern);
    // });
  }

  // @EventPattern('group-create')
  // async handleEntityCreated(payload: Request): Promise<boolean> {
  //   console.log("Calling to create group");
    
  //   console.log(JSON.stringify(payload.body) + ' created');
  //   this.client.emit<any>('success', 'Message received by handleEntityCreated SuccessFully' + JSON.stringify(payload['value']))
  //   // this.creategroup(payload);
  //   return true;
  // }


  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......group");
      return this.channelUserFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  // @Get("/page")
  // async allProductsByPage(@Req() req:Request) {
  //   try {
  //     console.log("Inside controller ......group");
  //     console.log("RequestModel is......" + JSON.stringify(req.headers['requestmodel']));
  //     let requestModel: any = JSON.parse(req.headers['requestmodel'].toString());
  //     let result = await this.channelUserFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     console.log("Error is....." + error);
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<ChannelUserDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.channelUserFacade.getByIds([id]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  

  @Get("/:pageSize/:pageNumber")
  async allProductsByPageSizeAndPageNumber(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request) {
    try {
      console.log("Inside controller ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let given_children_array = requestModel.Children;
      let isSubset = given_children_array.every(val => this.channelUser_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.channelUser_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if (!isSubset) {
        console.log("Inside Condition.....")
        requestModel.Children = this.channelUser_children_array;
      }
      if(requestModel.Children.indexOf('channelUser')<=-1)
        requestModel.Children.unshift('channelUser');
      let result = await this.channelUserFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createChannelUser(@Body() body:RequestModel<ChannelUserDto>): Promise<ResponseModel<ChannelUserDto>> {  //requiestmodel<ChannelUserDto></ChannelUserDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.channelUserFacade.create(body);
      // this.sns_sqs.publishMessageToTopic("GROUP_ADDED",{success:body})  // remove from here later
      return result;
      // return null;
    } catch (error) {
      await console.log("Error is....." + error);
      // this.sns_sqs.publishMessageToTopic("ERROR_RECEIVER",{error:error})
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateChannelUser(@Body() body:RequestModel<ChannelUserDto>): Promise<ResponseModel<ChannelUserDto>> {  //requiestmodel<ChannelUserDto></ChannelUserDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.channelUserFacade.updateEntity(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get("/expt/query1")
  // async func2(): Promise<any>{
  //   this.channelUserFacade.getGroupRequestModel();
  //   return null;
  // }

  @Delete('/')
  deleteChannelUser(@Body() body:RequestModel<ChannelUserDto>): Promise<ResponseModel<ChannelUserDto>>{
    try {
      let delete_ids :Array<number> = [];
      body.DataCollection.forEach((entity:ChannelUserDto)=>{
        delete_ids.push(entity.Id);
      })
      console.log("Ids are......",delete_ids);
      return this.channelUserFacade.deleteById(delete_ids);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

  // @Get("/count/findRecord/all")
  // async getCount(@Req() req:Request) {
  //   try {
  //     console.log("Inside controller123 ......group by pageSize & pageNumber");
  //     let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
  //     let given_children_array = requestModel.Children;
  //     let isSubset = given_children_array.every(val => this.community_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.community_children_array.filter(el => el === val).length);
  //     console.log("isSubset is......" + isSubset);
  //     if ( !isSubset || given_children_array.length==0) {
  //       console.log("Inside Condition.....")
  //       requestModel.Children = this.community_children_array;
  //     }
  //     if(requestModel.Children.indexOf('community')<=-1)
  //       requestModel.Children.unshift('community');
  //     console.log("\n\n\n\nRequestModel inside routes is....." + JSON.stringify(requestModel));
  //     var result = await this.communityFacade.getCountByConditions(requestModel);
  //     // let result = await this.groupUserFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     console.log("Error is....." + JSON.stringify(error));
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }


  // @Get("/count/findRecord/one")
  // async getTotalCount(@Req() req:Request):Promise<number> {
  //   try {
  //     console.log("Inside controller123 ......group by pageSize & pageNumber");
  //     let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
  //     let given_children_array = requestModel.Children;
  //     let isSubset = given_children_array.every(val => this.community_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.community_children_array.filter(el => el === val).length);
  //     console.log("isSubset is......" + isSubset);
  //     if ( !isSubset || given_children_array.length==0) {
  //       console.log("Inside Condition.....")
  //       requestModel.Children = this.community_children_array;
  //     }
  //     if(requestModel.Children.indexOf('community')<=-1)
  //       requestModel.Children.unshift('community');
  //     console.log("\n\n\n\nRequestModel inside routes is....." + JSON.stringify(requestModel));
  //     var result = await this.communityFacade.getAllRecordsCount(requestModel);
  //     // let result = await this.groupUserFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     console.log("Error is....." + JSON.stringify(error));
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

}