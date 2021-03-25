import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { LessonDataReviewDto } from 'app/smartup_dtos/LessonDataReviewDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { LessonDataReviewFacade } from 'app/facade/lessonDataReviewFacade';
import { plainToClass } from 'class-transformer';
// import { RequestModel } from ''submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
// let dto_maps = require('../smartup_dtos/LessonDataReviewDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { LessonDataReviewDto } from '../../submodules/platform-3.0-Dtos/lessonDataReviewDto';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';
import { LessonDto } from 'submodules/platform-3.0-Dtos/lessonDto';
import { Condition } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/condition';
import { LessonDataFacade } from 'app/facade/lessonDataFacade';
import { Label, NotificationDto, NotificationType } from 'submodules/platform-3.0-Dtos/notificationDto';
import { LessonDataDto } from 'submodules/platform-3.0-Dtos/lessonDataDto';


@Controller('lessonDataReview')
export class LessonDataReviewRoutes{

  constructor(private lessonDataReviewFacade: LessonDataReviewFacade, private lessonDataFacade:LessonDataFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['LESSONDATAREVIEW_ADD','LESSONDATAREVIEW_UPDATE','LESSONDATAREVIEW_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];

  private lesson_data_review_children_array = ["user"];
  
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
            let responseModelOfLessonDataReviewDto: ResponseModel<LessonDataReviewDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'LESSONDATAREVIEW_ADD':
                console.log("Inside LESSONDATAREVIEW_ADD Topic");
                responseModelOfLessonDataReviewDto = await this.createLessonDataReview(result["message"]);
                break;
              case 'LESSONDATAREVIEW_UPDATE':
                console.log("Inside LESSONDATAREVIEW_UPDATE Topic");
               responseModelOfLessonDataReviewDto = await this.updateLessonDataReview(result["message"]);
                break;
              case 'LESSONDATAREVIEW_DELETE':
                console.log("Inside LESSONDATAREVIEW_DELETE Topic");
                responseModelOfLessonDataReviewDto = await this.deleteLessonDataReview(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfLessonDataReviewDto: RequestModel<LessonDataReviewDto> = result["message"];
            responseModelOfLessonDataReviewDto.setSocketId(requestModelOfLessonDataReviewDto.SocketId)
            responseModelOfLessonDataReviewDto.setCommunityUrl(requestModelOfLessonDataReviewDto.CommunityUrl);
            responseModelOfLessonDataReviewDto.setRequestId(requestModelOfLessonDataReviewDto.RequestGuid);
            responseModelOfLessonDataReviewDto.setStatus(new Message("200", "LeesonDataReview Inserted Successfully", null));

            // let responseModelOfLessonDataReviewDto = this.lessonDataReviewFacade.create(result["message"]);

            // result["message"].DataCollection = responseModelOfLessonDataReviewDto.DataCollection;
            //this.creategroup(result["message"])
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, responseModelOfLessonDataReviewDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<LessonDataReviewDto> = new ResponseModel<LessonDataReviewDto>(null,null,null,null,null,null,null,null,null);
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
      return this.lessonDataReviewFacade.getAll();
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
  //     let result = await this.lessonDataReviewFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     console.log("Error is....." + error);
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<LessonDataReviewDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.lessonDataReviewFacade.getByIds([id]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  

  @Get("/:pageSize/:pageNumber")
  async allProductsByPageSizeAndPageNumber(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request) {
    try {
      console.log("Inside controller ......group by pageSize & pageNumber");
      console.log("request headers is...."+JSON.stringify(req.headers['requestmodel']));
      console.log(req.headers['requestmodel'].toString())
      console.log("\n\n\n\nhere......",JSON.parse(req.headers['requestmodel'].toString()));
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      console.log("1");
      requestModel.Filter.PageInfo.PageSize = pageSize;
      console.log("1");
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      console.log("1");
      let given_children_array = requestModel.Children;
      console.log("1");
      let isSubset = given_children_array.every(val => this.lesson_data_review_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.lesson_data_review_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if (!isSubset) {
        console.log("Inside Condition.....");
        requestModel.Children = this.lesson_data_review_children_array;
      }
      if(requestModel.Children.indexOf('lessonDataReview')<=-1)
        requestModel.Children.unshift('lessonDataReview');
      let result = await this.lessonDataReviewFacade.search(requestModel);
      return result;
    } catch (error) {
      console.log("Error is....."+JSON.stringify(error));
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createLessonDataReview(@Body() body:RequestModel<LessonDataReviewDto>): Promise<ResponseModel<LessonDataReviewDto>> {  //requiestmodel<LessonDataReviewDto></LessonDataReviewDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.lessonDataReviewFacade.createOrUpdateLessonDataReview(body,true);
      return result;
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateLessonDataReview(@Body() body:RequestModel<LessonDataReviewDto>): Promise<ResponseModel<LessonDataReviewDto>> {  //requiestmodel<LessonDataReviewDto></LessonDataReviewDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let finalResult = await this.lessonDataReviewFacade.createOrUpdateLessonDataReview(body,false);
      console.log("update completed...preparing notification....")
      //code for lessonDataReview notification
       
      //end of code for lessonDataReview notification
      return finalResult;
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get("/expt/query1")
  // async func2(): Promise<any>{
  //   this.lessonDataReviewFacade.getGroupRequestModel();
  //   return null;
  // }

  @Delete('/')
  deleteLessonDataReview(@Body() body:RequestModel<LessonDataReviewDto>): Promise<ResponseModel<LessonDataReviewDto>>{
    try {
      let delete_ids :Array<number> = [];
      body.DataCollection.forEach((entity:LessonDataReviewDto)=>{
        delete_ids.push(entity.Id);
      })
      console.log("Ids are......",delete_ids);
      return this.lessonDataReviewFacade.deleteById(delete_ids);
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