import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Req } from '@nestjs/common';
// import { LessonDataReviewDto } from 'app/smartup_dtos/LessonDataReviewDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { LessonDataReviewFacade } from 'app/facade/lessonDataReviewFacade';
import { plainToClass } from 'class-transformer';
import { RequestModel } from 'submodules/platform-3.0-Framework/entities/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Framework/entities/ResponseModel';
// let dto_maps = require('../smartup_dtos/LessonDataReviewDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-Framework/aws/models/SNS_SQS';
import { LessonDataReviewDto } from 'submodules/platform-3.0-Dtos/lessonDataReviewDto';


@Controller('lessonDataReview')
export class LessonDataReviewRoutes{

  constructor(private lessonDataReviewFacade: LessonDataReviewFacade) { }

  private sns_sqs = SNS_SQS.getInstance();

  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......lessonDataReview");
      return this.lessonDataReviewFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':pk')
  getAllProductsByIds(@Param('pk') pk: string,@Req() req:Request): Promise<ResponseModel<LessonDataReviewDto>>{
    try {
      console.log("id is............." + JSON.stringify(pk));
      console.log("Request is....." + JSON.stringify(req.headers));
      return this.lessonDataReviewFacade.getByIds([pk]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/")
  async createLessonDataReview(@Body() body:RequestModel<LessonDataReviewDto>): Promise<ResponseModel<LessonDataReviewDto>> {  //requiestmodel<GroupDto></GroupDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.lessonDataReviewFacade.create(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  deleteGroup(@Param('id') pk: string): Promise<ResponseModel<LessonDataReviewDto>>{
    try {
      console.log("Id is......" + pk);
          return this.lessonDataReviewFacade.deleteById([parseInt(pk, 10)])
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
}