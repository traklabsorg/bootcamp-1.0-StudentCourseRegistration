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
import { Filter } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/filter";
import { ConditionalOperation } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/conditionOperation";
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
            
            // extracting userId from request model
            for(let i=0;i<requestModel.Filter.Conditions.length;i++){
                if(requestModel.Filter.Conditions[i].FieldName == "userId"){
                    userId = requestModel.Filter.Conditions[i].FieldValue;
                    requestModel.Filter.Conditions.splice(i,i)
                    break;
                }
            }
            
           
            // //code for fetching lesson details
            // let isCaseInsensitiveSearch = false;
            // if (requestModel != null && requestModel.Filter != null) {
            //   orderBy = !requestModel.Filter.IsOrderByFieldAsc ? 'DESC' : orderBy;
            //   orderByField = requestModel.Filter.OrderByField != null ? requestModel.Filter.OrderByField : orderByField;
      
            // }
            
            // let queryField = this.genericRepository.createQueryBuilder(entityArrays[0][0]);
      
            // if (entityArrays!= null) {
            //   entityArrays.forEach((entityArray:Array<string>)=>{
            //     queryField = queryField.leftJoinAndSelect(entityArray[0] + "." + entityArray[1], entityArray[1]);
            //   })
            // }
      
            // queryField = await queryField.where(":id =  any(lesson.collaborators)", { id: userId })
            // queryField = await this.divideQueryByPageSizeAndPageNo(requestModel,queryField);
            // let result:any = await queryField.getMany();

            // let final_result: ResponseModel<LessonDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null);
            // console.log("Setting result......");
            // await final_result.setDataCollection(result);
            // // console.log("Final_result is......" + JSON.stringify(final_result));
            
            // console.log("\n\n\n\n\nresult1 is....." + JSON.stringify(result));
            //return final_result;
      
          }
          catch (err) {
            console.log("Error thrown from createQueryByRequestModelQuery....... Error is....."+JSON.stringify(err));
            throw err;
          }
    }

    async getChannelAndSectionDetailsByLessonId(lessonIds: number[],pageSize: number,pageNumber: number): Promise<ResponseModel<LessonDto>>{
      console.log("about to fetch channel and section details ")
      let requestModelQuery = new RequestModelQuery();
      let entityArray = [["lesson","section"],["section","channel"]];
      let filter = new Filter();
      let conditions: Condition[] = [];
      lessonIds.map((lessonId:number)=>{
        let condition = new Condition();
        condition.FieldName = 'Id';
        condition.FieldValue = lessonId;
        conditions.push(condition);
      })
      filter.Conditions = conditions;
      requestModelQuery.Filter = filter;
      requestModelQuery.Filter.PageInfo.PageSize = pageSize;
      requestModelQuery.Filter.PageInfo.PageNumber = pageNumber;
      requestModelQuery.Children = ["lesson"];
      let data = await this.search(requestModelQuery,true,entityArray);
      console.log("fetched data channel and section details............. ")
      //console.log(JSON.stringify(data.getDataCollection()));
      return data;   
    }


    async findMaxId():Promise<Lesson>{
      const max_lesson_database_id = this.genericRepository.findOne({select: ['Id'], order: {Id: "DESC"} });
      return max_lesson_database_id;
    }

    async getPublishedLessonCount(communityId: number,channelId: number){
      let sectionIds = await this.genericRepository.query(`Select sections.id from
                                                                 public."sections" sections
                                                                 where sections.channel_id in
                                                                 (Select channels.id from public."channels" channels where 
                                                                         channels.community_id = ${communityId} and 
                                                                         channels.id = ${channelId})`)
      console.log(sectionIds);
      let lessonRequestModel: RequestModelQuery = new RequestModelQuery();
      lessonRequestModel.Children = ['lesson'];
      lessonRequestModel.Filter.Conditions = [];
      sectionIds.map((sectionId:any)=>{
        let condition:Condition = new Condition();
           condition.FieldName = 'sectionId';
           condition.FieldValue = sectionId.id;
           condition.ConditionalSymbol = ConditionalOperation.Or;
           lessonRequestModel.Filter.Conditions.push(condition);
        
      })
     

      let custom_section_children_array = [['lesson','lessonData'],['lessonData','lessonDataUser'],['lessonData','lessonDataReview']];
      let publishedLessonResult = await this.search(lessonRequestModel,true,custom_section_children_array);
      let final_publishedLessonResult = await this.assignIsPublishedFieldsToLesson(publishedLessonResult,false);
      console.log("Result is.....",final_publishedLessonResult[0]);
      final_publishedLessonResult.filter((lesson=>lesson.isPublished == true));
      return final_publishedLessonResult.length;                                                                 
    } 




    async assignIsPublishedFieldsToLesson(result:any,findUserDeatils?:boolean):Promise<any>{
      let publishedLessonCreatorIds = [];
      console.log("\n\n\n\n\n\n\n\n\n\n\n\nBefore assignIsPublishedFieldsToLesson....result is...",result,"\n\n\n\n\n\n\n\n\n\n\n\n\n")    
      
          // for(let j = 0;j<result.DataCollection.length;j++){
          //     let sample_section = result.DataCollection[j];
          //     // console.log("Sample Section is......",sample_section)
          //     console.log("section........")
          //     let isSectionPublishedFlag = true;
              for (let k = 0;k< result.DataCollection.length;k++){
                  let sample_lesson = result.DataCollection[k];
                  let flag = true;
                  console.log("lesson........")
                  for (let l = 0;l< sample_lesson.lessonData.length;l++){
                      let sample_lessonData = sample_lesson.lessonData[l];
                      
                      let sample_lessonDataReview = (sample_lessonData.lessonDataReview.length)?sample_lessonData.lessonDataReview[0]:null;
                      console.log("lessonData........")
                      console.log(sample_lessonData.lessonDataReview.length)
                      for(let m = 1;m < sample_lessonData.lessonDataReview.length;m++){
                          console.log("choosing recent........")
                          if((new Date(sample_lessonData.lessonDataReview[m].CreationDate)).getTime() > (new Date(sample_lessonDataReview.CreationDate)).getTime())
                                sample_lessonDataReview = sample_lessonData.lessonDataReview[m];
                          
                                
                      }
                      // for (let m = 0;m<sample_lessonData.lessonDataReview.length;m++)
                      // {
                      //     let sample_lessonDataReview = sample_lessonData.lessonDataReview[m]

                      //     if(sample_lessonDataReview.reviewStatus != true){
                      //         flag = false;
                      //         break;
                      //     }
                      // }
                      if (sample_lessonData.lessonDataReview.length == 0){ // flag indicates whether theres any lessonData review or not
                          flag = false;
                          break;
                      }
                      if(sample_lessonDataReview.reviewStatus != true){
                                   flag = false;
                                   break;
                               }
                     
                      
                  }
                  if(flag==false){
                      //isSectionPublishedFlag = false
                      // delete sample_section.lesson[k]
                      // delete result[i].section[j].lesson[k]
                      sample_lesson.isPublished = false;
                      }
                  else{
                          //publishedLessonCreatorIds.push(sample_section.lesson[k].CreatedBy);
                          sample_lesson.isPublished = true;
                      }
              }
              // if(isSectionPublishedFlag==true){
              //     publishedLessonCreatorIds.push(sample_section.CreatedBy);
              //     sample_section.isPublished = true;
              // }
              // else{
              //     sample_section.isPublished = false;
              // }
           return result;   
          }

    // const results = await getRepository(Members)
    // .createQueryBuilder("member") // you shall assign an alias
    // .where(":id = ANY(member.skill_id_array)", { id: 1 }) // and use that alias everywhere in your query builder
    // .getMany();
}