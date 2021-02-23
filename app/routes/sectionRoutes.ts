import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { SectionDto } from 'app/smartup_dtos/SectionDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { SectionFacade } from 'app/facade/sectionFacade';
import { plainToClass } from 'class-transformer';
// import { RequestModel } from ''submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
// let dto_maps = require('../smartup_dtos/SectionDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { SectionDto } from '../../submodules/platform-3.0-Dtos/sectionDto';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';
import { LessonFacade } from '../facade/lessonFacade';
import { Condition } from '../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/condition';


@Controller('section')
export class SectionRoutes{

  constructor(private sectionFacade: SectionFacade, private lessonFacade:LessonFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['SECTION_ADD','SECTION_UPDATE','SECTION_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];

  private section_children_array = ["channel"]
  
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
            let responseModelOfSectionDto: ResponseModel<SectionDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'SECTION_ADD':
                console.log("Inside SECTION_ADD Topic");
                responseModelOfSectionDto = await this.createSection(result["message"]);
                break;
              case 'SECTION_UPDATE':
                console.log("Inside SECTION_UPDATE Topic");
               responseModelOfSectionDto = await this.updateSection(result["message"]);
                break;
              case 'SECTION_DELETE':
                console.log("Inside SECTION_DELETE Topic");
                responseModelOfSectionDto = await this.deleteSection(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfSectionDto: RequestModel<SectionDto> = result["message"];
            responseModelOfSectionDto.setSocketId(requestModelOfSectionDto.SocketId)
            responseModelOfSectionDto.setCommunityUrl(requestModelOfSectionDto.CommunityUrl);
            responseModelOfSectionDto.setRequestId(requestModelOfSectionDto.RequestGuid);
            responseModelOfSectionDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            // let responseModelOfSectionDto = this.sectionFacade.create(result["message"]);

            // result["message"].DataCollection = responseModelOfSectionDto.DataCollection;
            //this.createSection(result["message"])
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, responseModelOfSectionDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<SectionDto> = new ResponseModel<SectionDto>(null,null,null,null,null,null,null,null,null);
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
  //   // this.createSection(payload);
  //   return true;
  // }


  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......group");
      return this.sectionFacade.getAll();
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
  //     let result = await this.sectionFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     console.log("Error is....." + error);
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<SectionDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.sectionFacade.getByIds([id]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("/findAllLessonRelatedDetailsWithAllReviewsBySectionId/:pageSize/:pageNumber")
  async findAllLessonRelatedDetailsWithAllReviewsBySectionId(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request):Promise<any>{
    try {
      console.log("Inside controller12345 ......group by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      // let given_children_array = requestModel.Children;
      // let isSubset = given_children_array.every(val => this.section_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.section_children_array.filter(el => el === val).length);
      // console.log("isSubset is......" + isSubset);
      // if (!isSubset) {
      //   console.log("Inside Condition.....")
      //   requestModel.Children = this.section_children_array;
      // }
      // if(requestModel.Children.indexOf('section')<=-1)
      //   requestModel.Children.unshift('section');
      let custom_section_children_array = [['section','lesson'],['lesson','lessonData'],['lessonData','lessonDataUser'],['lessonData','lessonDataReview']];
      let result = await this.sectionFacade.search(requestModel,true,custom_section_children_array);
      return result;
    } catch (error) {
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
      let custom_section_children_array = [['section','lesson'],['section','sectionReview'],['lesson','lessonData'],['lessonData','lessonDataUser'],['lessonData','lessonDataReview']];
      let result = await this.sectionFacade.search(requestModel,true,custom_section_children_array);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
  @Get("/findAllCommunitySections/:communityId")
  async findSections(@Param('communityId') id:string):Promise<any>{
    try {
      console.log("Id is......" + id);
      let childrenArray = ["section","channel","community"]
      let result  =  await this.sectionFacade.getChildrenIds(childrenArray,[parseInt(id, 10)],"lesson")
      let sectionIdArray = []
      result.getDataCollection().forEach((entity:any)=>{
        // let myJSON = {}
        // myJSON["lessonId"] = entity.Id;
        delete entity.channel;
        // sectionIdArray.push(entity);
        sectionIdArray.push(entity);
      })
      let newSectionIdArray = [];
      
      await Promise.all(sectionIdArray.map(async (entity:any)=>{
        let requestModel:RequestModelQuery = new RequestModelQuery();
        requestModel.Children = ["lesson"];
        let condition = new Condition();
        condition.FieldName = "sectionId";
        condition.FieldValue = entity.Id;
        requestModel.Filter.PageInfo.PageSize = 10000;
        requestModel.Filter.PageInfo.PageNumber = 1;
        requestModel.Filter.Conditions = [];
        requestModel.Filter.Conditions.push(condition);
        console.log("\n\n\n\n\n\n\n\nRequestModelQuery is........"+JSON.stringify(RequestModel)+"\n\n\n\n")
        let lessonResult = await this.lessonFacade.search(requestModel);
        // console.log("\n\n\n\n\nLesson Result is....."+JSON.stringify(lessonResult.getDataCollection())+"\n\n\n\n")
        entity.lesson =  lessonResult.getDataCollection();
        newSectionIdArray.push(entity);
        // console.log("\n\n\n\n\n\nNow...new SectionId array is......."+JSON.stringify(newSectionIdArray)+"\n\n\n\n");
        // console.log("\n\n\n\nNew Entity is....."+JSON.stringify(entity)+"\n\n\n\n")
        result.setDataCollection(newSectionIdArray);
        

      })
      )
      
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
      let isSubset = given_children_array.every(val => this.section_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.section_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if (!isSubset) {
        console.log("Inside Condition.....")
        requestModel.Children = this.section_children_array;
      }
      if(requestModel.Children.indexOf('section')<=-1)
        requestModel.Children.unshift('section');
      let result = await this.sectionFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createSection(@Body() body:RequestModel<SectionDto>): Promise<ResponseModel<SectionDto>> {  //requiestmodel<SectionDto></SectionDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.sectionFacade.create(body);
      // this.sns_sqs.publishMessageToTopic("SECTION_ADDED",{success:body})  // remove from here later
      return result;
      // return null;
    } catch (error) {
      await console.log("Error is....." + error);
      // this.sns_sqs.publishMessageToTopic("ERROR_RECEIVER",{error:error})
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateSection(@Body() body:RequestModel<SectionDto>): Promise<ResponseModel<SectionDto>> {  //requiestmodel<SectionDto></SectionDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.sectionFacade.updateEntity(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get("/expt/query1")
  // async func2(): Promise<any>{
  //   this.sectionFacade.getGroupRequestModel();
  //   return null;
  // }

  @Delete('/')
  deleteSection(@Body() body:RequestModel<SectionDto>): Promise<ResponseModel<SectionDto>>{
    try {
      let delete_ids :Array<number> = [];
      body.DataCollection.forEach((entity:SectionDto)=>{
        delete_ids.push(entity.Id);
      })
      console.log("Ids are......",delete_ids);
      return this.sectionFacade.deleteById(delete_ids);
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