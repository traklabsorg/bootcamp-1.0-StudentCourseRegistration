import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelGroupDto } from "../../submodules/platform-3.0-Dtos/channelGroupDto";
import { ChannelGroup } from "../../submodules/platform-3.0-Entities/channelGroup";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";

import { Repository } from "typeorm";
import { ResponseModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel";
import { RequestModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel";
let dto = require('../../submodules/platform-3.0-Mappings/channelGroupMapper')

@Injectable()
export class ChannelGroupFacade extends AppService<ChannelGroup,ChannelGroupDto> {
    constructor(@InjectRepository(ChannelGroup) private readonly channelGroupRepository: Repository<ChannelGroup>,public http:HttpService) {
        super(http,channelGroupRepository,ChannelGroup,ChannelGroup,ChannelGroupDto,dto.channelGroupentityJson, dto.channelGroupdtoJson,dto.channelGroupentityToDtoJson, dto.channelGroupdtoToEntityJson);
        // super(channelGroupRepository, ChannelGroup, {}, {}, {}, {})
    }


    async findAllUsersInAGroupSubscribedToAChannel(channelIds:number[]):Promise<any>{

        let myJSON = {};
        console.log("channelIds....",channelIds)
        let query = this.genericRepository.createQueryBuilder("channelGroup")
        .innerJoinAndSelect("channelGroup.group","group")
        .innerJoinAndSelect("group.groupUser","groupUser")
        .select("COUNT(DISTINCT(groupUser.userId))", 'count_temp')
        //.addSelect("groupUser.userId",'userIds')
        .addSelect("channelGroup.channelId")
        
        for(let i = 0;i<channelIds.length;i++){
            let myJSON = {};
            myJSON["id"+i] = channelIds[i];
            query = query.orWhere("channelGroup.channelId =:id"+i,myJSON);
        }
        // channelIds.forEach((id:number)=>{
        //     let myJSON = {};
        //     myJSON["id"] = id;
        //     query = query.orWhere("channelGroup.channelId =:id",myJSON);


        // })
        let result = await query.groupBy("channelGroup.channelId").execute();
        console.log("Result is..........",result);


        return result;
    }
}