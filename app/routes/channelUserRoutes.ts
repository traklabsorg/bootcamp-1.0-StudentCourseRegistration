import { Body, Controller, Delete, Get, Headers, HttpException, HttpStatus, Inject, Injectable, OnModuleInit, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { ChannelUserDto } from 'app/smartup_dtos/channelUserDto';
// import { ChannelUser } from 'app/smartup_entities/channelUser';
import { ChannelUserFacade } from 'app/facade/channelUserFacade';
import { plainToClass } from 'class-transformer';
// import { Client, ClientKafka, EventPattern, MessagePattern } from '@nestjs/microservices';
// import { microserviceConfig } from 'app/microserviceConfig';
import { Request } from 'express';
import { ChannelUserDto } from '../../submodules/platform-3.0-Dtos/channelUserDto';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { json } from 'body-parser';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';
import { Condition } from 'submodules/platform-3.0-Dtos/submodules/platform-3.0-Common/common/condition';
import { ConditionalOperation } from 'submodules/platform-3.0-Dtos/submodules/platform-3.0-Common/common/conditionOperation';
import { ChannelGroupFacade } from 'app/facade/channelGroupFacade';
// let dto_maps = require('../smartup_dtos/channelUserDto')
var objectMapper = require('object-mapper');
let mapperDto = require('../../submodules/platform-3.0-Mappings/channelUserMapper');


@Controller('channelUser')
export class ChannelUserRoutes implements OnModuleInit {



  constructor(private channelUserFacade: ChannelUserFacade, private channelGroupFacade: ChannelGroupFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['CHANNELUSER_ADD', 'CHANNELUSER_UPDATE', 'CHANNELUSER_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];

  private channelUser_children_array = ['channel', 'user'];





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
              let errorResult: ResponseModel<ChannelUserDto> = new ResponseModel<ChannelUserDto>(null, null, null, null, null, null, null, null, null);
              errorResult.setStatus(new Message("500", error, null))


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




  // @Get("/:pageSize/:pageNumber")
  // async allProductsByPageSizeAndPageNumber(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request) {
  //   try {
  //     console.log("Inside controller ......group by pageSize & pageNumber");
  //     let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
  //     requestModel.Filter.PageInfo.PageSize = pageSize;
  //     requestModel.Filter.PageInfo.PageNumber = pageNumber;
  //     let given_children_array = requestModel.Children;
  //     let isSubset = given_children_array.every(val => this.channelUser_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.channelUser_children_array.filter(el => el === val).length);
  //     console.log("isSubset is......" + isSubset);
  //     if (!isSubset) {
  //       console.log("Inside Condition.....")
  //       requestModel.Children = this.channelUser_children_array;
  //     }
  //     if(requestModel.Children.indexOf('channelUser')<=-1)
  //       requestModel.Children.unshift('channelUser');
  //     let result = await this.channelUserFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  @Get("/:pageSize/:pageNumber")
  async allProductsByPageSizeAndPageNumber(@Param('pageSize') pageSize: number, @Param('pageNumber') pageNumber: number, @Req() req: Request) {
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
      if (requestModel.Children.indexOf('channelUser') <= -1)
        requestModel.Children.unshift('channelUser');
      let result = await this.channelUserFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  @Get("/count/findAllMemberCountOfAParticularChannel/all")
  async func1(@Req() req: Request) {
    let requestModel1: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
    let channelIds = [];
    requestModel1.Filter.Conditions.forEach((condition: Condition) => {
      if (condition.FieldName == "channelId") {
        channelIds.push(condition.FieldValue);
      }
    })
    let requestModel: RequestModelQuery = new RequestModelQuery();
    requestModel.Children = ["channelUser"];
    requestModel.Filter.Conditions = [];
    channelIds.forEach((id: number) => {
      let condition: Condition = new Condition();
      condition.FieldName = "channelId";
      condition.FieldValue = id;
      condition.ConditionalSymbol = ConditionalOperation.Or;
      requestModel.Filter.Conditions.push(condition);

    })
    requestModel.Filter.OrderByField = "channelUser.channelId";
    let result1 = await this.channelUserFacade.getCountByConditions(requestModel, "DISTINCT(channelUser.userId)")
    console.log("result1....", result1);
    let result2 = await this.channelGroupFacade.findAllUsersInAGroupSubscribedToAChannel(channelIds);
    console.log("result2....", result2);
    var dict = [];
    result1.forEach((res: any) => {
      var dict1 = {};
      dict1["channelId"] = res["channelUser_channel_id"];
      dict1["count_temp"] = res["count_temp"];
      dict.push(dict1);
    })
    result2.forEach((res: any) => {
      let flag = false;
      for (let i = 0; i < dict.length; i++) {
        if (dict[i]["channelId"] == res["channelGroup_channel_id"]) {
          flag = true;
          dict[i]["count_temp"] = (parseInt(dict[i]["count_temp"]) + parseInt(res["count_temp"])).toString();
          break;
        }
      }
      if (flag == false) {
        var dict1 = {};
        dict1["channelId"] = res["channelGroup_channel_id"];
        dict1["count_temp"] = res["count_temp"];
        dict.push(dict1);
      }
    })
    return dict;
  }




  @Get("/findAllMemberOfAParticularChannel/:pageSize/:pageNumber")
  async func(@Param('pageSize') pageSize: number, @Param('pageNumber') pageNumber: number, @Req() req: Request) {
    try {
      console.log("Inside controller ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let result: ResponseModel<ChannelUserDto> = new ResponseModel("SampleInbuiltRequest", [], null, "200", null, null, null, "SampleSocketId", "CommunityUrl")
      let dataCollection = [];
      let communityId = null, channelId = null, userId = null;
      requestModel.Filter.Conditions.forEach((condition: Condition) => {
        switch (condition.FieldName.toLowerCase()) {
          case "communityid":
            communityId = condition.FieldValue
            break
          case "userid":
            userId = condition.FieldValue
            break
          case "channelid":
            channelId = condition.FieldValue
            break
        }
      })
      // requestModel.Filter.Conditions.forEach(async (condition:Condition)=>{
      //   let final_result = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_get_channels_users(${communityId},${channelId},${userId},${requestModel.Filter.PageInfo.PageNumber},${requestModel.Filter.PageInfo.PageSize})`)
      //   dataCollection.push(final_result);
      // })
      let final_result = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_get_channels_users(${communityId},${channelId},${userId},${requestModel.Filter.PageInfo.PageNumber},${requestModel.Filter.PageInfo.PageSize})`)
      console.log(final_result)
      let final_result_updated = [];
      final_result.forEach((entity: any) => {
        entity = objectMapper(entity, mapperDto.channelUserBasedOnChannelMapper)
        final_result_updated.push(entity)
      })
      // final_result = objectMapper(final_result,mapperDto.channelUserBasedOnChannelMapper)
      // dataCollection.push(final_result_updated)
      result.setDataCollection(final_result_updated);
      // this.sns_sqs.publishMessageToTopic("GROUP_ADDED",{success:body})  // remove from here later
      return result;
      // return null;
    } catch (error) {
      await console.log("Error is....." + error);
      // this.sns_sqs.publishMessageToTopic("ERROR_RECEIVER",{error:error})
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Post("/") 
  // async createChannelUser(@Body() body:RequestModel<ChannelUserDto>): Promise<ResponseModel<ChannelUserDto>> {  //requiestmodel<ChannelUserDto></ChannelUserDto>....Promise<ResponseModel<Grou[pDto>>]
  //   try {
  //     await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
  //     let result = await this.channelUserFacade.create(body);
  //     // this.sns_sqs.publishMessageToTopic("GROUP_ADDED",{success:body})  // remove from here later
  //     return result;
  //     // return null;
  //   } catch (error) {
  //     await console.log("Error is....." + error);
  //     // this.sns_sqs.publishMessageToTopic("ERROR_RECEIVER",{error:error})
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  @Post("/")
  async createChannelUser(@Body() body: any): Promise<ResponseModel<ChannelUserDto>> {  //requiestmodel<ChannelGroupDto></ChannelGroupDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      console.log("CREATE CHANNEL USER >>>>>>>>>>>>>>>>>>>>> Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result: ResponseModel<ChannelUserDto> = new ResponseModel(body.RequestGuid, [], null, "200", null, null, null, body.SocketId, body.CommunityUrl)
      let dataCollection = []
      body.DataCollection.forEach(async (dto: ChannelUserDto) => {
        let final_result = await this.channelUserFacade.genericRepository.query(`SELECT * FROM public.fn_add_channels_users(${body.CommunityId},${dto.channelId},${dto.userId},'${JSON.stringify(dto.channelUserAdditionalDetails)}')`);
        dataCollection.push(final_result);
      })
      result.setDataCollection(dataCollection);
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
  async updateChannelUser(@Body() body: RequestModel<ChannelUserDto>): Promise<ResponseModel<ChannelUserDto>> {  //requiestmodel<ChannelUserDto></ChannelUserDto>....Promise<ResponseModel<Grou[pDto>>]
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
  async deleteChannelUser(@Body() body: any): Promise<ResponseModel<ChannelUserDto>> {
    try {
      await console.log("Inside DeleteProduct of controller....body id..." + JSON.stringify(body.DataCollection));
      let result: ResponseModel<ChannelUserDto> = new ResponseModel(body.RequestGuid, [], null, "200", null, null, null, body.SocketId, body.CommunityUrl)
      let dataCollection = []
      body.DataCollection.forEach(async (dto: ChannelUserDto) => {
        console.log(dto)
        let final_result = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_delete_channels_users(${body.CommunityId},${dto.channelId},${dto.userId})`)
        dataCollection.push(final_result);
      })
      result.setDataCollection(dataCollection);
      // this.sns_sqs.publishMessageToTopic("GROUP_ADDED",{success:body})  // remove from here later
      return result;
      // return null;
    } catch (error) {
      await console.log("Error is....." + error);
      // this.sns_sqs.publishMessageToTopic("ERROR_RECEIVER",{error:error})
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