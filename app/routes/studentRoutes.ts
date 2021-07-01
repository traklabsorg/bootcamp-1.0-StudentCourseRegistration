import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { StudentFacade } from 'app/facade/studentFacade';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { StudentDto } from '../../submodules/platform-3.0-Dtos/studentDto';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';


@Controller('student')
export class StudentRoutes{

  constructor(private studentFacade : StudentFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['STUDENT_ADD','STUDENT_UPDATE','STUDENT_DELETE'];
  private serviceName = ['STUDENTCOURSE_SERVICE', 'STUDENTCOURSE_SERVICE', 'STUDENTCOURSE_SERVICE'];

  private lesson_data_children_array = ["student"];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + result);
          try {
            let responseModelOfStudentDto: ResponseModel<StudentDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'STUDENT_ADD':
                console.log("Inside STUDENT_ADD Topic");
                responseModelOfStudentDto = await this.createStudent(result["message"]);
                break;
              case 'STUDENT_UPDATE':
                console.log("Inside STUDENT_UPDATE Topic");
               responseModelOfStudentDto = await this.updateStudent(result["message"]);
                break;
              case 'STUDENT_DELETE':
                console.log("Inside STUDENT_DELETE Topic");
                responseModelOfStudentDto = await this.deleteStudent(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfStudentDto: RequestModel<StudentDto> = result["message"];
            responseModelOfStudentDto.setSocketId(requestModelOfStudentDto.SocketId)
            responseModelOfStudentDto.setCommunityUrl(requestModelOfStudentDto.CommunityUrl);
            responseModelOfStudentDto.setRequestId(requestModelOfStudentDto.RequestGuid);
            responseModelOfStudentDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            // let responseModelOfSTUDENTDto = this.STUDENTFacade.create(result["message"]);

            // result["message"].DataCollection = responseModelOfSTUDENTDto.DataCollection;
            //this.createSTUDENT(result["message"])
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, responseModelOfStudentDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<StudentDto> = new ResponseModel<StudentDto>(null,null,null,null,null,null,null,null,null);;
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
      console.log("Inside controller ......STUDENT");
      return this.studentFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


 


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<StudentDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.studentFacade.getByIds([id]);
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
      if(requestModel.Children.indexOf('Student')<=-1)
        requestModel.Children.unshift('Student');
      let result = await this.studentFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createStudent(@Body() body:RequestModel<StudentDto>): Promise<ResponseModel<StudentDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.studentFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateStudent(@Body() body:RequestModel<StudentDto>): Promise<ResponseModel<StudentDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
             
      console.log("Executing update query..............")
      return await this.studentFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

 

  @Delete('/')
  deleteStudent(@Body() body:RequestModel<StudentDto>): Promise<ResponseModel<StudentDto>>{
    try {
      
      return this.studentFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

 

}