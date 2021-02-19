import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonDto } from "../../submodules/platform-3.0-Dtos/lessonDto";
import { Lesson } from "../../submodules/platform-3.0-Entities/lesson";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";
// import { LessonDto } from "app/smartup_dtos/lessonDto";
// import { Lesson } from "app/smartup_entities/lesson";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
import { RequestModelQuery } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery";
import { ResponseModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel";
import { ServiceOperationResultType } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ServiceOperationResultType";
import { Condition } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/condition";
// let dto = require('../../submodules/platform-3.0-Mappings/lessonDto"')
let dto = require('../../submodules/platform-3.0-Mappings/lessonMapper')
@Injectable()
export class LessonFacade extends AppService<Lesson,LessonDto> {
    constructor(@InjectRepository(Lesson) private readonly lessonRepository: Repository<Lesson>,public http:HttpService) {
        super(http,lessonRepository, Lesson,Lesson,LessonDto, dto.lessonentityJson, dto.lessondtoJson, dto.lessonentityToDtoJson, dto.lessondtoToEntityJson);
        // super(lessonRepository, Lesson, {}, {}, {}, {});
    }

    async findAllLessonRelatedDetailsWithAllReviewsByUserId(requestModel:RequestModelQuery,entityArrays?:Array<Array<string>>):Promise<any>{
        try { 
            console.log("Inside findAllLessonRelatedDetailsWithAllReviewsByUserId baby......requestModel is...." + JSON.stringify(requestModel));
            let orderBy = 'ASC';
            let orderByField = 'Id';
            let userId:number = null;
            for(let i=0;i<requestModel.Filter.Conditions.length;i++){
                if(requestModel.Filter.Conditions[i].FieldName == "userId"){
                    userId = requestModel.Filter.Conditions[i].FieldValue;
                    requestModel.Filter.Conditions.splice(i,i)
                    break;
                }
            }
            let isCaseInsensitiveSearch = false;
            if (requestModel != null && requestModel.Filter != null) {
              orderBy = !requestModel.Filter.IsOrderByFieldAsc ? 'DESC' : orderBy;
              orderByField = requestModel.Filter.OrderByField != null ? requestModel.Filter.OrderByField : orderByField;
      
            }
            
            let queryField = this.genericRepository.createQueryBuilder(entityArrays[0][0]);
      
            if (entityArrays!= null) {
              entityArrays.forEach((entityArray:Array<string>)=>{
                queryField = queryField.innerJoinAndSelect(entityArray[0] + "." + entityArray[1], entityArray[1]);
              })
            }
      
            queryField = await queryField.where(":id = ANY("
            +entityArrays[0][0]+".collaborators)", { id: userId })
            queryField = await this.divideQueryByPageSizeAndPageNo(requestModel,queryField);
            let result:any = await queryField.getMany();

            let final_result: ResponseModel<LessonDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null)
            console.log("Setting result......")
            await final_result.setDataCollection(result);
            console.log("Final_result is......" + JSON.stringify(final_result));
            
            console.log("\n\n\n\n\nresult1 is....." + JSON.stringify(result));
            return final_result;
      
          }
          catch (err) {
            console.log("Error thrown from createQueryByRequestModelQuery....... Error is....."+JSON.stringify(err));
            throw err;
          }
    }

    async findMaxId():Promise<Lesson>{
      const max_lesson_database_id = this.genericRepository.findOne({select: ['Id'], order: {Id: "DESC"} });
      return max_lesson_database_id;
    }


    // const results = await getRepository(Members)
    // .createQueryBuilder("member") // you shall assign an alias
    // .where(":id = ANY(member.skill_id_array)", { id: 1 }) // and use that alias everywhere in your query builder
    // .getMany();
}