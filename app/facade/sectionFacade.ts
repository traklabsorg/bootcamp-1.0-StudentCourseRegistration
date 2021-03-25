import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SectionDto } from "../../submodules/platform-3.0-Dtos/sectionDto";
import { Section } from "../../submodules/platform-3.0-Entities/section";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";
// import { SectionDto } from "app/smartup_dtos/sectionDto";
// import { Section } from "app/smartup_entities/section";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
import { RequestModelQuery } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery";
import { Filter } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/filter";
import { Condition } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/condition";
import { ResponseModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel";
// let dto = require('../../submodules/platform-3.0-Mappings/sectionDto"')
let dto = require('../../submodules/platform-3.0-Mappings/sectionMapper')
@Injectable()
export class SectionFacade extends AppService<Section,SectionDto> {
    constructor(@InjectRepository(Section) private readonly sectionRepository: Repository<Section>,public http:HttpService) {
        super(http,sectionRepository, Section,Section,SectionDto, dto.sectionentityJson, dto.sectiondtoJson, dto.sectionentityToDtoJson, dto.sectiondtoToEntityJson);
        // super(sectionRepository, Section, {}, {}, {}, {});
    }

    async getChannelIdsBySectionIds(sectionIds : number[],pageSize: number,pageNumber: number): Promise<SectionDto[]>{
        let requestModelQuery : RequestModelQuery = new RequestModelQuery();
        let entityArray = [["section","channel"]];
        let filter = new Filter();
        console.log("SectionIds are-------",sectionIds)
        sectionIds.map((sectionId: number)=>{
            let condition = new Condition();
            condition.FieldName = 'Id';
            condition.FieldValue = sectionId;
            filter.Conditions.push(condition);
        })
        requestModelQuery.Children = ["section"];
        requestModelQuery.Filter = filter;
        requestModelQuery.Filter.PageInfo.PageSize = pageSize;
        requestModelQuery.Filter.PageInfo.PageNumber = pageNumber;
        let result = (await this.search(requestModelQuery,true,entityArray)).getDataCollection();
        
        //console.log(JSON.stringify(result));
    //   console.log("Channelids are .......",channelIds);
      return result;
    }
}