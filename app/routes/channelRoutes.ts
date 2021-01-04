import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Req } from '@nestjs/common';
// import { ChannelDto } from 'app/smartup_dtos/ChannelDto';
// import { Tenant } from 'app/smartup_entities/tenant';
import { ChannelFacade } from 'app/facade/channelFacade';
import { plainToClass } from 'class-transformer';
import { RequestModel } from 'submodules/platform-3.0-Framework/entities/RequestModel';
import { ResponseModel } from 'submodules/platform-3.0-Framework/entities/ResponseModel';
// let dto_maps = require('../smartup_dtos/ChannelDto')
var objectMapper = require('object-mapper');
import { Request } from 'express';
import { SNS_SQS } from 'submodules/platform-3.0-Framework/aws/models/SNS_SQS';
import { ChannelDto } from 'submodules/platform-3.0-Dtos/channelDto';


@Controller('channel')
export class ChannelRoutes{

  constructor(private channelFacade: ChannelFacade) { }

  private sns_sqs = SNS_SQS.getInstance();

  @Get("/")
  allProducts() {
    try {
      console.log("Inside controller ......channel");
      return this.channelFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':pk')
  getAllProductsByIds(@Param('pk') pk: string,@Req() req:Request): Promise<ResponseModel<ChannelDto>>{
    try {
      console.log("id is............." + JSON.stringify(pk));
      console.log("Request is....." + JSON.stringify(req.headers));
      return this.channelFacade.getByIds([pk]);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/")
  async createChannel(@Body() body:RequestModel<ChannelDto>): Promise<ResponseModel<ChannelDto>> {  //requiestmodel<GroupDto></GroupDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      await console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
      return await this.channelFacade.create(body);
    } catch (error) {
      await console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  deleteGroup(@Param('id') pk: string): Promise<ResponseModel<ChannelDto>>{
    try {
      console.log("Id is......" + pk);
          return this.channelFacade.deleteById([parseInt(pk, 10)])
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
}