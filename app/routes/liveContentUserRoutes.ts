import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Req } from '@nestjs/common';
// import { LiveContentUserDto } from 'app/smartup_dtos/LiveContentUserDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { LiveContentUserFacade } from 'app/facade/liveContentUserFacade';
import { plainToClass } from 'class-transformer';
import { RequestModel } from 'submodules/platform-3.0-Framework/entities/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Framework/entities/ResponseModel';
// let dto_maps = require('../smartup_dtos/LiveContentUserDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-Framework/aws/models/SNS_SQS';
import { LiveContentUserDto } from 'submodules/platform-3.0-Dtos/liveContentUserDto';


@Controller('liveContentUser')
export class LiveContentUserRoutes{

  constructor(private liveContentUserFacade: LiveContentUserFacade) { }

  private sns_sqs = SNS_SQS.getInstance();

  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......liveContentUser");
      return this.liveContentUserFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':pk')
  getAllProductsByIds(@Param('pk') pk: string,@Req() req:Request): Promise<ResponseModel<LiveContentUserDto>>{
    try {
      console.log("id is............." + JSON.stringify(pk));
      console.log("Request is....." + JSON.stringify(req.headers));
      return this.liveContentUserFacade.getByIds([pk]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/")
  async createLiveContentUser(@Body() body:RequestModel<LiveContentUserDto>): Promise<ResponseModel<LiveContentUserDto>> {  //requiestmodel<GroupDto></GroupDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.liveContentUserFacade.create(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  deleteGroup(@Param('id') pk: string): Promise<ResponseModel<LiveContentUserDto>>{
    try {
      console.log("Id is......" + pk);
          return this.liveContentUserFacade.deleteById([parseInt(pk, 10)])
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
}