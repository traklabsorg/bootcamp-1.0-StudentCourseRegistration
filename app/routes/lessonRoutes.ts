import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { LessonDto } from 'app/smartup_dtos/LessonDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { LessonFacade } from 'app/facade/lessonFacade';
import { plainToClass } from 'class-transformer';
// import { RequestModel } from ''submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
// let dto_maps = require('../smartup_dtos/LessonDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { LessonDto } from '../../submodules/platform-3.0-Dtos/lessonDto';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';
import { LessonDataReviewFacade } from '../facade/lessonDataReviewFacade';


@Controller('lesson')
export class LessonRoutes{

  constructor(private lessonFacade: LessonFacade,private lessonDataReviewFacade:LessonDataReviewFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['LESSON_ADD','LESSON_UPDATE','LESSON_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];

  private lesson_children_array = ["section"];
  
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
            let responseModelOfGroupDto: ResponseModel<LessonDto> = null;
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
            let requestModelOfGroupDto: RequestModel<LessonDto> = result["message"];
            responseModelOfGroupDto.setSocketId(requestModelOfGroupDto.SocketId)
            responseModelOfGroupDto.setCommunityUrl(requestModelOfGroupDto.CommunityUrl);
            responseModelOfGroupDto.setRequestId(requestModelOfGroupDto.RequestGuid);
            responseModelOfGroupDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            // let responseModelOfGroupDto = this.lessonFacade.create(result["message"]);

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
              let errorResult: ResponseModel<LessonDto>;
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
      return this.lessonFacade.getAll();
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
  //     let result = await this.lessonFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     console.log("Error is....." + error);
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<LessonDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.lessonFacade.getByIds([id]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get("/findAllCommunityLessons/:communityId")
  async findLessons(@Param('communityId') id:string):Promise<ResponseModel<any>>{
    try {
      console.log("Id is......" + id);
      let childrenArray = ["lesson","section","channel","community"]
      let result  =  await this.lessonFacade.getChildrenIds(childrenArray,[parseInt(id, 10)])
      let lessonIdArray = []
      result.getDataCollection().forEach((entity:any)=>{
        let myJSON = {}
        myJSON["lessonId"] = entity.Id;
        delete entity.section.channel;
        lessonIdArray.push(entity);
      })
      result.setDataCollection(lessonIdArray);
      return result;
      
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("/findLessonReviewFacade/:communityId")
  async findReviewStatus(@Param('communityId') id:string):Promise<any>
  {
    try{
      let communityLessonIds :ResponseModel<any> = await this.findLessons(id);
      console.log("communityLessonIds are....."+JSON.stringify(communityLessonIds));
      let lesson_ids = [];
      communityLessonIds.getDataCollection().forEach((json_id:any)=>{
        console.log("\n\n\n\njson_ids are....."+JSON.stringify(json_id));
        lesson_ids.push(json_id.Id);
      })
      let result = await this.lessonDataReviewFacade.checkLessonReviewStatus(lesson_ids);
      
      return result;
      

    }
    catch(error){
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
      let isSubset = given_children_array.every(val => this.lesson_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.lesson_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if (!isSubset) {
        console.log("Inside Condition.....")
        requestModel.Children = this.lesson_children_array;
      }
      if(requestModel.Children.indexOf('lesson')<=-1)
        requestModel.Children.unshift('lesson');
      let result = await this.lessonFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createGroup(@Body() body:RequestModel<LessonDto>): Promise<ResponseModel<LessonDto>> {  //requiestmodel<LessonDto></LessonDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.lessonFacade.create(body);
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
  async updateGroup(@Body() body:RequestModel<LessonDto>): Promise<ResponseModel<LessonDto>> {  //requiestmodel<LessonDto></LessonDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.lessonFacade.updateEntity(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get("/expt/query1")
  // async func2(): Promise<any>{
  //   this.lessonFacade.getGroupRequestModel();
  //   return null;
  // }

  @Delete(':id')
  deleteGroup(@Param('id') pk: string): Promise<ResponseModel<LessonDto>>{
    try {
      console.log("Id is......" + pk);
          return this.lessonFacade.deleteById([parseInt(pk, 10)])
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }


  //  <---------------------------     CUSTOM APIS       ------------------------------->

  


}