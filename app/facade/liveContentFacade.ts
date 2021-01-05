import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LiveContentDto } from "../../submodules/platform-3.0-Dtos/liveContentDto";
import { LiveContent } from "../../submodules/platform-3.0-Entities/liveContent";
import AppService from "../../submodules/platform-3.0-Framework/AppService/AppService";
// import { LiveContentDto } from "app/smartup_dtos/liveContentDto";
// import { LiveContent } from "app/smartup_entities/liveContent";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
// let dto = require('../../submodules/platform-3.0-Mappings/liveContentDto"')
let dto = require('../../submodules/platform-3.0-Mappings/liveContentMapper')
@Injectable()
export class LiveContentFacade extends AppService<LiveContent,LiveContentDto> {
    constructor(@InjectRepository(LiveContent) private readonly liveContentRepository: Repository<LiveContent>,public http:HttpService) {
        super(http,liveContentRepository, LiveContent,LiveContent,LiveContentDto, dto.liveContententityJson, dto.liveContentdtoJson, dto.liveContententityToDtoJson, dto.liveContentdtoToEntityJson);
        // super(liveContentRepository, LiveContent, {}, {}, {}, {});
    }
}