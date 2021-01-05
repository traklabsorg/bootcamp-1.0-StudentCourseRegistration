import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { EnrolledMeetingDto } from 'app/smartup_dtos/EnrolledMeetingDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { EnrolledMeetingFacade } from 'app/facade/enrolledMeetingFacade';
import { plainToClass } from 'class-transformer';
// import { RequestModel } from ''../../submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { ResponseModel } from '../../submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
// let dto_maps = require('../smartup_dtos/EnrolledMeetingDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from '../../submodules/platform-3.0-Framework/aws/models/SNS_SQS';
// import { EnrolledMeetingDto } from '../../submodules/platform-3.0-Dtos/enrolledMeetingDto';
import { RequestModelQuery } from '../../submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { RequestModel } from '../../submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { EnrolledMeetingDto } from '../../submodules/platform-3.0-Dtos/enrolledMeetingsDto';


@Controller('enrolledMeeting')
export class EnrolledMeetingRoutes{

  constructor(private enrolledMeetingFacade: EnrolledMeetingFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['ENROLLEDMEETING_ADD','ENROLLEDMEETING_UPDATE','ENROLLEDMEETING_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];
  
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
            let responseModelOfGroupDto: any = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'ENROLLEDMEETING_ADD':
                console.log("Inside ENROLLEDMEETING_ADD Topic");
                responseModelOfGroupDto = this.createEnrolledMeeting(result["message"]);
                break;
              case 'ENROLLEDMEETING_UPDATE':
                console.log("Inside ENROLLEDMEETING_UPDATE Topic");
              //  responseModelOfGroupDto = this.updateEnrolledMeeting(result["message"]);
                break;
              case 'ENROLLEDMEETING_DELETE':
                console.log("Inside ENROLLEDMEETING_DELETE Topic");
                responseModelOfGroupDto = this.deleteEnrolledMeeting(result["message"]);
                break;
  
            }
  
            console.log("Result of aws  is...." + JSON.stringify(result));
            // let responseModelOfGroupDto = this.userFacade.create(result["message"]);
  
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
      console.log("Inside controller ......enrolledMeeting");
      return this.enrolledMeetingFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("/page")
  async allProductsByPage(@Body() requestModel:RequestModelQuery,@Req() req:Request) {
    try {
      console.log("Inside controller ......group");
      let requestModel: any = req.headers['RequestModel'];
      let result = await this.enrolledMeetingFacade.search(requestModel);
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
      let result = await this.enrolledMeetingFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':pk')
  getAllProductsByIds(@Param('pk') pk: string,@Req() req:Request): Promise<ResponseModel<EnrolledMeetingDto>>{
    try {
      console.log("id is............." + JSON.stringify(pk));
      console.log("Request is....." + JSON.stringify(req.headers));
      return this.enrolledMeetingFacade.getByIds([pk]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/")
  async createEnrolledMeeting(@Body() body:RequestModel<EnrolledMeetingDto>): Promise<ResponseModel<EnrolledMeetingDto>> {  //requiestmodel<GroupDto></GroupDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.enrolledMeetingFacade.create(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Put("/:id")
  async updateEnrolledMeeting(@Param('id') id: number,@Body() body:RequestModel<EnrolledMeetingDto>): Promise<ResponseModel<EnrolledMeetingDto>> {  //requiestmodel<GroupDto></GroupDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      body.DataCollection.forEach((dto: EnrolledMeetingDto) => {
        dto.Id = id;
      })
      return await this.enrolledMeetingFacade.updateEntity(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Delete(':id')
  deleteEnrolledMeeting(@Param('id') pk: string): Promise<ResponseModel<EnrolledMeetingDto>>{
    try {
      console.log("Id is......" + pk);
          return this.enrolledMeetingFacade.deleteById([parseInt(pk, 10)])
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
}