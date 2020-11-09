// import { ResponseModel } from "../../framework/entities/responseModel";
import { AppService } from "../../smartup_framework/framework/appservice/appService";
import { ResponseModel } from "../../smartup_framework/framework/entities/responseModel";
import { ChannelDto } from "../3.1-dtos/3.1 dtos/channelDto";
// import { ChannelDto } from "../3.1 dtos/channelDto";
import { Channel } from "../4.1entities/channel";
// import {AppService} from "../../framework/appservice/appService";

export class ChannelAppService extends AppService<Channel, ChannelDto>{
  
  // private entityType: Channel;
  // private dtoType: ChannelDto;

  constructor() {
    super(Channel,ChannelDto);
    // this.entityType = entity;
    // this.dtoType = dto;
  }

  public getAll():Promise<ResponseModel<ChannelDto[]> | null | ChannelDto[]> {
    return this.findAll(Channel,ChannelDto);
  }
}
