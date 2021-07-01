import { Injectable } from "@nestjs/common";
import CourseAppService from "app/appServices/courseAppService";
import { CourseDto } from "submodules/platform-3.0-Dtos/courseDto";
import { Course } from "submodules/platform-3.0-Entities/course";
import FacadeBase from "./facadeBase";

@Injectable()
export class CourseFacade extends FacadeBase<Course,CourseDto>{
    constructor(private courseAppService: CourseAppService){
       super(courseAppService);
    }
}