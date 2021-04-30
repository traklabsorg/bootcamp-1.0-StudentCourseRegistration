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
import { LessonDailyEngagementDto, LessonDto, LessonInteractionOverviewDto, LessonInteractionReportDto, LessonPublicationReportDto, LessonWeeklyEngagementDto, TopLessonDaywiseDto, TopLessonDto } from '../../submodules/platform-3.0-Dtos/lessonDto';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';
import { LessonDataReviewFacade } from '../facade/lessonDataReviewFacade';
import { Condition } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/condition';
import { LessonDataDto } from 'submodules/platform-3.0-Dtos/lessonDataDto';
import { LessonDataUserDto } from 'submodules/platform-3.0-Dtos/lessonDataUserDto';
import { NotificationDto, Label, NotificationType } from 'submodules/platform-3.0-Dtos/notificationDto';
import { UtilityFacade } from 'app/facade/utilityFacade';
import { UserDto } from 'submodules/platform-3.0-Dtos/userDto';
import { ChannelGroupFacade } from 'app/facade/channelGroupFacade';
import { Lesson } from 'submodules/platform-3.0-Entities/lesson';
import { SectionFacade } from 'app/facade/sectionFacade';
import { SectionDto } from 'submodules/platform-3.0-Dtos/sectionDto';
import { ServiceOperationResultType } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ServiceOperationResultType';
import { QuizQuestionReportDto, QuizScoreReportDto } from 'submodules/platform-3.0-Dtos/quizReportDtos';
import { PollReportDto } from 'submodules/platform-3.0-Dtos/pollReportDto';
import { PendingCompletionReportDto } from 'submodules/platform-3.0-Dtos/pendingCompletionReportDto';
import { ChannelFacade } from 'app/facade/channelFacade';

let mapperDto = require('../../submodules/platform-3.0-Mappings/lessonMapper');
let quizMapperDto = require('../../submodules/platform-3.0-Mappings/quizReportMappers');
let pollMapperDto = require('../../submodules/platform-3.0-Mappings/pollReportMapper');
let pendingCompletionMapperDto = require('../../submodules/platform-3.0-Mappings/pendingCompletionReportMapper');


@Controller('lesson')
export class LessonRoutes{

  constructor(private channelFacade: ChannelFacade,private sectionFacade: SectionFacade,private channelGroupFacade: ChannelGroupFacade,private lessonFacade: LessonFacade,private lessonDataReviewFacade:LessonDataReviewFacade,private utilityFacade:UtilityFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['LESSON_ADD','LESSON_UPDATE','LESSON_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];

  private lesson_children_array = ["section","lessonData"];

  
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
  

  @Get("/findAllLessonRelatedDetailsWithAllReviewsByUserIdAsCreator/:pageSize/:pageNumber")
  async findAllLessonRelatedDetailsWithAllReviewsByUserIdAsCreator(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request):Promise<any>{
    try {
      console.log("Inside controller ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      if(requestModel.Children.indexOf('lesson')<=-1)
        requestModel.Children.unshift('lesson');
      let custom_section_children_array = [['lesson','section'],['section','sectionReview'],['lesson','lessonData'],['lessonData','lessonDataUser'],['lessonData','lessonDataReview']];
      let result = await this.lessonFacade.search(requestModel,true,custom_section_children_array);
      result = await this.utilityFacade.assignIsPublishedFieldsToLesson(result);
      // console.log("Result from assignIsPublishedFieldsToSectionAndLesson  is....",result[0]);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("/findAllLessonRelatedDetailsWithAllReviewsByLoggedInUserId/:pageSize/:pageNumber")
  async findAllLessonRelatedDetailsWithAllReviewsByLoggedInUserId(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request):Promise<any>{
    try {
      console.log("Inside findAllLessonRelatedDetailsWithAllReviewsByLoggedInUserId ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      console.log("request model ready...")
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      console.log("request model ready2...")
      let conditions: Condition[] = requestModel.Filter.Conditions;
      let userId:number;
      let communityId: number = null;
      // extracting communityId from request model
      console.log("preparing to extract communityId......")
      requestModel.Filter.Conditions.map((condition: Condition)=>{
        
        if(condition.FieldName == "communityId"){
          communityId = condition.FieldValue;
        }   
      })
      console.log("extracted communityId........")
      // extracting userId from request model
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
        if(condition.FieldName == 'userId')
        userId = condition.FieldValue;
      })
      console.log("extracted userId........")
    //   //code to check if user has access to this lesson
      let authParams = await this.lessonFacade.genericRepository.query(`select distinct "channelUsers".channel_id ,"groupUsers".group_id, "lessons".id from public."lessons" left join
                                                                        public."sections" on "lessons".section_id = "sections".id left join 
                                                                        public."channels" on "sections".channel_id = "channels".id join 
                                                                        public."channelUsers" on "channelUsers".channel_id = "sections".channel_id left join 
                                                                        public."channelGroups" on "channelGroups".channel_id = "sections".channel_id left join
                                                                        public."groups" on "channelGroups".group_id = "groups".id left join 
                                                                        public."groupUsers" on "groupUsers".group_id = "groups".id
                                                                        where  "lessons".created_by = ${userId} or 
                                                                               ("groups".community_id = ${communityId} and
                                                                               "channels".community_id = ${communityId} and
                                                                               ("channelUsers".user_id = ${userId} or "groupUsers".user_id = ${userId} or 
                                                                                2 = Any("groupUsers".role_ids) 
                                                                               )
                                                                               )`
                                                                       );
       
      console.log("Authparams are......",authParams);  
      let { id, channel_id, group_id } = authParams[0];
      let final_result: ResponseModel<LessonDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null)
      if(!id && !channel_id && !group_id){
        console.log("Auth failed for userId.........: ",userId);
        return final_result;
      }
         
    //  // end of authentication code
      
      conditions = conditions.filter((condition: Condition) => {
        return condition.FieldName !== "userId";
      });
      conditions = conditions.filter((condition: Condition) => {
        return condition.FieldName !== "communityId";
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
      //let result;
      let result = await this.lessonFacade.search(requestModel,true,custom_lesson_children_array);
      console.log("result fetched.....",JSON.stringify(result))
      await Promise.all(result.getDataCollection().map(async (lesson:LessonDto)=>{
        await Promise.all(lesson.lessonData.map((lessonData:LessonDataDto)=>{
          let modifiedLessonDataUserArray = [];
          for(let i = 0;i<lessonData.lessonDataUser.length;i++){
            if(lessonData.lessonDataUser[i].userId == userId){
              console.log("To be inserted lessondataUser is.....",lessonData.lessonDataUser[i])
              modifiedLessonDataUserArray.push(lessonData.lessonDataUser[i])
            }
          }
          console.log("Code running....")
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

 // endpoint to get lesson interaction report
 @Get("/getLessonInteractionReport/:pageSize/:pageNumber")
 async getLessonInteractionReport(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request): Promise<ResponseModel<LessonInteractionReportDto>>{
   try {
     console.log("getLessonInteractionReport ......group by pageSize & pageNumber");
     let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
    //  requestModel.Filter.PageInfo.PageSize = pageSize;
    //  requestModel.Filter.PageInfo.PageNumber = pageNumber;
     let given_children_array = requestModel.Children;
     let communityId : number = null;
     let startDate : string,endDate : string;
     let memberIds : string;
     let allGroups : boolean;
     let allMembers : boolean;
      
     // EXTRACTING FIELDS FROM REQUEST MODEL QUERY
     requestModel.Filter.Conditions.forEach((condition:Condition)=>{
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
      }
   })

        //applying query on retrieved data fields 
        let queryResult = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_lesson_interaction_report(${communityId},
                                                                          '${startDate}','${endDate}','${memberIds}',${allGroups}, ${allMembers},
                                                                           ${pageNumber},${pageSize})`);     
        let final_result_updated = [];
        let result:ResponseModel<LessonInteractionReportDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
          
        queryResult.forEach((entity:any)=>{
            entity = objectMapper(entity,mapperDto.lessonInteractionReportMapper); // mapping to camel case

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


  // endpoint to get lesson interaction overview
  @Get("/getLessonInteractionOverview/:pageSize/:pageNumber")
  async getLessonInteractionOverview(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request): Promise<ResponseModel<LessonInteractionOverviewDto>>{
    try {
      console.log("getLessonInteractionOverview ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
     //  requestModel.Filter.PageInfo.PageSize = pageSize;
     //  requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let given_children_array = requestModel.Children;
      let communityId : number = null;
      let startDate : string,endDate : string;
      let memberIds : string;
      let allGroups : boolean;
      let allMembers : boolean;
       
      // EXTRACTING FIELDS FROM REQUEST MODEL QUERY
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
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
       }
    })
 
         //applying query on retrieved data fields 
         let queryResult = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_lesson_interaction_overview(${communityId},
                                                                           '${startDate}','${endDate}','${memberIds}',${allGroups}, ${allMembers},
                                                                            ${pageNumber},${pageSize})`);     
         let final_result_updated = [];
         let result:ResponseModel<LessonInteractionOverviewDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
           
         queryResult.forEach((entity:any)=>{
             entity = objectMapper(entity,mapperDto.lessonInteractionOverviewMapper); // mapping to camel case
 
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


   // endpoint to get lesson publication report
   @Get("/getLessonPublicationReport/:pageSize/:pageNumber")
   async getLessonPublicationReport(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request): Promise<ResponseModel<LessonPublicationReportDto>>{
     try {
       console.log("getLessonInteractionOverview ......group by pageSize & pageNumber");
       let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      //  requestModel.Filter.PageInfo.PageSize = pageSize;
      //  requestModel.Filter.PageInfo.PageNumber = pageNumber;
       let given_children_array = requestModel.Children;
       let communityId : number = null;
       let startDate : string,endDate : string;
       let memberIds : string;
       let allGroups : boolean;
       let allMembers : boolean;
        
       // EXTRACTING FIELDS FROM REQUEST MODEL QUERY
       requestModel.Filter.Conditions.forEach((condition:Condition)=>{
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
        }
     })
  
          //applying query on retrieved data fields 
          let queryResult = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_lesson_publication_report(${communityId},
                                                                            '${startDate}','${endDate}','${memberIds}',${allGroups}, ${allMembers},
                                                                             ${pageNumber},${pageSize})`);     
          let final_result_updated = [];
          let result:ResponseModel<LessonPublicationReportDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
            
          queryResult.forEach((entity:any)=>{
              entity = objectMapper(entity,mapperDto.lessonPublicationReportMapper); // mapping to camel case
  
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


   // endpoint to get quiz question report
 @Get("/getQuizQuestionReport/:pageSize/:pageNumber")
 async getQuizQuestionReport(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request): Promise<ResponseModel<QuizQuestionReportDto>>{
   try {
     console.log("getQuizQuestionReport ......group by pageSize & pageNumber");
     let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
    //  requestModel.Filter.PageInfo.PageSize = pageSize;
    //  requestModel.Filter.PageInfo.PageNumber = pageNumber;
     let given_children_array = requestModel.Children;
     let communityId : number = null;
     let startDate : string,endDate : string;
     let memberIds : string;
     let allGroups : boolean;
     let allMembers : boolean;
      
     // EXTRACTING FIELDS FROM REQUEST MODEL QUERY
     requestModel.Filter.Conditions.forEach((condition:Condition)=>{
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
      }
   })

        //applying query on retrieved data fields 
        let queryResult = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_quiz_question_report(${communityId},
                                                                          '${startDate}','${endDate}','${memberIds}',${allGroups}, ${allMembers},
                                                                           ${pageNumber},${pageSize})`);     
        let final_result_updated = [];
        let result:ResponseModel<QuizQuestionReportDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
          
        queryResult.forEach((entity:any)=>{
            entity = objectMapper(entity,quizMapperDto.quizQuestionReportMapper); // mapping to camel case

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



  // endpoint to get quiz score report
  @Get("/getQuizScoreReport/:pageSize/:pageNumber")
  async getQuizScoreReport(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request): Promise<ResponseModel<QuizScoreReportDto>>{
    try {
      console.log("getQuizScoreReport ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
     //  requestModel.Filter.PageInfo.PageSize = pageSize;
     //  requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let given_children_array = requestModel.Children;
      let communityId : number = null;
      let startDate : string,endDate : string;
      let memberIds : string;
      let allGroups : boolean;
      let allMembers : boolean;
       
      // EXTRACTING FIELDS FROM REQUEST MODEL QUERY
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
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
       }
    })
 
         //applying query on retrieved data fields 
         let queryResult = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_quiz_score_report(${communityId},
                                                                           '${startDate}','${endDate}','${memberIds}',${allGroups}, ${allMembers},
                                                                            ${pageNumber},${pageSize})`);     
         let final_result_updated = [];
         let result:ResponseModel<QuizScoreReportDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
           
         queryResult.forEach((entity:any)=>{
             entity = objectMapper(entity,quizMapperDto.quizScoreReportMapper); // mapping to camel case
 
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


  // endpoint to get poll report
  @Get("/getPollReport/:pageSize/:pageNumber")
  async getPollReport(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request): Promise<ResponseModel<PollReportDto>>{
    try {
      console.log("getPollReport ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
     //  requestModel.Filter.PageInfo.PageSize = pageSize;
     //  requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let given_children_array = requestModel.Children;
      let communityId : number = null;
      let startDate : string,endDate : string;
      let memberIds : string;
      let allGroups : boolean;
      let allMembers : boolean;
       
      // EXTRACTING FIELDS FROM REQUEST MODEL QUERY
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
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
       }
    })
 
         //applying query on retrieved data fields 
         let queryResult = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_poll_report(${communityId},
                                                                           '${startDate}','${endDate}','${memberIds}',${allGroups}, ${allMembers},
                                                                            ${pageNumber},${pageSize})`);     
         let final_result_updated = [];
         let result:ResponseModel<PollReportDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
           
         queryResult.forEach((entity:any)=>{
             entity = objectMapper(entity,pollMapperDto.pollReportMapper); // mapping to camel case
 
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


  

  // endpoint to get Pending completion report
  @Get("/getPendingCompletionReport/:pageSize/:pageNumber")
  async getPendingCompletionReport(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request): Promise<ResponseModel<PendingCompletionReportDto>>{
    try {
      console.log("getPendingCompletion ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
     //  requestModel.Filter.PageInfo.PageSize = pageSize;
     //  requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let given_children_array = requestModel.Children;
      let communityId : number = null;
      let startDate : string,endDate : string;
      let memberIds : string;
      let allGroups : boolean;
      let allMembers : boolean;
       
      // EXTRACTING FIELDS FROM REQUEST MODEL QUERY
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
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
       }
    })
 
         //applying query on retrieved data fields 
         let queryResult = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_pending_completion_report(${communityId},
                                                                           '${startDate}','${endDate}','${memberIds}',${allGroups}, ${allMembers},
                                                                            ${pageNumber},${pageSize})`);     
         let final_result_updated = [];
         let result:ResponseModel<PendingCompletionReportDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
           
         queryResult.forEach((entity:any)=>{
             entity = objectMapper(entity,pendingCompletionMapperDto.pendingCompletionReportMapper); // mapping to camel case
 
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

  

  // endpoint to get Top lesson Analytics
  @Get("/getTopLessons/:pageSize/:pageNumber")
  async getTopLessons(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request): Promise<ResponseModel<TopLessonDto>>{
    try {
      console.log("getTopLessons ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
     //  requestModel.Filter.PageInfo.PageSize = pageSize;
     //  requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let given_children_array = requestModel.Children;
      let communityId : number = null;
      let channelId : number = null;
      let userId = null,userRole = null;
      let startDate,endDate;
       
      // EXTRACTING FIELDS FROM REQUEST MODEL QUERY
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
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
         case 'channelId' :
           channelId = condition.FieldValue;
           break;
         case 'userId' :
            userId = condition.FieldValue;
            break;
         case 'roleIds' :
            userRole = parseInt(condition.FieldValue.split(',')[0]);
            break;        
       }
    })
 
         //applying query on retrieved data fields 
         let queryResult = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_top_lessons(${communityId},${channelId},'${startDate}','${endDate}',${userId},${userRole},${pageNumber},${pageSize})`);     
         let final_result_updated = [];
         let result:ResponseModel<TopLessonDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
           
         queryResult.forEach((entity:any)=>{
             entity = objectMapper(entity,mapperDto.topLessonMapper); // mapping to camel case
 
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


  // endpoint to get Top lessons daywise Analytics
  @Get("/getTopLessonsDaywise/:pageSize/:pageNumber")
  async getTopLessonsDaywise(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request): Promise<ResponseModel<TopLessonDaywiseDto>>{
    try {
      console.log("getTopLessonsDaywise ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
     //  requestModel.Filter.PageInfo.PageSize = pageSize;
     //  requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let given_children_array = requestModel.Children;
      let communityId : number = null;
      let channelId : number = null;
      let userId=null,userRole=null;
      let startDate,endDate;
       
      // EXTRACTING FIELDS FROM REQUEST MODEL QUERY
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
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
         case 'userId' :
            userId = condition.FieldValue;
            break;
         case 'roleIds' :
            userRole = parseInt(condition.FieldValue.split(',')[0]);
            break;         
         
       }
    })
 
         //applying query on retrieved data fields 
         let queryResult = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_top_lessons_day_wise(${communityId},'${startDate}','${endDate}',${userId},${userRole},${pageNumber},${pageSize})`);     
         let final_result_updated = [];
         let result:ResponseModel<TopLessonDaywiseDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
           
         queryResult.forEach((entity:any)=>{
             entity = objectMapper(entity,mapperDto.topLessonDaywiseMapper); // mapping to camel case
 
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


  // endpoint to get Top lessons daily engagement Analytics
  @Get("/getDailyEngagement/:pageSize/:pageNumber")
  async getDailyEngagement(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request): Promise<ResponseModel<LessonDailyEngagementDto>>{
    try {
      console.log("getLessonsDailyEngagement ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
     //  requestModel.Filter.PageInfo.PageSize = pageSize;
     //  requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let given_children_array = requestModel.Children;
      let communityId : number = null;
      let channelId : number = null;
      let startDate,endDate;
      let userId=null,userRole=null;
       
      // EXTRACTING FIELDS FROM REQUEST MODEL QUERY
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
       switch(condition.FieldName){
         case 'communityId':
           communityId = condition.FieldValue;
           break;
         case 'channelId':
           channelId = condition.FieldValue;
           break;  
         case 'startDate' :
            startDate = condition.FieldValue;
            break;
         case 'endDate' :
            endDate = condition.FieldValue;
            break;
         case 'userId' :
            userId = condition.FieldValue;
            break;
         case 'roleIds' :
            userRole = parseInt(condition.FieldValue.split(',')[0]);
            break;     
         
       }
    })
 
         //applying query on retrieved data fields 
         let queryResult = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_top_lessons_daily_engagement(${communityId},${channelId},'${startDate}','${endDate}',${userId},${userRole},${pageNumber},${pageSize})`);     
         let final_result_updated = [];
         let result:ResponseModel<LessonDailyEngagementDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
           
         queryResult.forEach((entity:any)=>{
             entity = objectMapper(entity,mapperDto.lessonDailyEngagementMapper); // mapping to camel case
 
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


  // endpoint to get Top lessons weekly engagement Analytics
  @Get("/getWeeklyEngagement/:pageSize/:pageNumber")
  async getWeeklyEngagement(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request): Promise<ResponseModel<LessonWeeklyEngagementDto>>{
    try {
      console.log("getLessonsWeeklyEngagement ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
     //  requestModel.Filter.PageInfo.PageSize = pageSize;
     //  requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let given_children_array = requestModel.Children;
      let communityId : number = null;
      let channelId : number = null;
      let startDate,endDate;
      let userId=null,userRole=null;
       
      // EXTRACTING FIELDS FROM REQUEST MODEL QUERY
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
       switch(condition.FieldName){
         case 'communityId':
           communityId = condition.FieldValue;
           break;
         case 'channelId':
           channelId = condition.FieldValue;
           break;  
         case 'startDate' :
            startDate = condition.FieldValue;
            break;
         case 'endDate' :
            endDate = condition.FieldValue;
            break;
         case 'userId' :
            userId = condition.FieldValue;
            break;
         case 'roleIds' :
            userRole = parseInt(condition.FieldValue.split(',')[0]);
            break;    
         
       }
    })
 
         //applying query on retrieved data fields 
         let queryResult = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_top_lessons_weekly_engagement(${communityId},${channelId},'${startDate}','${endDate}',${userId},${userRole},${pageNumber},${pageSize})`);     
         let final_result_updated = [];
         console.log(JSON.stringify(queryResult));
         let result:ResponseModel<LessonWeeklyEngagementDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
           
         queryResult.forEach((entity:any)=>{
             entity = objectMapper(entity,mapperDto.lessonWeeklyEngagementMapper); // mapping to camel case
             console.log(JSON.stringify(entity));
             console.log("-----------------------------")
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




  @Get('/getTopLearners/:pageSize/:pageNumber')
  async getTopLearnersByChannnelId(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request):Promise<any>{
    try {
      console.log("Inside getTopLearnersByChannnelId ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let communityId:number,channelId:number = null,groupId:number = null;
      let finalResult:ResponseModel<LessonDto> = new ResponseModel("SampleInbuiltRequest",[],null,"200",null,null,null,"SampleSocketId","CommunityUrl")

      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
        switch(condition.FieldName){
          case 'communityId':
            communityId = condition.FieldValue;
            break;
          case 'channelId' :
            channelId = condition.FieldValue;
            break;
          case 'groupId' :
            groupId = condition.FieldValue;
            break;  
        }

      })
      let result = await this.lessonFacade.genericRepository.query(`SELECT * from public.fn_get_top_learners(${communityId},${channelId},${groupId},${requestModel.Filter.PageInfo.PageNumber}, ${requestModel.Filter.PageInfo.PageSize})`);
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
       //code for notification
       //code for notification lessonAdded
      let createLessonSuccessResult:RequestModel<NotificationDto> = new RequestModel();
      createLessonSuccessResult.CommunityId = body.CommunityId;
      createLessonSuccessResult.CommunityUrl = body.CommunityUrl;
      createLessonSuccessResult.DataCollection = []
      createLessonSuccessResult.SocketId = body.SocketId;
      createLessonSuccessResult.RequestGuid = body.RequestGuid;
      result.getDataCollection().map(async (lesson: LessonDto)=>{
        //retrieve userIds of all members of the channel
        let courseDetails : ResponseModel<LessonDto> = await this.lessonFacade.getParentId(["lesson","section","channel"],lesson.Id);
        let channelId = (courseDetails.getDataCollection()[0].section)?courseDetails.getDataCollection()[0].section.channelId:null;
        let streamName = (courseDetails.getDataCollection()[0].section)?courseDetails.getDataCollection()[0].section.sectionType:"dummy name";
        let channelName = (courseDetails.getDataCollection()[0].section)?courseDetails.getDataCollection()[0].section.channel.title:"dummy title";
        console.log("ChannelId",JSON.stringify(channelId))
      if(channelId != null){
        let pageSize: number = 1000,pageNumber: number = 1;
        let userIds: number[] = await this.channelGroupFacade.getUserIdsByChannelId([channelId],pageSize,pageNumber);
        console.log("Email ids are....",userIds);   
        userIds.map(async (userId: number)=>{
          let lessonNotificationData = {
            "lessonId" : lesson.Id,
            "lessonTitle" : lesson.title,
            "streamName" : streamName,
            "channelName" : channelName
          }
          
          await this.lessonFacade.createNotification(userId,null,Label.newLesson,NotificationType.email,lesson.CreationDate,lessonNotificationData)
        })
      } 
        
       })

      
      
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
      let updateResult = await this.lessonFacade.updateEntity(body);
      body.DataCollection.map(async (lesson:LessonDto)=>{
        let notification:NotificationDto = new NotificationDto();
        let inviteUserSuccessResult: RequestModel<NotificationDto> = new RequestModel();
        
        //code for invite collaborator notification
        if(lesson.collaborators != null){
          let previousCollaborators = (await this.getAllProductsByIds(lesson.Id)).getDataCollection()[0].collaborators;
          let updatedCollaborator : number[] = lesson.collaborators;
          let extraCollaborators : number[] = updatedCollaborator.filter(x => previousCollaborators.indexOf(x)=== -1);
          extraCollaborators.forEach(async (id: number)=>{
            let userDetails = await this.utilityFacade.getUserDetails([id]);
            console.log("user details is ..............................")
            console.log(userDetails);
            notification.userId = id;
            notification.label = Label.inviteCollaborator;
            notification.notificationType = NotificationType.email;
            notification.dateTime = lesson.ModifiedDate;
            notification.notificationData = {"lessonOrCourseId":lesson.Id,"authorName":userDetails.DataCollection[0].userName,"lessonOrCourseName":lesson.title}
            inviteUserSuccessResult.DataCollection.push(notification);
            console.log("succesfully prepared notification object............",inviteUserSuccessResult)
            this.sns_sqs.publishMessageToTopic("NOTIFICATION_ADD",inviteUserSuccessResult);
            console.log("pushing notification to aws");
          })  
        }//end of notification collaborator code
         
        //code for lesson featured notification

        let userIds: number[] = [];
        let pageSize = 1000,pageNumber = 1;
        
        let result = await this.sectionFacade.getChannelIdsBySectionIds([lesson.sectionId],pageSize,pageNumber);
        let channelIds: number[] = [];
        result.map((data: SectionDto)=>{
            channelIds.push(data.channelId);
        })
        channelIds.map(async (channelId: number)=>{
          let userId = (await this.channelGroupFacade.getUserIdsByChannelId([channelId],pageSize,pageNumber))
          userIds.push(userId[0]); 
        })
        if(lesson.isFeatured){
          userIds.map((userId: number,index)=>{
           let lessonFeaturedNotificationData = {
              "lessonId" : lesson.Id,
              "lessonTitle" : lesson.title,
              "channelName" : result[0].title,
              "lessonLink" : `https://${body.CommunityUrl}/channels/${lesson.Id}`
            }
            this.lessonFacade.createNotification(userId,null,Label.lessonFeatured,NotificationType.email,lesson.CreationDate,lessonFeaturedNotificationData)             
          })
          
        }
        //end of lesson featured notification

        //code for lessonRejected notification
        

      })
      
      
      //CODE FOR NOTIFICATION SERVICE INVOKING
      // let lessonUpdates = body.DataCollection;
      // lessonUpdates.map((lesson:LessonDto)=>{
      //   lesson.lessonData.map((lessonData: LessonDataDto)=>{
      //       lessonData.lessonDataReview.map()
      //   })
      // })
      return updateResult;

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