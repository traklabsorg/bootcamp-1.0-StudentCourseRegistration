import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelDto } from "../../submodules/platform-3.0-Dtos/channelDto";
import { Channel } from "../../submodules/platform-3.0-Entities/channel";
import AppService from "../../submodules/platform-3.0-Framework/AppService/AppService";
import { SNS_SQS } from "../../submodules/platform-3.0-Framework/submodules/platform-3.0-AWS/SNS_SQS";
// import { ChannelDto } from "app/smartup_dtos/channelDto";
// import { Channel } from "app/smartup_entities/channel";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/channelMapper')

@Injectable()
export class ChannelFacade extends AppService<Channel, ChannelDto> {
    
    private sns_sqs1 = SNS_SQS.getInstance();
    constructor(@InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,public http:HttpService) {
        super(http,channelRepository,Channel,Channel,ChannelDto,dto.channelentityJson, dto.channeldtoJson,dto.channelentityToDtoJson, dto.channeldtoToEntityJson);
        // super(channelRepository, Channel, {}, {}, {}, {});
        
    }
    
    
}