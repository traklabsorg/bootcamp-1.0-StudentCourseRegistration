import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { SectionReviewDto } from 'app/smartup_dtos/SectionReviewDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { SectionReviewFacade } from 'app/facade/sectionReviewFacade';
import { plainToClass } from 'class-transformer';
// import { RequestModel } from ''submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
// let dto_maps = require('../smartup_dtos/SectionReviewDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
// import { SectionReviewDto } from '../../submodules/platform-3.0-Dtos/sectionReviewDto';
import { SectionReviewDto } from '../../submodules/platform-3.0-Dtos/sectionReviewDto';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';


@Controller('sectionReview')
export class SectionReviewRoutes{

  constructor(private sectionReviewFacade: SectionReviewFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['SECTIONREVIEW_ADD','SECTIONREVIEW_UPDATE','SECTIONREVIEW_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];
  private section_review_children_array = ["user","section"];
  
  onModuleInit() {
    // const requestPatterns = [
    //   'group-create'
    // ];
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        var value = this.topicArray[i];
        return async (result) => {
          await console.log("Result is........" + JSON.stringify(result));
          try {
            let responseModelOfSectionReviewDto: any = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'SECTIONREVIEW_ADD':
                console.log("Inside SECTIONREVIEW_ADD Topic");
                responseModelOfSectionReviewDto = this.createSectionReview(result["message"]);
                break;
              case 'SECTIONREVIEW_UPDATE':
                console.log("Inside SECTIONREVIEW_UPDATE Topic");
               responseModelOfSectionReviewDto = this.updateSectionReview(result["message"]);
                break;
              case 'SECTIONREVIEW_DELETE':
                console.log("Inside SECTIONREVIEW_DELETE Topic");
                responseModelOfSectionReviewDto = this.deleteSectionReview(result["message"]);
                break;
  
            }
  
            console.log("Result of aws  is...." + JSON.stringify(result));
            // let responseModelOfSectionReviewDto = this.userFacade.create(result["message"]);
  
            //this.creategroup(result["message"])
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, result)
            }
          }
          catch (error) {
            await console.log("Inside Catch.........");
            await console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, result);
            }
            
          }
        }
      })())
    }



    
    
  }

  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......group");
      return this.sectionReviewFacade.getAll();
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
  //     let result = await this.sectionReviewFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     console.log("Error is....." + error);
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<SectionReviewDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.sectionReviewFacade.getByIds([id]);
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
      let isSubset = given_children_array.every(val => this.section_review_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.section_review_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if (!isSubset) {
        console.log("Inside Condition.....")
        requestModel.Children = this.section_review_children_array;
      }
      if(requestModel.Children.indexOf('sectionReview')<=-1)
        requestModel.Children.unshift('sectionReview');
      let result = await this.sectionReviewFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createSectionReview(@Body() body:RequestModel<SectionReviewDto>): Promise<ResponseModel<SectionReviewDto>> {  //requiestmodel<SectionReviewDto></SectionReviewDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.sectionReviewFacade.create(body);
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
  async updateSectionReview(@Body() body:RequestModel<SectionReviewDto>): Promise<ResponseModel<SectionReviewDto>> {  //requiestmodel<SectionReviewDto></SectionReviewDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.sectionReviewFacade.updateEntity(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get("/expt/query1")
  // async func2(): Promise<any>{
  //   this.sectionReviewFacade.getGroupRequestModel();
  //   return null;
  // }

  @Delete('/')
  deleteSectionReview(@Body() body:RequestModel<SectionReviewDto>): Promise<ResponseModel<SectionReviewDto>>{
    try {
      let delete_ids :Array<number> = [];
      body.DataCollection.forEach((entity:SectionReviewDto)=>{
        delete_ids.push(entity.Id);
      })
      console.log("Ids are......",delete_ids);
      return this.sectionReviewFacade.deleteById(delete_ids);
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