import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseDto } from "submodules/platform-3.0-Dtos/courseDto";
import { Course } from "submodules/platform-3.0-Entities/course";
import AppService from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppServiceBase";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/courseMapper')

@Injectable()
export default class CourseAppService extends AppService<Course,CourseDto>{
    constructor(@InjectRepository(Course) private readonly courseRepository: Repository<Course>,public http:HttpService) {
        super(http,courseRepository,Course,Course,CourseDto,dto.courseentityJson, dto.coursedtoJson,dto.courseentityToDtoJson, dto.coursedtoToEntityJson);
        // super(CourseRepository, Course, {}, {}, {}, {});
        
    }

    
} 