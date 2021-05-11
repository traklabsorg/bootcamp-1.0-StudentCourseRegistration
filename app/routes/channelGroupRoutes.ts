import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { ChannelGroupDto } from 'app/smartup_dtos/ChannelGroupDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { ChannelGroupFacade } from 'app/facade/channelGroupFacade';
import { plainToClass } from 'class-transformer';
// import { RequestModel } from ''submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
// let dto_maps = require('../smartup_dtos/ChannelGroupDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
// import { ChannelGroupDto } from '../../submodules/platform-3.0-Dtos/channelGroupDto';
import { ChannelGroupDto, ChannelUsersByGroupDto } from '../../submodules/platform-3.0-Dtos/channelGroupDto';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';
import { Condition } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/condition';
import { ServiceOperationResultType } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ServiceOperationResultType';
import { LessonFacade } from 'app/facade/lessonFacade';
import { UtilityFacade } from 'app/facade/utilityFacade';
import { ConditionalOperation } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/conditionOperation';
let mapperDto = require('../../submodules/platform-3.0-Mappings/channelGroupMapper');


@Controller('channelGroup')
export class ChannelGroupRoutes{

  constructor(private channelGroupFacade: ChannelGroupFacade,private lessonFacade: LessonFacade,
              private utilityFacade: UtilityFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['CHANNELGROUP_ADD','CHANNELGROUP_UPDATE','CHANNELGROUP_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];
  private channel_group_children_array = ["group","channel"];
  
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
            let responseModelOfChannelGroupDto: ResponseModel<ChannelGroupDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'CHANNELGROUP_ADD':
                console.log("Inside CHANNELGROUP_ADD Topic");
                responseModelOfChannelGroupDto = await this.createChannelGroup(result["message"]);
                break;
              case 'CHANNELGROUP_UPDATE':
                console.log("Inside CHANNELGROUP_UPDATE Topic");
               responseModelOfChannelGroupDto = await this.updateChannelGroup(result["message"]);
                break;
              case 'CHANNELGROUP_DELETE':
                console.log("Inside CHANNELGROUP_DELETE Topic");
                responseModelOfChannelGroupDto = await this.deleteChannelGroup(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of channelGroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfChannelGroupDto: RequestModel<ChannelGroupDto> = result["message"];
            responseModelOfChannelGroupDto.setSocketId(requestModelOfChannelGroupDto.SocketId)
            responseModelOfChannelGroupDto.setCommunityUrl(requestModelOfChannelGroupDto.CommunityUrl);
            responseModelOfChannelGroupDto.setRequestId(requestModelOfChannelGroupDto.RequestGuid);
            responseModelOfChannelGroupDto.setStatus(new Message("200", "ChannelGroup Inserted Successfully", null));

            // let responseModelOfChannelGroupDto = this.channelUserFacade.create(result["message"]);

            // result["message"].DataCollection = responseModelOfChannelGroupDto.DataCollection;
            //this.creategroup(result["message"])
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, responseModelOfChannelGroupDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<ChannelGroupDto> = new ResponseModel<ChannelGroupDto>(null,null,null,null,null,null,null,null,null);
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


  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......group");
      return this.channelGroupFacade.getAll();
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
  //     let result = await this.channelGroupFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     console.log("Error is....." + error);
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<ChannelGroupDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.channelGroupFacade.getByIds([id]);
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
      let isSubset = given_children_array.every(val => this.channel_group_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.channel_group_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if (!isSubset) {
        console.log("Inside Condition.....")
        requestModel.Children = this.channel_group_children_array;
      }
      if(requestModel.Children.indexOf('channelUser')<=-1)
        requestModel.Children.unshift('channelUser');
      let result = await this.channelGroupFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get("/findAllChannelGroupOfAParticularChannel/:pageSize/:pageNumber")
  async findAllChannelGroupOfAParticularChannel(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request) {
    try {
      console.log("Inside controller ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let result:ResponseModel<ChannelGroupDto> = new ResponseModel("SampleInbuiltRequest",[],null,"200",null,null,null,"SampleSocketId","CommunityUrl")
      let dataCollection = [];
      let channelIdsAsText = "";
      let communityId,channelId,groupId;
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
        console.log("condition.FieldName.toLowerCase()...",condition.FieldName.toLowerCase());
        switch(condition.FieldName.toLowerCase()){
          case "communityid":
            communityId = condition.FieldValue 
            break 
          case "groupid":
            groupId = condition.FieldValue
            break 
          case "channelid":
            channelId = condition.FieldValue;
            channelIdsAsText = channelIdsAsText + channelId + ",";
            break 
        }
      })
      if(channelIdsAsText.includes(',')){
        channelIdsAsText = channelIdsAsText.slice(0,-1);
        channelIdsAsText = "'" + channelIdsAsText + "'";      // keep this here only , ad channelIdsAsText can also be null
      }
      else{
        channelIdsAsText = null;
      }
      console.log(channelIdsAsText)
      // requestModel.Filter.Conditions.forEach(async (condition:Condition)=>{
      //   let final_result = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_get_channels_groups(${communityId},${channelId},${groupId},${requestModel.Filter.PageInfo.PageNumber},${requestModel.Filter.PageInfo.PageSize})`)
      //   dataCollection.push(final_result);
      // })
      let final_result = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_get_channels_groups(${communityId},${channelIdsAsText},${groupId},${requestModel.Filter.PageInfo.PageNumber},${requestModel.Filter.PageInfo.PageSize})`)
      let final_result_updated = []
      // dataCollection.push(final_result);
      final_result.forEach((entity:any)=>{
        entity = objectMapper(entity,mapperDto.channelGroupBasedOnChannelMapper)
        final_result_updated.push(entity)
      })
      result.setDataCollection(final_result_updated);
      
      // this.sns_sqs.publishMessageToTopic("GROUP_ADDED",{success:body})  // remove from here later
      return result;
      // return null;
    } catch (error) {
      console.log("Error is....." + error);
      // this.sns_sqs.publishMessageToTopic("ERROR_RECEIVER",{error:error})
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("/getPublishedSectionLessonWithUserProgress/:pageSize/:pageNumber")
  async getPublishedSectionLessonWithUserProgress(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber:number,@Req() req:Request){
    try{
      console.log("Inside Controller ......group by pageSize & pageNumber");
      let requestModel:RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;

      let result:ResponseModel<ChannelGroupDto> = new ResponseModel("SampleInbuiltRequest",[],null,"200",null,null,null,"SampleSocketId","CommunityUrl");
      let dataCollection = [];
      let communityId=null,channelIds=null,userId=null;
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
        console.log("condition is......",condition);
        switch(condition.FieldName.toLowerCase()){
          case "communityid":
            communityId = condition.FieldValue;
            break ;
          case "channelids":
            channelIds = condition.FieldValue;
            break;
          case "userid":
            userId = condition.FieldValue;
            break;
        }
      })
      let finalResult = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_get_published_section_lesson_with_user_progress(${communityId},'${channelIds}',${userId},${requestModel.Filter.PageInfo.PageNumber},${requestModel.Filter.PageInfo.PageSize})`)
      let final_result_updated = [];
      finalResult.forEach((entity:any)=>{
        final_result_updated.push(entity);
      })
      result.setDataCollection(final_result_updated);
      return result;
    }
    catch(error){
      console.log("Error is..................",error);
      throw new HttpException(error,HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }


  @Get("/getPublishedSectionLessonWithSpecificUserProgress/:pageSize/:pageNumber")
  async getPublishedSectionLessonWithSpecificUserProgress(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber:number,@Req() req:Request){
    try{
      console.log("Inside Controller ......group by pageSize & pageNumber");
      let requestModel:RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;

      let result:ResponseModel<ChannelGroupDto> = new ResponseModel("SampleInbuiltRequest",[],null,"200",null,null,null,"SampleSocketId","CommunityUrl");
      let dataCollection = [];
      let communityId=null,channelIds=null,userId=null;
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
        console.log("condition is......",condition);
        switch(condition.FieldName.toLowerCase()){
          case "communityid":
            communityId = condition.FieldValue;
            break ;
          case "channelids":
            channelIds = condition.FieldValue;
            break;
          case "userid":
            userId = condition.FieldValue;
            break;
        }
      })
      let finalResult = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_get_published_section_lesson_with_specific_user_progress(${communityId},'${channelIds}',${userId},${requestModel.Filter.PageInfo.PageNumber},${requestModel.Filter.PageInfo.PageSize})`)
      let final_result_updated = [];
      finalResult.forEach((entity:any)=>{
        final_result_updated.push(entity);
      })
      result.setDataCollection(final_result_updated);
      return result;
    }
    catch(error){
      console.log("Error is..................",error);
      throw new HttpException(error,HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  @Get("/getPublishedSectionLessonWithNonNegativeUserProgress/:pageSize/:pageNumber")
  async getPublishedSectionLessonWithNonNegativeUserProgress(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber:number,@Req() req:Request){
    try{
      console.log("Inside Controller ......group by pageSize & pageNumber");
      let requestModel:RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;

      let result:ResponseModel<ChannelGroupDto> = new ResponseModel("SampleInbuiltRequest",[],null,"200",null,null,null,"SampleSocketId","CommunityUrl");
      let dataCollection = [];
      let communityId=null,channelIds=null,userId=null;
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
        console.log("condition is......",condition);
        switch(condition.FieldName.toLowerCase()){
          case "communityid":
            communityId = condition.FieldValue;
            break ;
          case "channelids":
            channelIds = condition.FieldValue;
            break;
          case "userid":
            userId = condition.FieldValue;
            break;
        }
      })
      let finalResult = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_get_published_section_lesson_with_specific_user_progress(${communityId},'${channelIds}',${userId},${requestModel.Filter.PageInfo.PageNumber},${requestModel.Filter.PageInfo.PageSize})`)
      // query to get all lessons in the given section with required fields 
      let query = `Select    lessons.id as lesson_id, 
                              sections.id as section_id,
                              channels.title as channel_title,
                              sections.title as section_title, 
                              lessons.title as lesson_title,
                              sections.section_type,
                              (CAST (lessons.content_details->>'coverImage' as json) ->> 'ImageSrc') as cover_image_url 
                              from 
                              public."lessons" lessons join
                              public."sections" sections on (sections.id = lessons.section_id) join
                              public."channels" channels on (channels.id = sections.channel_id)
                              where channels.id in (${channelIds}) and channels.community_id = ${communityId}
                              and sections."is_Hidden" = false`;
      let allLessons = await this.channelGroupFacade.genericRepository.query(query);
      //console.log("Result of new query is.......",allLessons);                    
      // let givenChannelIds = channelIds.split(",");

       //code for filtering out published lessons
       let lessonRequestModel: RequestModelQuery = new RequestModelQuery();
       lessonRequestModel.Children = ['lesson'];
       lessonRequestModel.Filter.Conditions = [];
       allLessons.forEach(lesson => {
         let isPresent = finalResult.find(result=>result.lesson_id == lesson.lesson_id);
         if(!isPresent){
           let condition:Condition = new Condition();
           condition.FieldName = 'Id';
           condition.FieldValue = lesson.lesson_id;
           condition.ConditionalSymbol = ConditionalOperation.Or;
           lessonRequestModel.Filter.Conditions.push(condition);
         }
 
       })
       
       let custom_section_children_array = [['lesson','lessonData'],['lessonData','lessonDataUser'],['lessonData','lessonDataReview']];
       let publishedLessonResult = await this.lessonFacade.search(lessonRequestModel,true,custom_section_children_array);
       let final_publishedLessonResult = await this.utilityFacade.assignIsPublishedFieldsToLesson(publishedLessonResult,true);
       //console.log("published lessons......",JSON.stringify(publishedLessonResult.getDataCollection()[0]))
       //end of code for filtering published lessons
      
      //finally applying the published lesson filter on the allLessons obtained 
      allLessons.forEach(lesson => {
        let isPresent = finalResult.find(result=>result.lesson_id == lesson.lesson_id);
        let isPublished = final_publishedLessonResult.getDataCollection().find(result=>result.Id == lesson.lesson_id && result.isPublished == true)
        if(!isPresent && isPublished){
          //check whether the lesson is published or not
          //end of code to check lesson published
          lesson.user_progress_sections = 0;
          lesson.user_progress_lessons = 0;
          lesson.user_read_count_lessons = 0;
          lesson.user_image_url = (finalResult.length)?finalResult[0].user_image_url:null;
          lesson.user_id = userId;
          lesson.user_name = (finalResult.length)?finalResult[0].user_name:null;
          finalResult.push(lesson);
        }
        
      });
      
     
      
      
      
      let final_result_updated = [];

      finalResult.forEach((lesson:any)=>{
        
        final_result_updated.push(lesson);
      })
      result.setDataCollection(final_result_updated);
      return result;
    }
    catch(error){
      console.log("Error is..................",error);
      throw new HttpException(error,HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  @Get("/findAllManagedContentOfAParticularChannel/:pageSize/:pageNumber")
  async findAllManagedContentOfAParticularChannel(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request) {
    try {
      console.log("Inside controller ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let result:ResponseModel<ChannelGroupDto> = new ResponseModel("SampleInbuiltRequest",[],null,"200",null,null,null,"SampleSocketId","CommunityUrl")
      let dataCollection = [];
      let communityId=null,channelIds=null,userId=null,type=null,publicationType=null;
      requestModel.Filter.Conditions.forEach((condition:Condition)=>{
        console.log("condition.FieldName.toLowerCase()...",condition.FieldName.toLowerCase());
        switch(condition.FieldName.toLowerCase()){
          case "communityid":
            communityId = condition.FieldValue
            break 
          case "userid":
            userId = condition.FieldValue
            break 
          case "channelids":
            channelIds = condition.FieldValue
            break 
          case "type":
            type = condition.FieldValue
          case "publicationtype":
            publicationType = condition.FieldValue
          
        }
      })

      // requestModel.Filter.Conditions.forEach(async (condition:Condition)=>{
      //   let final_result = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_get_channels_groups(${communityId},${channelId},${groupId},${requestModel.Filter.PageInfo.PageNumber},${requestModel.Filter.PageInfo.PageSize})`)
      //   dataCollection.push(final_result);
      // })
      type = 'stream'; 
      let stream_result = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_get_managed_content(${communityId},'${channelIds}',${userId},'${type}','${publicationType}',${requestModel.Filter.PageInfo.PageNumber},${requestModel.Filter.PageInfo.PageSize})`)
      type = 'course';
      let course_result = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_get_managed_content(${communityId},'${channelIds}',${userId},'${type}','${publicationType}',${requestModel.Filter.PageInfo.PageNumber},${requestModel.Filter.PageInfo.PageSize})`)
      let final_result_updated = []
      // dataCollection.push(final_result);
      stream_result.forEach((entity:any)=>{
        // entity = objectMapper(entity,mapperDto.managedContentBasedOnChannelMapper)
        final_result_updated.push(entity)
      })
      course_result.forEach((entity:any)=>{
        // entity = objectMapper(entity,mapperDto.managedContentBasedOnChannelMapper)
        final_result_updated.push(entity)
      })
      result.setDataCollection(final_result_updated);
      
      // this.sns_sqs.publishMessageToTopic("GROUP_ADDED",{success:body})  // remove from here later
      return result;
      // return null;
    } catch (error) {
      console.log("Error is....." + error);
      // this.sns_sqs.publishMessageToTopic("ERROR_RECEIVER",{error:error})
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
  //     let isSubset = given_children_array.every(val => this.channel_group_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.channel_group_children_array.filter(el => el === val).length);
  //     console.log("isSubset is......" + isSubset);
  //     if (!isSubset) {
  //       console.log("Inside Condition.....")
  //       requestModel.Children = this.channel_group_children_array;
  //     }
  //     if(requestModel.Children.indexOf('channelGroup')<=-1)
  //       requestModel.Children.unshift('channelGroup');
  //     let result = await this.channelGroupFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // @Post("/") 
  // async createChannelGroup(@Body() body:RequestModel<ChannelGroupDto>): Promise<ResponseModel<ChannelGroupDto>> {  //requiestmodel<ChannelGroupDto></ChannelGroupDto>....Promise<ResponseModel<Grou[pDto>>]
  //   try {
  //     await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
  //     let result = await this.channelGroupFacade.create(body);
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
  async createChannelGroup(@Body() body:any): Promise<ResponseModel<ChannelGroupDto>> {  //requiestmodel<ChannelGroupDto></ChannelGroupDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result:ResponseModel<ChannelGroupDto> = new ResponseModel(body.RequestGuid,[],null,"200",null,null,null,body.SocketId,body.CommunityUrl)
      let dataCollection = []
      body.DataCollection.forEach(async (dto:ChannelGroupDto)=>{
        let final_result = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_add_channels_group(${body.CommunityId},${dto.channelId},${dto.groupId})`)
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
  async updateChannelGroup(@Body() body:RequestModel<ChannelGroupDto>): Promise<ResponseModel<ChannelGroupDto>> {  //requiestmodel<ChannelGroupDto></ChannelGroupDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.channelGroupFacade.updateEntity(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get("/expt/query1")
  // async func2(): Promise<any>{
  //   this.channelGroupFacade.getGroupRequestModel();
  //   return null;
  // }

  // @Delete('/')
  // deleteChannelGroup(@Body() body:RequestModel<ChannelGroupDto>): Promise<ResponseModel<ChannelGroupDto>>{
  //   try {
  //     let delete_ids :Array<number> = [];
  //     body.DataCollection.forEach((entity:ChannelGroupDto)=>{
  //       delete_ids.push(entity.Id);
  //     })
  //     console.log("Ids are......",delete_ids);
  //     return this.channelGroupFacade.deleteById(delete_ids);
  //       } catch (error) {
  //         throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //       }
  // }

  @Delete('/')
  async deleteChannelGroup(@Body() body:any):Promise<ResponseModel<ChannelGroupDto>>{
    try {
      await console.log("Inside DeleteProduct of controller....body id" + JSON.stringify(body));
      let result:ResponseModel<ChannelGroupDto> = new ResponseModel(body.RequestGuid,[],null,"200",null,null,null,body.SocketId,body.CommunityUrl)
      let dataCollection = []
      body.DataCollection.forEach(async (dto:ChannelGroupDto)=>{
        let final_result = await this.channelGroupFacade.genericRepository.query(`SELECT * FROM public.fn_delete_channels_groups(${body.CommunityId},${dto.channelId},${dto.groupId})`)
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

  @Get("/count/findRecord/all")
  async getCount(@Req() req:Request) {
    try {
      console.log("Inside controller123 ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      let given_children_array = requestModel.Children;
      let isSubset = given_children_array.every(val => this.channel_group_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.channel_group_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if ( !isSubset || given_children_array.length==0) {
        console.log("Inside Condition.....")
        requestModel.Children = this.channel_group_children_array;
      }
      if(requestModel.Children.indexOf('channelGroup')<=-1)
        requestModel.Children.unshift('channelGroup');
      console.log("\n\n\n\nRequestModel inside routes is....." + JSON.stringify(requestModel));
      var result = await this.channelGroupFacade.getCountByConditions(requestModel);
      // let result = await this.groupUserFacade.search(requestModel);
      return result;
    } catch (error) {
      console.log("Error is....." + JSON.stringify(error));
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //Get channel users by group
  @Get('/getChannelUsersByGroup/:pageSize/:pageNumber')
  async getChannelUsersByGroup(@Param('pageSize') pageSize : number,@Param('pageNumber') pageNumber : number,@Req() req:Request ):Promise<ResponseModel<ChannelUsersByGroupDto>>{
     try{
      
      
      let communityId: number = null,channelId: number = null,groupId: number = null;
      let requestModelQuery: RequestModelQuery = JSON.parse(req.headers.requestmodel.toString());
      requestModelQuery.Filter.PageInfo.PageSize = pageSize;
      requestModelQuery.Filter.PageInfo.PageNumber = pageNumber;
      
    requestModelQuery.Filter.Conditions.map((condition: Condition)=>{
      switch(condition.FieldName.toLowerCase()){
        case "communityid": communityId = condition.FieldValue;
        break;
        case "channelid": channelId = condition.FieldValue;
        break;
        case "groupid": groupId = condition.FieldValue;
        break;
      }
    })
    //applying query on retrieved data fields 
     let queryResult = await this.channelGroupFacade.genericRepository.query(`Select * from public.fn_get_channels_users_by_group(${communityId},${channelId},${groupId},${pageNumber},${pageSize})`);     
     console.log(queryResult);
     let final_result_updated = [];
     let result:ResponseModel<ChannelUsersByGroupDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null)
      
     queryResult.forEach((entity:any)=>{
        entity = objectMapper(entity,mapperDto.channelUsersByGroupMapper); // mapping to camel case
        final_result_updated.push(entity)
      })
      result.setDataCollection(final_result_updated);
     return result;
        
     }
     catch (error) {
      console.log("Error is....." + JSON.stringify(error));
      let errorResult: ResponseModel<ChannelUsersByGroupDto> = new ResponseModel<ChannelUsersByGroupDto>(null,null,null,null,null,null,null,null,null);
      errorResult.setStatus(new Message("500",error,null));
      return errorResult;
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  // @Get("/a/b/c/d/e")
  // async func(){
  //   let result1 = await this.channelGroupFacade.findAllUsersInAGroupSubscribedToAChannel([1,2,3,4,5,6,7,8,9,10]);
  //   return result1;
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