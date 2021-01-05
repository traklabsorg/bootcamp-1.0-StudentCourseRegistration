import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelGroupDto } from "../../submodules/platform-3.0-Dtos/channelGroupDto";
import { ChannelGroup } from "../../submodules/platform-3.0-Entities/channelGroup";
import AppService from "../../submodules/platform-3.0-Framework/AppService/AppService";

import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/channelGroupMapper')

@Injectable()
export class ChannelGroupFacade extends AppService<ChannelGroup,ChannelGroupDto> {
    constructor(@InjectRepository(ChannelGroup) private readonly channelGroupRepository: Repository<ChannelGroup>,public http:HttpService) {
        super(http,channelGroupRepository,ChannelGroup,ChannelGroup,ChannelGroupDto,dto.channelGroupentityJson, dto.channelGroupdtoJson,dto.channelGroupentityToDtoJson, dto.channelGroupdtoToEntityJson);
        // super(channelGroupRepository, ChannelGroup, {}, {}, {}, {})
    }
}