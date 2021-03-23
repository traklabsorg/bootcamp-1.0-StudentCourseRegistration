import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonDataDto } from "../../submodules/platform-3.0-Dtos/lessonDataDto";
import { LessonData } from "../../submodules/platform-3.0-Entities/lessonData";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";
// import { LessonDataDto } from "app/smartup_dtos/lessonDataDto";
// import { LessonData } from "app/smartup_entities/lessonData";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
// let dto = require('../../submodules/platform-3.0-Mappings/lessonDataDto"')
let dto = require('../../submodules/platform-3.0-Mappings/lessonDataMapper')
@Injectable()
export class LessonDataFacade extends AppService<LessonData,LessonDataDto> {
    constructor(@InjectRepository(LessonData) private readonly lessonDataRepository: Repository<LessonData>,public http:HttpService) {
        super(http,lessonDataRepository, LessonData,LessonData,LessonDataDto, dto.lessonDataentityJson, dto.lessonDatadtoJson, dto.lessonDataentityToDtoJson, dto.lessonDatadtoToEntityJson);
        // super(lessonDataRepository, LessonData, {}, {}, {}, {});
    }

    
}