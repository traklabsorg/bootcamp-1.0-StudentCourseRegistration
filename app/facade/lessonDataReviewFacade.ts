import { HttpException, HttpService, Injectable } from "@nestjs/common";
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
import { RequestModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel";
import { Condition } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/condition";
import { LessonDataDto } from "submodules/platform-3.0-Dtos/lessonDataDto";
import { LessonDataFacade } from "./lessonDataFacade";
import { RequestModelQuery } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery";
import { UtilityFacade } from "./utilityFacade";
import { Label, NotificationType } from "submodules/platform-3.0-Dtos/notificationDto";
@Injectable()
export class LessonDataReviewFacade extends AppService<LessonDataReview,LessonDataReviewDto> {
    constructor(@InjectRepository(LessonDataReview) private readonly lessonDataReviewRepository: Repository<LessonDataReview>,public http:HttpService,private lessonDataFacade:LessonDataFacade,private utilityFacade:UtilityFacade) {
        super(http,lessonDataReviewRepository, LessonDataReview,LessonDataReview,LessonDataReviewDto, dto.lessonDataReviewentityJson, dto.lessonDataReviewdtoJson, dto.lessonDataReviewentityToDtoJson, dto.lessonDataReviewdtoToEntityJson);
        // super(lessonDataReviewRepository, LessonDataReview, {}, {}, {}, {});
    }
    async createOrUpdateLessonDataReview(body:RequestModel<LessonDataReviewDto>,isCreate?:boolean,isUpdate?:boolean): Promise<ResponseModel<LessonDataReviewDto>> {
        try {
            console.log("Inside CreateProduct of controller....body id" + JSON.stringify(body));
            body.DataCollection.map(async (lessonDataReview:LessonDataReviewDto)=>{
              if(lessonDataReview.reviewStatus != null && lessonDataReview.reviewStatus != undefined && lessonDataReview.reviewStatus != true){
                let requestModel = new RequestModelQuery();    
                let entityArray = [["lessonData","lesson"],["lesson","section"]];
                requestModel.Children = ["lessonData"]
                let condition = new Condition();
                condition.FieldName = "Id"
                condition.FieldValue = lessonDataReview.lessonDataId;
                requestModel.Filter.Conditions = [condition];
                let result :ResponseModel<LessonDataDto> = await this.lessonDataFacade.search(requestModel,true,entityArray);
                console.log("Result of join is....",result.getDataCollection()[0])
                let courseId = result.getDataCollection()[0].lesson.sectionId;
                let lessonId = result.getDataCollection()[0].lesson.Id;
                console.log("lessondataReview.reviewstatus is",lessonDataReview.reviewStatus);
                if(lessonDataReview.reviewStatus == false){
                let lessonNotificationData = {"lessonId":lessonId,"lessonTitle":result.getDataCollection()[0].lesson.title,"lessonLink":result.getDataCollection()[0].lesson.contentDetails!=(undefined || null)?result.getDataCollection()[0].lesson.contentDetails.coverImage.ImageSrc:"SampleCoverImage"}
                let courseNotificationData = {"courseId":courseId,"courseTitle":result.getDataCollection()[0].lesson.section.title,"courseLink":result.getDataCollection()[0].lesson.section.sectionDetails!=(undefined || null)?result.getDataCollection()[0].lesson.section.sectionDetails.coverimage:"SampleCoverImage"}
                this.createNotification(result.getDataCollection()[0].lesson.CreatedBy,Label.lessonRejected,NotificationType.email,lessonDataReview.CreationDate,lessonNotificationData);  
                this.createNotification(result.getDataCollection()[0].lesson.CreatedBy,Label.courseRejected,NotificationType.email,lessonDataReview.CreationDate,courseNotificationData);  
                  
                }
                
              }
            })
            let result : any;
            if(isCreate != false)
            result = await this.create(body);
            else 
            result = this.updateEntity(body);
            // this.sns_sqs.publishMessageToTopic("GROUP_ADDED",{success:body})  // remove from here later
            return result;
            // return null;
          } catch (error) {
            await console.log("Error is....." + error);
            throw error;
          }       
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