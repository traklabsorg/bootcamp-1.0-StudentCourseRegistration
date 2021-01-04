import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Req } from '@nestjs/common';
// import { LessonDataDto } from 'app/smartup_dtos/LessonDataDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { LessonDataFacade } from 'app/facade/lessonDataFacade';
import { plainToClass } from 'class-transformer';
import { RequestModel } from 'submodules/platform-3.0-Framework/entities/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Framework/entities/ResponseModel';
// let dto_maps = require('../smartup_dtos/LessonDataDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-Framework/aws/models/SNS_SQS';
import { LessonDataDto } from 'submodules/platform-3.0-Dtos/lessonDataDto';


@Controller('lessonData')
export class LessonDataRoutes{

  constructor(private lessonDataFacade: LessonDataFacade) { }

  private sns_sqs = SNS_SQS.getInstance();

  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......lessonData");
      return this.lessonDataFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':pk')
  getAllProductsByIds(@Param('pk') pk: string,@Req() req:Request): Promise<ResponseModel<LessonDataDto>>{
    try {
      console.log("id is............." + JSON.stringify(pk));
      console.log("Request is....." + JSON.stringify(req.headers));
      return this.lessonDataFacade.getByIds([pk]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/")
  async createLessonData(@Body() body:RequestModel<LessonDataDto>): Promise<ResponseModel<LessonDataDto>> {  //requiestmodel<GroupDto></GroupDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.lessonDataFacade.create(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  deleteGroup(@Param('id') pk: string): Promise<ResponseModel<LessonDataDto>>{
    try {
      console.log("Id is......" + pk);
          return this.lessonDataFacade.deleteById([parseInt(pk, 10)])
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
}