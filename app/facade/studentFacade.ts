import { Injectable } from "@nestjs/common";
import StudentAppService from "app/appServices/studentAppService";
import { StudentDto } from "submodules/platform-3.0-Dtos/studentDto";
import { Student } from "submodules/platform-3.0-Entities/student";
import FacadeBase from "./facadeBase";

@Injectable()
export class StudentFacade extends FacadeBase<Student,StudentDto>{
    constructor(private studentAppService: StudentAppService){
       super(studentAppService);
    }
}