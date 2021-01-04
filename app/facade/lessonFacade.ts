import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonDto } from "submodules/platform-3.0-Dtos/lessonDto";
import { TenantDto } from "submodules/platform-3.0-Dtos/tenantDto";
import { Lesson } from "submodules/platform-3.0-Entities/lesson";
import AppService from "submodules/platform-3.0-Framework/AppService/AppService";
// import { TenantDto } from "app/smartup_dtos/tenantDto";
// import { Tenant } from "app/smartup_entities/tenant";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/lessonMapper')

@Injectable()
export class LessonFacade extends AppService<Lesson, LessonDto> {
  // private map: Maps;
    constructor(@InjectRepository(Lesson) private readonly lessonRepository: Repository<Lesson>,public http:HttpService) {
      super(http,lessonRepository,Lesson,Lesson,LessonDto,dto.lessonentityJson, dto.lessondtoJson,dto.lessonentityToDtoJson, dto.lessondtoToEntityJson);
    }
}