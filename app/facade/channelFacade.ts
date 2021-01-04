import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelDto } from "submodules/platform-3.0-Dtos/channelDto";
import { TenantDto } from "submodules/platform-3.0-Dtos/tenantDto";
import { Channel } from "submodules/platform-3.0-Entities/channel";
import AppService from "submodules/platform-3.0-Framework/AppService/AppService";
// import { TenantDto } from "app/smartup_dtos/tenantDto";
// import { Tenant } from "app/smartup_entities/tenant";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/channelMapper')

@Injectable()
export class ChannelFacade extends AppService<Channel, ChannelDto> {
  // private map: Maps;
    constructor(@InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,public http:HttpService) {
      super(http,channelRepository,Channel,Channel,ChannelDto,dto.channelentityJson, dto.channeldtoJson,dto.channelentityToDtoJson, dto.channeldtoToEntityJson);
    }
}