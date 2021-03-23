import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelGroupDto } from "../../submodules/platform-3.0-Dtos/channelGroupDto";
import { ChannelGroup } from "../../submodules/platform-3.0-Entities/channelGroup";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";

import { Repository } from "typeorm";
import { ResponseModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel";
import { RequestModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel";
import { RequestModelQuery } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery";
import { Filter } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/filter";
import { Condition } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/condition";
import { GroupUserDto } from "submodules/platform-3.0-Dtos/groupUserDto";
let dto = require('../../submodules/platform-3.0-Mappings/channelGroupMapper')

@Injectable()
export class ChannelGroupFacade extends AppService<ChannelGroup,ChannelGroupDto> {
    constructor(@InjectRepository(ChannelGroup) private readonly channelGroupRepository: Repository<ChannelGroup>,public http:HttpService) {
        super(http,channelGroupRepository,ChannelGroup,ChannelGroup,ChannelGroupDto,dto.channelGroupentityJson, dto.channelGroupdtoJson,dto.channelGroupentityToDtoJson, dto.channelGroupdtoToEntityJson);
        // super(channelGroupRepository, ChannelGroup, {}, {}, {}, {})
    }

    async getUserIdsByChannelId(channelIds : number[],pageSize: number,pageNumber: number): Promise<number[]>{
        let requestModelQuery : RequestModelQuery = new RequestModelQuery();
        let entityArray = [["channelGroup","group"],["group","groupUser"]];
        let filter = new Filter();
        
        console.log("ChannelIds are",channelIds)
        channelIds.map((channelId: number)=>{
            let condition = new Condition();
            condition.FieldName = 'channelId';
            condition.FieldValue = channelId;
            filter.Conditions.push(condition);
        })
        requestModelQuery.Children = ["channelGroup"];
        requestModelQuery.Filter = filter;
        requestModelQuery.Filter.PageInfo.PageSize = pageSize;
        requestModelQuery.Filter.PageInfo.PageNumber = pageNumber;
        let result = await (await this.search(requestModelQuery,true,entityArray)).getDataCollection();
        let userIds = [];
        result.map((data: ChannelGroupDto)=>{
            data.group.groupUser.map((groupUser: GroupUserDto)=>{
                userIds.push(groupUser.userId);
            })
        })
      console.log("Userids are .......",userIds);
      return userIds;
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