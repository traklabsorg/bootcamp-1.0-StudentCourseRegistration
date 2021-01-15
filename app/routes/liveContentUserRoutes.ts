import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { LiveContentUserDto } from 'app/smartup_dtos/LiveContentUserDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { LiveContentUserFacade } from 'app/facade/liveContentUserFacade';
import { plainToClass } from 'class-transformer';
// import { RequestModel } from ''submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
// let dto_maps = require('../smartup_dtos/LiveContentUserDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { LiveContentUserDto } from '../../submodules/platform-3.0-Dtos/liveContentUserDto';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';


@Controller('liveContentUser')
export class LiveContentUserRoutes{

  constructor(private liveContentUserFacade: LiveContentUserFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['LIVECONTENTUSER_ADD','LIVECONTENTUSER_UPDATE','LIVECONTENTUSER_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];

  private live_content_user_children_array = ["liveContent","user"]
  
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
            let responseModelOfGroupDto: ResponseModel<LiveContentUserDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'GROUP_ADD':
                console.log("Inside Group_ADD Topic");
                responseModelOfGroupDto = await this.createGroup(result["message"]);
                break;
              case 'GROUP_UPDATE':
                console.log("Inside Group_UPDATE Topic");
               responseModelOfGroupDto = await this.updateGroup(result["message"]);
                break;
              case 'GROUP_DELETE':
                console.log("Inside Group_DELETE Topic");
                responseModelOfGroupDto = await this.deleteGroup(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfGroupDto: RequestModel<LiveContentUserDto> = result["message"];
            responseModelOfGroupDto.setSocketId(requestModelOfGroupDto.SocketId)
            responseModelOfGroupDto.setCommunityUrl(requestModelOfGroupDto.CommunityUrl);
            responseModelOfGroupDto.setRequestId(requestModelOfGroupDto.RequestGuid);
            responseModelOfGroupDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            // let responseModelOfGroupDto = this.liveContentUserFacade.create(result["message"]);

            // result["message"].DataCollection = responseModelOfGroupDto.DataCollection;
            //this.creategroup(result["message"])
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, responseModelOfGroupDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<LiveContentUserDto>;
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
      return this.liveContentUserFacade.getAll();
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
  //     let result = await this.liveContentUserFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     console.log("Error is....." + error);
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<LiveContentUserDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.liveContentUserFacade.getByIds([id]);
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
      let isSubset = given_children_array.every(val => this.live_content_user_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.live_content_user_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if (!isSubset) {
        console.log("Inside Condition.....")
        requestModel.Children = this.live_content_user_children_array;
      }
      requestModel.Children.unshift('liveContentUser');
      let result = await this.liveContentUserFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createGroup(@Body() body:RequestModel<LiveContentUserDto>): Promise<ResponseModel<LiveContentUserDto>> {  //requiestmodel<LiveContentUserDto></LiveContentUserDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.liveContentUserFacade.create(body);
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
  async updateGroup(@Body() body:RequestModel<LiveContentUserDto>): Promise<ResponseModel<LiveContentUserDto>> {  //requiestmodel<LiveContentUserDto></LiveContentUserDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.liveContentUserFacade.updateEntity(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get("/expt/query1")
  // async func2(): Promise<any>{
  //   this.liveContentUserFacade.getGroupRequestModel();
  //   return null;
  // }

  @Delete(':id')
  deleteGroup(@Param('id') pk: string): Promise<ResponseModel<LiveContentUserDto>>{
    try {
      console.log("Id is......" + pk);
          return this.liveContentUserFacade.deleteById([parseInt(pk, 10)])
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

}