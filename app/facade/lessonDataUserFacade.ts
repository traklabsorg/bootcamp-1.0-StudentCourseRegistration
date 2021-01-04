import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonDataUserDto } from "submodules/platform-3.0-Dtos/lessonDataUserDto";
import { TenantDto } from "submodules/platform-3.0-Dtos/tenantDto";
import { LessonDataUser } from "submodules/platform-3.0-Entities/lessonDataUser";
import AppService from "submodules/platform-3.0-Framework/AppService/AppService";
// import { TenantDto } from "app/smartup_dtos/tenantDto";
// import { Tenant } from "app/smartup_entities/tenant";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/lessonDataUserMapper')

@Injectable()
export class LessonDataUserFacade extends AppService<LessonDataUser, LessonDataUserDto> {
  // private map: Maps;
    constructor(@InjectRepository(LessonDataUser) private readonly lessonDataUserRepository: Repository<LessonDataUser>,public http:HttpService) {
      super(http,lessonDataUserRepository,LessonDataUser,LessonDataUser,LessonDataUserDto,dto.lessonDataUserentityJson, dto.lessonDataUserdtoJson,dto.lessonDataUserentityToDtoJson, dto.lessonDataUserdtoToEntityJson);
    }
}