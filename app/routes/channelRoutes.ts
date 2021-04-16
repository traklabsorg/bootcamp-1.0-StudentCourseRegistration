 import { Body, Controller, Delete, Get, Headers, HttpException, HttpStatus, Inject, Injectable, OnModuleInit, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { ChannelDto } from 'app/smartup_dtos/channelDto';
// import { Channel } from 'app/smartup_entities/channel';
import { ChannelFacade } from 'app/facade/channelFacade';
import { plainToClass } from 'class-transformer';
// import { Client, ClientKafka, EventPattern, MessagePattern } from '@nestjs/microservices';
// import { microserviceConfig } from 'app/microserviceConfig';
import { Request } from 'express';
import { ChannelDetailsReportDto, ChannelDto } from '../../submodules/platform-3.0-Dtos/channelDto';
import { RequestModel} from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { json } from 'body-parser';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';
import { GroupDto } from 'submodules/platform-3.0-Dtos/groupDto';
import { NotificationDto, Label, NotificationType } from 'submodules/platform-3.0-Dtos/notificationDto';
import { GROUP_MICROSERVICE_URI } from 'config';
import { UserDto } from 'submodules/platform-3.0-Dtos/userDto';
import { UtilityFacade } from 'app/facade/utilityFacade';
import { Condition } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/condition';
import { ServiceOperationResultType } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ServiceOperationResultType';
let mapperDto = require('../../submodules/platform-3.0-Mappings/channelMapper');
// let dto_maps = require('../smartup_dtos/channelDto')
var objectMapper = require('object-mapper');


@Controller('channel')
export class ChannelRoutes implements OnModuleInit{

  

  constructor(private channelFacade: ChannelFacade, private utilityFacade: UtilityFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['CHANNEL_ADD','CHANNEL_UPDATE','CHANNEL_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];
  
  private channel_children_array = ['community'];


  
  

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
            let responseModelOfChannelDto: ResponseModel<ChannelDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'CHANNEL_ADD':
                console.log("Inside CHANNEL_ADD Topic");
                responseModelOfChannelDto = await this.createChannel(result["message"]);
                break;
              case 'CHANNEL_UPDATE':
                console.log("Inside CHANNEL_UPDATE Topic");
               responseModelOfChannelDto = await this.updateChannel(result["message"]);
                break;
              case 'CHANNEL_DELETE':
                console.log("Inside CHANNEL_DELETE Topic");
                responseModelOfChannelDto = await this.deleteChannel(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfChannelDto: RequestModel<ChannelDto> = result["message"];
            responseModelOfChannelDto.setSocketId(requestModelOfChannelDto.SocketId)
            responseModelOfChannelDto.setCommunityUrl(requestModelOfChannelDto.CommunityUrl);
            responseModelOfChannelDto.setRequestId(requestModelOfChannelDto.RequestGuid);
            responseModelOfChannelDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            // let responseModelOfChannelDto = this.channelFacade.create(result["message"]);

            // result["message"].DataCollection = responseModelOfChannelDto.DataCollection;
            //this.creategroup(result["message"])
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, responseModelOfChannelDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<ChannelDto> = new ResponseModel<ChannelDto>(null,null,null,null,null,null,null,null,null);
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
      return this.channelFacade.getAll();
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
  //     let result = await this.channelFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     console.log("Error is....." + error);
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<ChannelDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.channelFacade.getByIds([id]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("/findAllPublishedLessonRelatedDetailsWithAllReviewsByChannelId/:pageSize/:pageNumber")
  async findAllPublishedLessonRelatedDetailsWithAllReviewsByChannelId(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request):Promise<any>{
    try {
      console.log("Inside findAllPublishedLessonRelatedDetailsWithAllReviewsByChannelId ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let custom_section_children_array = [['channel','section'],['section','lesson'],['lesson','lessonData'],['lessonData','lessonDataUser'],['lessonData','lessonDataReview']];
      let result = await this.channelFacade.findAllPublishedLessonRelatedDetailsWithAllReviewsByChannelId(requestModel,custom_section_children_array);
      // result.getDataCollection()
      // if result.getDataCollection().forEach(())
      console.log("Route result...",result);
      return result;
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
      let isSubset = given_children_array.every(val => this.channel_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.channel_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if (!isSubset) {
        console.log("Inside Condition.....")
        requestModel.Children = this.channel_children_array;
      }
      if(requestModel.Children.indexOf('channel')<=-1)
        requestModel.Children.unshift('channel');
      let result = await this.channelFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createChannel(@Body() body:RequestModel<ChannelDto>): Promise<ResponseModel<ChannelDto>> {  //requiestmodel<ChannelDto></ChannelDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.channelFacade.create(body);
      console.log("Result returned is ")
      console.log("--------------------------------------------------------------------")
      console.log(result.getDataCollection());
      
      let createChannelSuccessResult:RequestModel<NotificationDto> = new RequestModel();
      createChannelSuccessResult.CommunityId = body.CommunityId;
      createChannelSuccessResult.CommunityUrl = body.CommunityUrl;
      createChannelSuccessResult.DataCollection = []
      createChannelSuccessResult.SocketId = body.SocketId;
      createChannelSuccessResult.RequestGuid = body.RequestGuid;
      result.getDataCollection().forEach(async (channel:ChannelDto)=>{
        let notification:NotificationDto = new NotificationDto();
        let creatorId = result.getDataCollection()[0].CreatedBy;
        console.log(creatorId);

        //fetching creatorDetails
        let creatorDetails = await this.utilityFacade.getUserDetails([creatorId]);
        console.log("Creator Details...........")
        console.log(creatorDetails)
        let creatorName : string;
        if(creatorDetails && creatorDetails.DataCollection.length){
            creatorName = (creatorDetails.DataCollection[0].userName);
            notification.userId = channel.CreatedBy;
            notification.label = Label.channelAdded;
            notification.notificationType = NotificationType.email;
            notification.dateTime = channel.CreationDate;
            notification.notificationData = {"channelName":channel.title,"createdBy":creatorName,"channelId":channel.Id}
            createChannelSuccessResult.DataCollection.push(notification);
            console.log("succesfully prepared notification object............",createChannelSuccessResult)
            this.sns_sqs.publishMessageToTopic("NOTIFICATION_ADD",createChannelSuccessResult);
            console.log("pushing notification to aws");
       }
      })
    
      
      // this.sns_sqs.publishMessageToTopic("Channel_ADDED",{success:body})  // remove from here later
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
  //   this.channelFacade.getGroupRequestModel();
  //   return null;
  // }

  @Delete('/')
  deleteChannel(@Body() body:RequestModel<ChannelDto>): Promise<ResponseModel<ChannelDto>>{
    try {
      let delete_ids :Array<number> = [];
      body.DataCollection.forEach((entity:ChannelDto)=>{
        delete_ids.push(entity.Id);
      })
      console.log("Ids are......",delete_ids);
      return this.channelFacade.deleteById(delete_ids);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

  @Get("/count/findRecord/all")
  async getCount(@Req() req:Request) {
    try {
      console.log("Inside controller123 ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      let given_children_array = requestModel.Children;
      let isSubset = given_children_array.every(val => this.channel_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.channel_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if ( !isSubset || given_children_array.length==0) {
        console.log("Inside Condition.....")
        requestModel.Children = this.channel_children_array;
      }
      if(requestModel.Children.indexOf('channel')<=-1)
        requestModel.Children.unshift('channel');
      console.log("\n\n\n\nRequestModel inside routes is....." + JSON.stringify(requestModel));
      var result = await this.channelFacade.getCountByConditions(requestModel);
      // let result = await this.groupUserFacade.search(requestModel);
      return result;
    } catch (error) {
      console.log("Error is....." + JSON.stringify(error));
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

 
 // endpoint to get channel details report
   @Get("/getChannelDetailsReport/:pageSize/:pageNumber")
   async getChannelDetailsReport(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request): Promise<ResponseModel<ChannelDetailsReportDto>>{
     try {
       console.log("getChannelDetailsReport ......group by pageSize & pageNumber");
       let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      //  requestModel.Filter.PageInfo.PageSize = pageSize;
      //  requestModel.Filter.PageInfo.PageNumber = pageNumber;
       let given_children_array = requestModel.Children;
       let communityId : number = null;
       let startDate : string,endDate : string;
       let memberIds : string;
       let allGroups : boolean;
       let allMembers : boolean;
       let reportName : string;
        
       // EXTRACTING FIELDS FROM REQUEST MODEL QUERY
       requestModel.Filter.Conditions.forEach((condition: Condition)=>{
        switch(condition.FieldName){
          case 'communityId':
            communityId = condition.FieldValue;
            break;
          case 'startDate' :
            startDate = condition.FieldValue;
            break;
          case 'endDate' :
            endDate = condition.FieldValue;
            break;
          case 'memberIds' :
            memberIds = condition.FieldValue;
            break;
          case 'allGroups' :
            allGroups = condition.FieldValue;
            break;
          case 'allMembers' :
            allMembers = condition.FieldValue;
            break;
          // case 'reportName' :
          //   reportName = condition.FieldValue;
          //   break;      
        }
     })
  
          //applying query on retrieved data fields 
          let queryResult = await this.channelFacade.genericRepository.query(`SELECT * from public.fn_get_channel_details_report(${communityId},
                                                                            '${startDate}','${endDate}','${memberIds}',${allGroups}, ${allMembers},
                                                                             ${pageNumber},${pageSize})`);     
          let final_result_updated = [];
          let result:ResponseModel<ChannelDetailsReportDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
            
          queryResult.forEach((entity:any)=>{
              entity = objectMapper(entity,mapperDto.channelDetailsReportMapper); // mapping to camel case
  
              final_result_updated.push(entity)
            })
          result.setDataCollection(final_result_updated);
          return result;
  
       // let isSubset = given_children_array.every(val => this.lesson_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.lesson_children_array.filter(el => el === val).length);
       // console.log("isSubset is......" + isSubset);
       // if (!isSubset) {
       //   console.log("Inside Condition.....")
       //   requestModel.Children = this.lesson_children_array;
       // }
       // if(requestModel.Children.indexOf('lesson')<=-1)
       //   requestModel.Children.unshift('lesson');
       
       
     } catch (error) {
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
     }
   }
  


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