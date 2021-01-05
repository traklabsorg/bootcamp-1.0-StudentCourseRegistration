import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { LessonDataUserDto } from 'app/smartup_dtos/LessonDataUserDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { LessonDataUserFacade } from 'app/facade/lessonDataUserFacade';
import { plainToClass } from 'class-transformer';
// import { RequestModel } from ''../../submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from '../../submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
// let dto_maps = require('../smartup_dtos/LessonDataUserDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from '../../submodules/platform-3.0-Framework/aws/models/SNS_SQS';
import { LessonDataUserDto } from '../../submodules/platform-3.0-Dtos/lessonDataUserDto';
import { RequestModelQuery } from '../../submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { RequestModel } from '../../submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';


@Controller('lessonDataUser')
export class LessonDataUserRoutes{

  constructor(private lessonDataUserFacade: LessonDataUserFacade) { }

  // private sns_sqs = SNS_SQS.getInstance();
  // private topicArray = ['LESSONDATAUSER_ADD','LESSONDATAUSER_UPDATE','LESSONDATAUSER_DELETE'];
  // private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];
  
  // onModuleInit() {
  //   // const requestPatterns = [
  //   //   'group-create'
  //   // ];
  //   for (var i = 0; i < this.topicArray.length; i++) {
  //     this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
  //       var value = this.topicArray[i];
  //       return async (result) => {
  //         await console.log("Result is........" + JSON.stringify(result));
  //         try {
  //           let responseModelOfGroupDto: any = null;
  //           console.log(`listening to  ${value} topic.....result is....`);
  //           // ToDo :- add a method for removing queue message from queue....
  //           switch (value) {
  //             case 'LESSONDATAUSER_ADD':
  //               console.log("Inside LESSONDATAUSER_ADD Topic");
  //               responseModelOfGroupDto = this.createLessonDataUser(result["message"]);
  //               break;
  //             case 'LESSONDATAUSER_UPDATE':
  //               console.log("Inside LESSONDATAUSER_UPDATE Topic");
  //             //  responseModelOfGroupDto = this.updateLessonDataUser(result["message"]);
  //               break;
  //             case 'LESSONDATAUSER_DELETE':
  //               console.log("Inside LESSONDATAUSER_DELETE Topic");
  //               responseModelOfGroupDto = this.deleteLessonDataUser(result["message"]);
  //               break;
  
  //           }
  
  //           console.log("Result of aws  is...." + JSON.stringify(result));
  //           // let responseModelOfGroupDto = this.userFacade.create(result["message"]);
  
  //           //this.creategroup(result["message"])
  //           for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
  //             const element = result.OnSuccessTopicsToPush[index];
  //             this.sns_sqs.publishMessageToTopic(element, result)
  //           }
  //         }
  //         catch (error) {
  //           await console.log("Inside Catch.........");
  //           await console.log(error, result);
  //           for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
  //             const element = result.OnFailureTopicsToPush[index];
  //             this.sns_sqs.publishMessageToTopic(element, result);
  //           }
            
  //         }
  //       }
  //     })())
  //   }



    
    
  // }

  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......lessonDataUser");
      return this.lessonDataUserFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("/page")
  async allProductsByPage(@Body() requestModel:RequestModelQuery,@Req() req:Request) {
    try {
      console.log("Inside controller ......group");
      let requestModel: any = req.headers['RequestModel'];
      let result = await this.lessonDataUserFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("/page/:pageSize/:pageNumber")
  async allProductsByPageSizeAndPageNumber(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Body() requestModel:RequestModelQuery) {
    try {
      console.log("Inside controller ......group by pageSize & pageNumber");
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let result = await this.lessonDataUserFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':pk')
  getAllProductsByIds(@Param('pk') pk: string,@Req() req:Request): Promise<ResponseModel<LessonDataUserDto>>{
    try {
      console.log("id is............." + JSON.stringify(pk));
      console.log("Request is....." + JSON.stringify(req.headers));
      return this.lessonDataUserFacade.getByIds([pk]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/")
  async createLessonDataUser(@Body() body:RequestModel<LessonDataUserDto>): Promise<ResponseModel<LessonDataUserDto>> {  //requiestmodel<GroupDto></GroupDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.lessonDataUserFacade.create(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Put("/:id")
  async updateLessonDataUser(@Param('id') id: number,@Body() body:RequestModel<LessonDataUserDto>): Promise<ResponseModel<LessonDataUserDto>> {  //requiestmodel<GroupDto></GroupDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      body.DataCollection.forEach((dto: LessonDataUserDto) => {
        dto.Id = id;
      })
      return await this.lessonDataUserFacade.updateEntity(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Delete(':id')
  deleteLessonDataUser(@Param('id') pk: string): Promise<ResponseModel<LessonDataUserDto>>{
    try {
      console.log("Id is......" + pk);
          return this.lessonDataUserFacade.deleteById([parseInt(pk, 10)])
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
}