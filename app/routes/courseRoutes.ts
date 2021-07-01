import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-AWS/SNS_SQS';
import { RequestModelQuery } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery';
import { RequestModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel';
import { Message } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/Message';
import { CourseDto } from 'submodules/platform-3.0-Dtos/courseDto';
import { CourseFacade } from 'app/facade/courseFacade';


@Controller('course')
export class CourseRoutes{

  constructor(private courseFacade : CourseFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['COURSE_ADD','COURSE_UPDATE','COURSE_DELETE'];
  private serviceName = ['STUDENTCOURSE_SERVICE', 'STUDENTCOURSE_SERVICE', 'STUDENTCOURSE_SERVICE'];

  private lesson_data_children_array = ["Course"];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + result);
          try {
            let responseModelOfCourseDto: ResponseModel<CourseDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'COURSE_ADD':
                console.log("Inside COURSE_ADD Topic");
                responseModelOfCourseDto = await this.createCourse(result["message"]);
                break;
              case 'COURSE_UPDATE':
                console.log("Inside COURSE_UPDATE Topic");
               responseModelOfCourseDto = await this.updateCourse(result["message"]);
                break;
              case 'COURSE_DELETE':
                console.log("Inside COURSE_DELETE Topic");
                responseModelOfCourseDto = await this.deleteCourse(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfCourseDto: RequestModel<CourseDto> = result["message"];
            responseModelOfCourseDto.setSocketId(requestModelOfCourseDto.SocketId)
            responseModelOfCourseDto.setCommunityUrl(requestModelOfCourseDto.CommunityUrl);
            responseModelOfCourseDto.setRequestId(requestModelOfCourseDto.RequestGuid);
            responseModelOfCourseDto.setStatus(new Message("200", "Group Inserted Successfully", null));

          
            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              this.sns_sqs.publishMessageToTopic(element, responseModelOfCourseDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<CourseDto> = new ResponseModel<CourseDto>(null,null,null,null,null,null,null,null,null);;
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
      console.log("Inside controller ......COURSE");
      return this.courseFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


 


  @Get(':id')
  getAllProductsByIds(@Param('id') id: number): Promise<ResponseModel<CourseDto>> {
    try {
      console.log("id is............." + JSON.stringify(id));
      return this.courseFacade.getByIds([id]);
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
      if(requestModel.Children.indexOf('Course')<=-1)
        requestModel.Children.unshift('Course');
      let result = await this.courseFacade.search(requestModel);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createCourse(@Body() body:RequestModel<CourseDto>): Promise<ResponseModel<CourseDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      let result = await this.courseFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateCourse(@Body() body:RequestModel<CourseDto>): Promise<ResponseModel<CourseDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
             
      console.log("Executing update query..............")
      return await this.courseFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

 

  @Delete('/')
  deleteCourse(@Body() body:RequestModel<CourseDto>): Promise<ResponseModel<CourseDto>>{
    try {
      
      return this.courseFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

 

}