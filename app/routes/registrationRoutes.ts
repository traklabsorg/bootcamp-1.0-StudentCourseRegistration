import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { RegistrationFacade } from 'app/facade/registrationFacade';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { RegistrationDto } from '../../submodules/platform-3.0-Dtos/registrationDto';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';


@Controller('student')
export class RegistrationRoutes{

  constructor(private registrationFacade : RegistrationFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['REGISTRATION_ADD','REGISTRATION_UPDATE','REGISTRATION_DELETE'];
  private serviceName = ['STUDENTCOURSE_SERVICE', 'STUDENTCOURSE_SERVICE', 'STUDENTCOURSE_SERVICE'];

  private lesson_data_children_array = ["Registration"];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + result);
          try {
            let responseModelOfRegistrationDto: ResponseModel<RegistrationDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'REGISTRATION_ADD':
                console.log("Inside REGISTRATION_ADD Topic");
                responseModelOfRegistrationDto = await this.createRegistration(result["message"]);
                break;
              case 'REGISTRATION_UPDATE':
                console.log("Inside REGISTRATION_UPDATE Topic");
               responseModelOfRegistrationDto = await this.updateRegistration(result["message"]);
                break;
              case 'REGISTRATION_DELETE':
                console.log("Inside REGISTRATION_DELETE Topic");
                responseModelOfRegistrationDto = await this.deleteRegistration(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfRegistrationDto: RequestModel<RegistrationDto> = result["message"];
            responseModelOfRegistrationDto.setSocketId(requestModelOfRegistrationDto.SocketId)
            responseModelOfRegistrationDto.setCommunityUrl(requestModelOfRegistrationDto.CommunityUrl);
            responseModelOfRegistrationDto.setRequestId(requestModelOfRegistrationDto.RequestGuid);
            responseModelOfRegistrationDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            // let responseModelOfREGISTRATIONDto = this.REGISTRATIONFacade.create(result["message"]);

            // result["message"].DataCollection = responseModelOfREGISTRATIONDto.DataCollection;
            //this.createREGISTRATION(result["message"])
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, responseModelOfRegistrationDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<RegistrationDto> = new ResponseModel<RegistrationDto>(null,null,null,null,null,null,null,null,null);;
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

  }

  


  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......REGISTRATION");
      return this.registrationFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


 


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<RegistrationDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.registrationFacade.getByIds([id]);
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
      let isSubset = given_children_array.every(val => this.lesson_data_children_array.includes(val) && given_children_array.filter(el => el === val).length <= this.lesson_data_children_array.filter(el => el === val).length);
      console.log("isSubset is......" + isSubset);
      if (!isSubset) {
        console.log("Inside Condition.....")
        requestModel.Children = this.lesson_data_children_array;
      }
      if(requestModel.Children.indexOf('Registration')<=-1)
        requestModel.Children.unshift('Registration');
      let result = await this.registrationFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createRegistration(@Body() body:RequestModel<RegistrationDto>): Promise<ResponseModel<RegistrationDto>> {  //requiestmodel<REGISTRATIONDto></REGISTRATIONDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.registrationFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateRegistration(@Body() body:RequestModel<RegistrationDto>): Promise<ResponseModel<RegistrationDto>> {  //requiestmodel<REGISTRATIONDto></REGISTRATIONDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
             
      console.log("Executing update query..............")
      return await this.registrationFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

 

  @Delete('/')
  deleteRegistration(@Body() body:RequestModel<RegistrationDto>): Promise<ResponseModel<RegistrationDto>>{
    try {
      
      return this.registrationFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

 

}