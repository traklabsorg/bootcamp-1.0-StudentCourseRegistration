import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
// import { ChannelBillPlanDto } from 'app/smartup_dtos/ChannelBillPlanDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { ChannelBillPlanFacade } from 'app/facade/channelBillPlanFacade';
import { plainToClass } from 'class-transformer';
// import { RequestModel } from ''submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
// let dto_maps = require('../smartup_dtos/ChannelBillPlanDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
// import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { ChannelBillPlanDto } from '../../submodules/platform-3.0-Dtos/channelBillPlanDto';
// import { ExampleService } from '../facade/mailFacade';



@Controller('channelBillPlan')
export class ChannelBillPlanRoutes{

  constructor(private channelBillPlanFacade: ChannelBillPlanFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['CHANNELBILLPLAN_ADD','CHANNELBILLPLAN_UPDATE','CHANNELBILLPLAN_DELETE'];
  private serviceName = ['CHANNEL_SERVICE', 'CHANNEL_SERVICE', 'CHANNEL_SERVICE'];

  private channel_bill_plan_children_array = ["channel","plan"]
  
  onModuleInit() {
    // const requestPatterns = [
    //   'channelBillPlan-create'
    // ];
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          await console.log("Result is........" + result);
          try {
            let responseModelOfGroupDto: ResponseModel<ChannelBillPlanDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'CHANNELBILLPLAN_ADD':
                console.log("Inside CHANNELBILLPLAN_ADD Topic");
                responseModelOfGroupDto = await this.createChannelBillPlan(result["message"]);
                break;
              case 'CHANNELBILLPLAN_UPDATE':
                console.log("Inside CHANNELBILLPLAN_UPDATE Topic");
               responseModelOfGroupDto = await this.updateChannelBillPlan(result["message"]);
                break;
              case 'CHANNELBILLPLAN_DELETE':
                console.log("Inside CHANNELBILLPLAN_DELETE Topic");
                responseModelOfGroupDto = await this.deleteChannelBillPlan(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfGroupDto: RequestModel<ChannelBillPlanDto> = result["message"];
            responseModelOfGroupDto.setSocketId(requestModelOfGroupDto.SocketId)
            responseModelOfGroupDto.setCommunityUrl(requestModelOfGroupDto.CommunityUrl);
            responseModelOfGroupDto.setRequestId(requestModelOfGroupDto.RequestGuid);
            responseModelOfGroupDto.setStatus(new Message("200", "ChannelBillPlan Inserted Successfully", null));

            // let responseModelOfGroupDto = this.channelBillPlanFacade.create(result["message"]);

            // result["message"].DataCollection = responseModelOfGroupDto.DataCollection;
            //this.createChannelBillPlan(result["message"])
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
              let errorResult: ResponseModel<ChannelBillPlanDto>;
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

  // @EventPattern('channelBillPlan-create')
  // async handleEntityCreated(payload: Request): Promise<boolean> {
  //   console.log("Calling to create channelBillPlan");
    
  //   console.log(JSON.stringify(payload.body) + ' created');
  //   this.client.emit<any>('success', 'Message received by handleEntityCreated SuccessFully' + JSON.stringify(payload['value']))
  //   // this.createChannelBillPlan(payload);
  //   return true;
  // }


  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......channelBillPlan");
      return this.channelBillPlanFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  // @Get("/page")
  // async allProductsByPage(@Req() req:Request) {
  //   try {
  //     console.log("Inside controller ......channelBillPlan");
  //     console.log("RequestModel is......" + JSON.stringify(req.headers['requestmodel']));
  //     let requestModel: any = JSON.parse(req.headers['requestmodel'].toString());
  //     let result = await this.channelBillPlanFacade.search(requestModel);
  //     return result;
  //   } catch (error) {
  //     console.log("Error is....." + error);
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<ChannelBillPlanDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.channelBillPlanFacade.getByIds([id]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  

  @Get("/:pageSize/:pageNumber")
  async allProductsByPageSizeAndPageNumber(@Param('pageSize') pageSize: number,@Param('pageNumber') pageNumber: number,@Req() req:Request) {
    try {
      console.log("Inside controller ......channelBillPlan by pageSize & pageNumber");
      let requestModel: RequestModelQuery = JSON.parse(req.headers['requestmodel'].toString());
      requestModel.Filter.PageInfo.PageSize = pageSize;
      requestModel.Filter.PageInfo.PageNumber = pageNumber;
      let given_children_array = requestModel.Children;
      let isSubset = given_children_array.every(val => this.channel_bill_plan_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.channel_bill_plan_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if (!isSubset) {
        console.log("Inside Condition.....")
        requestModel.Children = this.channel_bill_plan_children_array;
      }
      if(requestModel.Children.indexOf('channelBillPlan')<=-1)
        requestModel.Children.unshift('channelBillPlan');
      let result = await this.channelBillPlanFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createChannelBillPlan(@Body() body:RequestModel<ChannelBillPlanDto>): Promise<ResponseModel<ChannelBillPlanDto>> {  //requiestmodel<ChannelBillPlanDto></ChannelBillPlanDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.channelBillPlanFacade.create(body);
      // this.sns_sqs.publishMessageToTopic("CHANNELBILLPLAN_ADDED",{success:body})  // remove from here later
      return result;
      // return null;
    } catch (error) {
      await console.log("Error is....." + error);
      // this.sns_sqs.publishMessageToTopic("ERROR_RECEIVER",{error:error})
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateChannelBillPlan(@Body() body:RequestModel<ChannelBillPlanDto>): Promise<ResponseModel<ChannelBillPlanDto>> {  //requiestmodel<ChannelBillPlanDto></ChannelBillPlanDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.channelBillPlanFacade.updateEntity(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Get("/expt/query1")
  // async func2(): Promise<any>{
  //   this.channelBillPlanFacade.getGroupRequestModel();
  //   return null;
  // }

  @Delete('/')
  deleteChannelBillPlan(@Body() body:RequestModel<ChannelBillPlanDto>): Promise<ResponseModel<ChannelBillPlanDto>>{
    try {
      let delete_ids :Array<number> = [];
      body.DataCollection.forEach((entity:ChannelBillPlanDto)=>{
        delete_ids.push(entity.Id);
      })
      console.log("Ids are......",delete_ids);
      return this.channelBillPlanFacade.deleteById(delete_ids);
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
  //     var result = await this.channelBillPlanFacade.getCountByConditions(requestModel);
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

  // @Get('/a/b/c/d/e/f/g')
  // func():void{
  //   try{
  //   this.example.example();
  //   }
  //   catch(err){
  //     console.log("Error is..."+JSON.stringify(err));
  //   }
  // }

}