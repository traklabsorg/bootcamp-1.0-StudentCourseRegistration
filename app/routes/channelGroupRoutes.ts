import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Req } from '@nestjs/common';
// import { ChannelGroupDto } from 'app/smartup_dtos/ChannelGroupDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { ChannelGroupFacade } from 'app/facade/channelGroupFacade';

import { plainToClass } from 'class-transformer';
import { RequestModel } from 'submodules/platform-3.0-Framework/entities/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Framework/entities/ResponseModel';
// let dto_maps = require('../smartup_dtos/ChannelGroupDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-Framework/aws/models/SNS_SQS';
import { ChannelGroupDto } from 'submodules/platform-3.0-Dtos/channelGroupDto';


@Controller('channelGroup')
export class ChannelGroupRoutes{

  constructor(private channelGroupFacade: ChannelGroupFacade) { }

  private sns_sqs = SNS_SQS.getInstance();

  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......channelGroup");
      return this.channelGroupFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':pk')
  getAllProductsByIds(@Param('pk') pk: string,@Req() req:Request): Promise<ResponseModel<ChannelGroupDto>>{
    try {
      console.log("id is............." + JSON.stringify(pk));
      console.log("Request is....." + JSON.stringify(req.headers));
      return this.channelGroupFacade.getByIds([pk]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/")
  async createChannelGroup(@Body() body:RequestModel<ChannelGroupDto>): Promise<ResponseModel<ChannelGroupDto>> {  //requiestmodel<GroupDto></GroupDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.channelGroupFacade.create(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  deleteGroup(@Param('id') pk: string): Promise<ResponseModel<ChannelGroupDto>>{
    try {
      console.log("Id is......" + pk);
          return this.channelGroupFacade.deleteById([parseInt(pk, 10)])
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
}