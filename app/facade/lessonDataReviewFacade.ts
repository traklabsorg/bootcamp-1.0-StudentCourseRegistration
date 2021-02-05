import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonDataReviewDto } from "../../submodules/platform-3.0-Dtos/lessonDataReviewDto";
import { LessonDataReview } from "../../submodules/platform-3.0-Entities/lessonDataReview";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";
// import { LessonDataReviewDto } from "app/smartup_dtos/lessonDataReviewDto";
// import { LessonDataReview } from "app/smartup_entities/lessonDataReview";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
// let dto = require('../../submodules/platform-3.0-Mappings/lessonDataReviewDto"')
// let dto = require('../../submodules/platform-3.0-Mappings/lessonDataReviewMapper')
let dto = require('../../submodules/platform-3.0-Mappings/lessonDataReviewMapper')
import { ResponseModel } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel';
@Injectable()
export class LessonDataReviewFacade extends AppService<LessonDataReview,LessonDataReviewDto> {
    constructor(@InjectRepository(LessonDataReview) private readonly lessonDataReviewRepository: Repository<LessonDataReview>,public http:HttpService) {
        super(http,lessonDataReviewRepository, LessonDataReview,LessonDataReview,LessonDataReviewDto, dto.lessonDataReviewentityJson, dto.lessonDataReviewdtoJson, dto.lessonDataReviewentityToDtoJson, dto.lessonDataReviewdtoToEntityJson);
        // super(lessonDataReviewRepository, LessonDataReview, {}, {}, {}, {});
    }

    async checkLessonReviewStatus(lessonIds:number[]):Promise<ResponseModel<any>>{
        try{
        // console.log("\n\n\n\n\Inside checkLessonReviewStatus.......lessonIds are....",lessonIds);
        let result = await this.getChildrenIds(["lessonDataReview","lessonData","lesson"],lessonIds)
        console.log("\n\n\n\nResult inside checkLessonReviewStatus is......"+JSON.stringify(result)+"\n\n\n\n\n");
        let lesson_array = [];
        let lesson_data_array = [];
        // interface MYJSON{
        //     lesson
        // }
        let myJSON = {}
        let myJSON1 = {}
        // result.getDataCollection().forEach((entity:any)=>{
        //     let lessonSample = entity.lessonData.lesson;
        //     let lessonDataSample = entity.lessonData;
        //     delete lessonDataSample.lesson 
        //     let lessonDataReviewSample = entity 
        //     delete lessonDataReviewSample.lessonData 
        //     console.log("<<<<< LessonSample is.....>>>",lessonSample);
        //     console.log("<<<<< lessonDataSample is.....>>>",lessonDataSample);
        //     console.log("<<<<< lessonDataReviewSample is.....>>>",lessonDataReviewSample)
        //     if (!myJSON[lessonDataSample])
        //     myJSON[lessonDataSample] = [];
        //     myJSON[lessonDataSample].push(lessonDataReviewSample);
        //     console.log("myJSON...",JSON.stringify(myJSON))
            

        // })
        // console.log("Final MYJSON created is...."+JSON.stringify(myJSON));
        // result.getDataCollection().forEach((entity:any)=>{
        //     let lessonSample = entity.lessonData.lesson;
        //     let lessonDataSample = entity.lessonData;
        //     delete lessonDataSample.lesson 
        //     let lessonDataReviewSample = entity 
        //     delete lessonDataReviewSample.lessonData 
        //     console.log("<<<<< LessonSample 2nd Time is.....>>>",lessonSample);
        //     console.log("<<<<< lessonDataSample 2nd Time is.....>>>",lessonDataSample);
        //     console.log("<<<<< lessonDataReviewSample 2nd Time is.....>>>",lessonDataReviewSample)
        //     if (!myJSON1[lessonSample]){
        //     myJSON1[lessonSample] = [];
        //     myJSON1[lessonSample].append(myJSON[lessonDataSample])
        //     lesson_array.push(myJSON1);
        //     }
            
            

        // })
        // result.setDataCollection(re)
        return result;
        }
        catch(error){
            console.log("Inside checkLessonReviewStatus , error is....."+JSON.stringify(error));
        }
    }
}