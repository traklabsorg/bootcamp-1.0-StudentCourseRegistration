import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonDataUserDto } from "../../submodules/platform-3.0-Dtos/lessonDataUserDto";
import { LessonDataUser } from "../../submodules/platform-3.0-Entities/lessonDataUser";
import AppService from "../../submodules/platform-3.0-Framework/AppService/AppService";
// import { LessonDataUserDto } from "app/smartup_dtos/lessonDataUserDto";
// import { LessonDataUser } from "app/smartup_entities/lessonDataUser";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
// let dto = require('../../submodules/platform-3.0-Mappings/lessonDataUserDto"')
let dto = require('../../submodules/platform-3.0-Mappings/lessonDataUserMapper')
@Injectable()
export class LessonDataUserFacade extends AppService<LessonDataUser,LessonDataUserDto> {
    constructor(@InjectRepository(LessonDataUser) private readonly lessonDataUserRepository: Repository<LessonDataUser>,public http:HttpService) {
        super(http,lessonDataUserRepository, LessonDataUser,LessonDataUser,LessonDataUserDto, dto.lessonDataUserentityJson, dto.lessonDataUserdtoJson, dto.lessonDataUserentityToDtoJson, dto.lessonDataUserdtoToEntityJson);
        // super(lessonDataUserRepository, LessonDataUser, {}, {}, {}, {});
    }
}