import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonDto } from "../../submodules/platform-3.0-Dtos/lessonDto";
import { Lesson } from "../../submodules/platform-3.0-Entities/lesson";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";
// import { LessonDto } from "app/smartup_dtos/lessonDto";
// import { Lesson } from "app/smartup_entities/lesson";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
// let dto = require('../../submodules/platform-3.0-Mappings/lessonDto"')
let dto = require('../../submodules/platform-3.0-Mappings/lessonMapper')
@Injectable()
export class LessonFacade extends AppService<Lesson,LessonDto> {
    constructor(@InjectRepository(Lesson) private readonly lessonRepository: Repository<Lesson>,public http:HttpService) {
        super(http,lessonRepository, Lesson,Lesson,LessonDto, dto.lessonentityJson, dto.lessondtoJson, dto.lessonentityToDtoJson, dto.lessondtoToEntityJson);
        // super(lessonRepository, Lesson, {}, {}, {}, {});
    }
}