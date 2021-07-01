import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentDto } from "submodules/platform-3.0-Dtos/studentDto";
import { Student } from "submodules/platform-3.0-Entities/student";
import AppService from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppServiceBase";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/studentMapper')

@Injectable()
export default class StudentAppService extends AppService<Student,StudentDto>{
    constructor(@InjectRepository(Student) private readonly studentRepository: Repository<Student>,public http:HttpService) {
        super(http,studentRepository,Student,Student,StudentDto,dto.studententityJson, dto.studentdtoJson,dto.studententityToDtoJson, dto.studentdtoToEntityJson);
        // super(studentRepository, student, {}, {}, {}, {});
        
    }

    
} 