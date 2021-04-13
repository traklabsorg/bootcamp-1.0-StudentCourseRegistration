import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { LessonDataDto } from 'app/smartup_dtos/LessonDataDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { LessonDataFacade } from 'app/facade/lessonDataFacade';
import { plainToClass } from 'class-transformer';
// import { RequestModel } from ''submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
// let dto_maps = require('../smartup_dtos/LessonDataDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { LessonDataDto } from '../../submodules/platform-3.0-Dtos/lessonDataDto';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';
import { Label, LessonSubmitted, NotificationData, NotificationType } from 'submodules/platform-3.0-Dtos/notificationDto';
import { LessonFacade } from 'app/facade/lessonFacade';
import { LessonDto } from 'submodules/platform-3.0-Dtos/lessonDto';


@Controller('lessonData')
export class LessonDataRoutes{

  constructor(private lessonFacade : LessonFacade,private lessonDataFacade: LessonDataFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['LESSONDATA_ADD','LESSONDATA_UPDATE','LESSONDATA_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];

  private lesson_data_children_array = ["lesson"];
  
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
            let responseModelOfLessonDataDto: ResponseModel<LessonDataDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'LESSONDATA_ADD':
                console.log("Inside LESSONDATA_ADD Topic");
                responseModelOfLessonDataDto = await this.createLessonData(result["message"]);
                break;
              case 'LESSONDATA_UPDATE':
                console.log("Inside LESSONDATA_UPDATE Topic");
               responseModelOfLessonDataDto = await this.updateLessonData(result["message"]);
                break;
              case 'LESSONDATA_DELETE':
                console.log("Inside LESSONDATA_DELETE Topic");
                responseModelOfLessonDataDto = await this.deleteLessonData(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfLessonDataDto: RequestModel<LessonDataDto> = result["message"];
            responseModelOfLessonDataDto.setSocketId(requestModelOfLessonDataDto.SocketId)
            responseModelOfLessonDataDto.setCommunityUrl(requestModelOfLessonDataDto.CommunityUrl);
            responseModelOfLessonDataDto.setRequestId(requestModelOfLessonDataDto.RequestGuid);
            responseModelOfLessonDataDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            // let responseModelOfLessonDataDto = this.lessonDataFacade.create(result["message"]);

            // result["message"].DataCollection = responseModelOfLessonDataDto.DataCollection;
            //this.createLessonData(result["message"])
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, responseModelOfLessonDataDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<LessonDataDto> = new ResponseModel<LessonDataDto>(null,null,null,null,null,null,null,null,null);;
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
  //   // this.createLessonData(payload);
  //   return true;
  // }


  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......lessonData");
      return this.lessonDataFacade.getAll();
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
  //     let result = await this.lessonDataFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     console.log("Error is....." + error);
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<LessonDataDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.lessonDataFacade.getByIds([id]);
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
      let isSubset = given_children_array.every(val => this.lesson_data_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.lesson_data_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if (!isSubset) {
        console.log("Inside Condition.....")
        requestModel.Children = this.lesson_data_children_array;
      }
      if(requestModel.Children.indexOf('lessonData')<=-1)
        requestModel.Children.unshift('lessonData');
      let result = await this.lessonDataFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createLessonData(@Body() body:RequestModel<LessonDataDto>): Promise<ResponseModel<LessonDataDto>> {  //requiestmodel<LessonDataDto></LessonDataDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.lessonDataFacade.create(body);
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
  async updateLessonData(@Body() body:RequestModel<LessonDataDto>): Promise<ResponseModel<LessonDataDto>> {  //requiestmodel<LessonDataDto></LessonDataDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      
      let lessonData : LessonDataDto = body.DataCollection[0];
      console.log("hi")
      if(lessonData.isSubmitted){
          console.log("lesson data isSubmitted is true.......")  
          //code for lessonSubmitted notification
          let creatorId = (await this.lessonDataFacade.getByIds([lessonData.Id])).getDataCollection()[0].CreatedBy;
          let userData = await this.lessonDataFacade.getGroupAndUserDetailsByUserId(creatorId);    
          console.log("User Data is.................",userData);
          let channelData = await this.lessonFacade.getChannelAndSectionDetailsByLessonId([lessonData.lessonId],1000,1);
          // let courseId = channelData.getDataCollection()[0].sectionId;
          // let learnerName = userData[0].learner_first_name;
          let lessonSubmittedNotification : LessonSubmitted= {}; 
          userData.map((user: any)=>{
            lessonSubmittedNotification.lessonId = lessonData.lessonId;
            lessonSubmittedNotification.learnerName = user.learner_first_name;
            lessonSubmittedNotification.lessonTitle = channelData.getDataCollection()[0].title;
            lessonSubmittedNotification.lessonLink =  `https://${body.CommunityUrl}//lesson/${lessonData.lessonId}`; 
            this.lessonDataFacade.createNotification(user.group_admin_user_id,null,Label.lessonSubmitted,NotificationType.email,lessonData.CreationDate,lessonSubmittedNotification)
          })
        //end of lessonSubmitted notification
        console.log("Lesson Submitted Notification working.....")
        //code for courseSubmitted notification
        let courseSubmittedNotification : NotificationData = {};
        userData.map((user: any)=>{
          courseSubmittedNotification.courseId = channelData.getDataCollection()[0].sectionId;
          courseSubmittedNotification.learnerName = user.learner_first_name;
          courseSubmittedNotification.courseTitle = (channelData.getDataCollection()[0].section)?channelData.getDataCollection()[0].section.title:"dummy title";
          courseSubmittedNotification.courseLink =  `https://${body.CommunityUrl}//courses/${channelData.getDataCollection()[0].sectionId}`; 
          this.lessonDataFacade.createNotification(user.group_admin_user_id,null,Label.courseSubmitted,NotificationType.email,lessonData.CreationDate,courseSubmittedNotification)
        })
        console.log("Course Submitted Notification working.....")
       //end of code for courseSubmitted notification
      } 

      

      //code for lessonPublished notification
      if(lessonData.isReviewed){
          console.log("lessonData is reviewed is true");
          let pageSize = 1000,pageNumber = 1;
          //join lesson,channel and section
          let dataCollection :ResponseModel<LessonDto> = await this.lessonFacade.getChannelAndSectionDetailsByLessonId([lessonData.lessonId],pageSize,pageNumber);
          let data = dataCollection.getDataCollection()[0];     
           
        let lessonPublishedNotification = {
          "lessonId" : lessonData.lessonId,
          "lessonTitle" : data.title,
          "channelName" : (data.section)?data.section.channel.title:"test channel",
          "lessonLink" : `https://${body.CommunityUrl}/lesson/${lessonData.lessonId}`
        }
        this.lessonDataFacade.createNotification(lessonData.CreatedBy,null,Label.lessonPublished,NotificationType.email,lessonData.CreationDate,lessonPublishedNotification)
      }
      //end of lessonPublished notification
      console.log("Executing update query..............")
      return await this.lessonDataFacade.updateEntity(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get("/expt/query1")
  // async func2(): Promise<any>{
  //   this.lessonDataFacade.getGroupRequestModel();
  //   return null;
  // }

  @Delete('/')
  deleteLessonData(@Body() body:RequestModel<LessonDataDto>): Promise<ResponseModel<LessonDataDto>>{
    try {
      let delete_ids :Array<number> = [];
      body.DataCollection.forEach((entity:LessonDataDto)=>{
        delete_ids.push(entity.Id);
      })
      console.log("Ids are......",delete_ids);
      return this.lessonDataFacade.deleteById(delete_ids);
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