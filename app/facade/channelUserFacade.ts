import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelUserDto } from "../../submodules/platform-3.0-Dtos/channelUserDto";
import { ChannelUser } from "../../submodules/platform-3.0-Entities/channelUser";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";
// import { ChannelUserDto } from "app/smartup_dtos/channelUserDto";
// import { ChannelUser } from "app/smartup_entities/channelUser";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
import { ResponseModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel";
import { ServiceOperationResultType } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ServiceOperationResultType";
import { RequestModelQuery } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery";
import { GROUP_MICROSERVICE_URI } from "config";
import { map } from "rxjs/operators";
import { UtilityFacade } from './utilityFacade';
import { UserDetails } from '../../submodules/platform-3.0-Dtos/userDto';
import { Filter } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/filter";
import { Condition } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/condition";
let dto = require('../../submodules/platform-3.0-Mappings/channelUserMapper')

@Injectable()
export class ChannelUserFacade extends AppService<ChannelUser, ChannelUserDto> {
    
    constructor(@InjectRepository(ChannelUser) private readonly channelUserRepository: Repository<ChannelUser>,public http:HttpService,private utilityFacade:UtilityFacade) {
        super(http,channelUserRepository,ChannelUser,ChannelUser,ChannelUserDto,dto.channelUserentityJson, dto.channelUserdtoJson,dto.channelUserentityToDtoJson, dto.channelUserdtoToEntityJson);
        // super(channelUserRepository, ChannelUser, {}, {}, {}, {});
        
    }

    

    


}