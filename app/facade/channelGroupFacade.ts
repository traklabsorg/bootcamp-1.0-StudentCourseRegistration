import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelGroupDto } from "submodules/platform-3.0-Dtos/channelGroupDto";
import { TenantDto } from "submodules/platform-3.0-Dtos/tenantDto";
import { ChannelGroup } from "submodules/platform-3.0-Entities/ChannelGroup";
import AppService from "submodules/platform-3.0-Framework/AppService/AppService";
// import { TenantDto } from "app/smartup_dtos/tenantDto";
// import { Tenant } from "app/smartup_entities/tenant";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/channelGroupMapper')

@Injectable()
export class ChannelGroupFacade extends AppService<ChannelGroup, ChannelGroupDto> {
  // private map: Maps;
    constructor(@InjectRepository(ChannelGroup) private readonly channelGroupRepository: Repository<ChannelGroup>,public http:HttpService) {
      super(http,channelGroupRepository,ChannelGroup,ChannelGroup,ChannelGroupDto,dto.channelGroupentityJson, dto.channelGroupdtoJson,dto.channelGroupentityToDtoJson, dto.channelGroupdtoToEntityJson);
    }
}