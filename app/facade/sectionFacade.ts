import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SectionDto } from "../../submodules/platform-3.0-Dtos/sectionDto";
import { Section } from "../../submodules/platform-3.0-Entities/section";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";
// import { SectionDto } from "app/smartup_dtos/sectionDto";
// import { Section } from "app/smartup_entities/section";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
// let dto = require('../../submodules/platform-3.0-Mappings/sectionDto"')
let dto = require('../../submodules/platform-3.0-Mappings/sectionMapper')
@Injectable()
export class SectionFacade extends AppService<Section,SectionDto> {
    constructor(@InjectRepository(Section) private readonly sectionRepository: Repository<Section>,public http:HttpService) {
        super(http,sectionRepository, Section,Section,SectionDto, dto.sectionentityJson, dto.sectiondtoJson, dto.sectionentityToDtoJson, dto.sectiondtoToEntityJson);
        // super(sectionRepository, Section, {}, {}, {}, {});
    }
}