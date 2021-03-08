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
import { Condition } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/condition';
import { LessonDataDto } from 'submodules/platform-3.0-Dtos/lessonDataDto';
import { LessonDataUserDto } from 'submodules/platform-3.0-Dtos/lessonDataUserDto';
let mapperDto = require('../../submodules/platform-3.0-Mappings/lessonMapper');


@Controller('lesson')
export class LessonRoutes{

  constructor(private lessonFacade: LessonFacade,private lessonDataReviewFacade:LessonDataReviewFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['LESSON_ADD','LESSON_UPDATE','LESSON_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];

  private lesson_children_array = ["section"];

  
  async onModuleInit() {
    // const requestPatterns = [
    //   'group-create'
    // ];
    // this.maxLessonDatabaseId = await (await this.lessonFacade.findMaxId()).Id
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          await console.log("Result is........" + result);
          try {
            let responseModelOfLessonDto: ResponseModel<LessonDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'LESSON_ADD':
                console.log("Inside LESSON_ADD Topic");
                responseModelOfLessonDto = await this.createLesson(result["message"]);
                break;
              case 'LESSON_UPDATE':
                console.log("Inside LESSON_UPDATE Topic");
               responseModelOfLessonDto = await this.updateLesson(result["message"]);
                break;
              case 'LESSON_DELETE':
                console.log("Inside LESSON_DELETE Topic");
                responseModelOfLessonDto = await this.deleteLesson(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfLessonDto: RequestModel<LessonDto> = result["message"];
            responseModelOfLessonDto.setSocketId(requestModelOfLessonDto.SocketId)
            responseModelOfLessonDto.setCommunityUrl(requestModelOfLessonDto.CommunityUrl);
            responseModelOfLessonDto.setRequestId(requestModelOfLessonDto.RequestGuid);
            responseModelOfLessonDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            // let responseModelOfLessonDto = this.lessonFacade.create(result["message"]);

            // result["message"].DataCollection = responseModelOfLessonDto.DataCollection;
            //this.creategroup(result["message"])
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, responseModelOfLessonDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<LessonDto> = new ResponseModel<LessonDto>(null,null,null,null,null,null,null,null,null);
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
      console.log("Inside controller ......lesson");
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


  @Get("/findAllLessonRelatedDetailsWithAllReviewsByLoggedInUserId/:pageSize/:pageNumber")
  async findAllLessonRelatedDetailsWithAllReviewsByLoggedInUserId(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request):Promise<any>{
    try {
      console.log("Inside findAllLessonRelatedDetailsWithAllReviewsByLoggedInUserId ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let conditions: Condition[] = requestModel.Filter.Conditions;
      let userId:number;
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
        if(condition.FieldName == 'userId')
        userId = condition.FieldValue;
      })
      conditions = conditions.filter((condition: Condition) => {
        return condition.FieldName !== "userId";
      });
      requestModel.Filter.Conditions = conditions;
      // console.log("Final requestModel is......",JSON.stringify(requestModel));
      console.log("UserId is...........",userId);
      // let given_children_array = requestModel.Children;
      // let isSubset = given_children_array.every(val => this.section_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.section_children_array.filter(el => el === val).length);
      // console.log("isSubset is......" + isSubset);
      // if (!isSubset) {
      //   console.log("Inside Condition.....")
      //   requestModel.Children = this.section_children_array;
      // }
      requestModel.Children = ['lesson']
      // if(requestModel.Children.indexOf('lesson')<=-1)
      //   requestModel.Children.unshift('lesson');
      let custom_lesson_children_array = [['lesson','lessonData'],['lessonData','lessonDataUser'],['lessonData','lessonDataReview']];
      let result = await this.lessonFacade.search(requestModel,true,custom_lesson_children_array);

      await Promise.all(result.getDataCollection().map(async (lesson:LessonDto)=>{
        await Promise.all(lesson.lessonData.map((lessonData:LessonDataDto)=>{
          let modifiedLessonDataUserArray = [];
          for(let i = 0;i<lessonData.lessonDataUser.length;i++){
            if(lessonData.lessonDataUser[i].userId == userId){
              console.log("To be inserted lessondataUser is.....",lessonData.lessonDataUser[i])
              modifiedLessonDataUserArray.push(lessonData.lessonDataUser[i])
            }
          }
          lessonData.lessonDataUser = modifiedLessonDataUserArray;
        }))
      }))

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
      let isSubset = given_children_array.every(val => this.lesson_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.lesson_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if (!isSubset) {
        console.log("Inside Condition.....")
        requestModel.Children = this.lesson_children_array;
      }
      if(requestModel.Children.indexOf('lesson')<=-1)
        requestModel.Children.unshift('lesson');
      // requestModel.Children = ['lesson','lessonData']     // expt.....delete this line......
      let result = await this.lessonFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("/findAllLessonRelatedDetailsWithAllReviewsByUserId/:pageSize/:pageNumber")
  async findAllLessonRelatedDetailsWithAllReviewsByUserId(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request){
    try {
      console.log("Inside findAllLessonRelatedDetailsWithAllReviewsByUserId ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let given_children_array = requestModel.Children;
      // let isSubset = given_children_array.every(val => this.lesson_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.lesson_children_array.filter(el => el === val).length);
      // console.log("isSubset is......" + isSubset);
      // if (!isSubset) {
      //   console.log("Inside Condition.....")
      //   requestModel.Children = this.lesson_children_array;
      // }
      // if(requestModel.Children.indexOf('lesson')<=-1)
      //   requestModel.Children.unshift('lesson');
      let entityArrays = [['lesson','lessonData'],['lessonData','lessonDataReview'],['lessonData','lessonDataUser']];
      let result = await this.lessonFacade.findAllLessonRelatedDetailsWithAllReviewsByUserId(requestModel,entityArrays)
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get('/getTopLearners/:pageSize/:pageNumber')
  async getTopLearnersByChannnelId(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request):Promise<any>{
    try {
      console.log("Inside getTopLearnersByChannnelId ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let communityId:number,channelId:number;
      let finalResult:ResponseModel<LessonDto> = new ResponseModel("SampleInbuiltRequest",[],null,"200",null,null,null,"SampleSocketId","CommunityUrl")

      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
        switch(condition.FieldName){
          case 'communityId':
            communityId = condition.FieldValue;
            break;
          case 'channelId' :
            channelId = condition.FieldValue;
            break;
        }

      })
      let result = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_top_learners(${communityId}, ${channelId}, ${requestModel.Filter.PageInfo.PageNumber}, ${requestModel.Filter.PageInfo.PageSize})`);
      let final_result_updated = [];
      result.forEach((entity:any)=>{
        entity = objectMapper(entity,mapperDto.lessonBasedOnChannelMapper)
        final_result_updated.push(entity)
      })
      finalResult.setDataCollection(final_result_updated)
      return finalResult;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  @Post("/") 
  async createLesson(@Body() body:RequestModel<LessonDto>): Promise<ResponseModel<LessonDto>> {  //requiestmodel<LessonDto></LessonDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      body.DataCollection.forEach((entity:LessonDto)=>{
        if(entity.CreatedBy == 0 || typeof(entity.CreatedBy) == 'undefined'){
          throw "Please Insert Valid CreatedBy Field for Lesson..."+JSON.stringify(entity);
        }
        if(typeof(entity.collaborators)=='undefined')
        {
          if(entity.CreatedBy != 0 && entity.CreatedBy != null){
            entity.collaborators = [entity.CreatedBy];
          }
        }
        else if (entity.collaborators == null){
          entity.collaborators = [entity.CreatedBy];
        }
        else if(entity.collaborators.includes(entity.CreatedBy) == false){
          entity.collaborators.push(entity.CreatedBy);
        }
        

      })
      let result = await this.lessonFacade.create(body);
      
      // result.getDataCollection()[0].collaborators = [result.getDataCollection()[0].Id];
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
  async updateLesson(@Body() body:RequestModel<LessonDto>): Promise<ResponseModel<LessonDto>> {  //requiestmodel<LessonDto></LessonDto>....Promise<ResponseModel<Grou[pDto>>]
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

  @Delete('/')
  deleteLesson(@Body() body:RequestModel<LessonDto>): Promise<ResponseModel<LessonDto>>{
    try {
      let delete_ids :Array<number> = [];
      let inputMaxLessonDatabaseId = 0;
      body.DataCollection.forEach((entity:LessonDto)=>{
        inputMaxLessonDatabaseId = Math.max(entity.Id,inputMaxLessonDatabaseId);
        delete_ids.push(entity.Id);
      })
      console.log("Ids are......",delete_ids);
      return this.lessonFacade.deleteById(delete_ids);
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
      let isSubset = given_children_array.every(val => this.lesson_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.lesson_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if ( !isSubset ) {
        console.log("Inside Condition.....")
        requestModel.Children = this.lesson_children_array;
      }
      if(requestModel.Children.indexOf('lesson')<=-1)
        requestModel.Children.unshift('lesson');
      console.log("\n\n\n\nRequestModel inside routes is....." + JSON.stringify(requestModel));
      var result = await this.lessonFacade.getCountByConditions(requestModel);
      // let result = await this.groupUserFacade.search(requestModel);
      return result;
    } catch (error) {
      console.log("Error is....." + JSON.stringify(error));
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


  //  <---------------------------     CUSTOM APIS       ------------------------------->

  


}