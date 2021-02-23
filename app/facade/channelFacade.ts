import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelDto } from "../../submodules/platform-3.0-Dtos/channelDto";
import { Channel } from "../../submodules/platform-3.0-Entities/channel";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";
// import { ChannelDto } from "app/smartup_dtos/channelDto";
// import { Channel } from "app/smartup_entities/channel";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
import { ResponseModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel";
import { ServiceOperationResultType } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ServiceOperationResultType";
import { RequestModelQuery } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery";
let dto = require('../../submodules/platform-3.0-Mappings/channelMapper')

@Injectable()
export class ChannelFacade extends AppService<Channel, ChannelDto> {
    
    constructor(@InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,public http:HttpService) {
        super(http,channelRepository,Channel,Channel,ChannelDto,dto.channelentityJson, dto.channeldtoJson,dto.channelentityToDtoJson, dto.channeldtoToEntityJson);
        // super(channelRepository, Channel, {}, {}, {}, {});
        
    }


    async findAllPublishedLessonRelatedDetailsWithAllReviewsByChannelId(requestModel:RequestModelQuery,entityArrays?:Array<Array<string>>):Promise<any>{
        try { 
            console.log("Inside findAllPublishedLessonRelatedDetailsWithAllReviewsByChannelId baby......requestModel is...." + JSON.stringify(requestModel));
            let orderBy = 'ASC';
            let orderByField = 'Id';
            let isPublished:boolean = true;
            for(let i=0;i<requestModel.Filter.Conditions.length;i++){
                if(requestModel.Filter.Conditions[i].FieldName == "isPublished"){
                    isPublished = requestModel.Filter.Conditions[i].FieldValue;
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
      
            // queryField = await queryField.where("lessonDataReview.reviewStatus = :reviewStatus", { reviewStatus: isPublished })
            queryField = await this.divideQueryByPageSizeAndPageNo(requestModel,queryField);
            let result:any = await queryField.getMany();
            // result.section.forEach((section:any)=>{
            //     section.lesson.lessonData.forEach((lessonData:any)=>{
            //         lessonData.lessonDataReview.forEach((lessonDataReview:any)=>{
            //             if (lessonDataReview.reviewStatus == false){

            //             }
            //         })
            //     })
            // })
            let unpublishedLessonIds = [];
            let publishedLessonIds = [];
            
            for(let i=0;i<result.length;i++){
                // console.log("\n\n\n\n\n\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\n\n\n\n")
                let sample_channel = result[i]
                // console.log("sample_channel......",sample_channel);
                let flag = true;
                for(let j = 0;j<sample_channel.section.length;j++){
                    // console.log("\n\n\n\n\n\n************************************************\n\n\n\n\n")
                    let sample_section = sample_channel.section[j];
                    // console.log("sample_section......",sample_section);
                    for (let k = 0;k< sample_section.lesson.length;k++){
                        // console.log("\n\n\n\n\n\n........................................\n\n\n\n\n")
                        let sample_lesson = sample_section.lesson[k];
                        // console.log("sample_lesson......",sample_lesson);
                        for (let l = 0;l< sample_lesson.lessonData.length;l++){
                            // console.log("\n\n\n\n\n\n<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n\n\n\n\n")
                            let sample_lessonData = sample_lesson.lessonData[l];
                            // console.log("sample_lessonData......",sample_lessonData);
                            for (let m = 0;m<sample_lessonData.lessonDataReview.length;m++)
                            {
                                console.log("\n\n\n\n\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n\n\n\n\n")
                                let sample_lessonDataReview = sample_lessonData.lessonDataReview[m]
                                console.log("sample_lessonDataReview......",sample_lessonDataReview);
                                console.log(sample_lessonDataReview.reviewStatus)
                                if(sample_lessonDataReview.reviewStatus != true){
                                    console.log("False Condition......",i,sample_lessonDataReview);
                                    flag = false;
                                    break;
                                }
                                else{
                                    console.log("True Condition......",i,sample_lessonDataReview);
                                }
                            }
                            if(flag == false)
                                break
                        }
                        if(flag==false){
                            console.log("Now Deleting.....",sample_section.lesson,k)
                            // delete result[i];
                            unpublishedLessonIds.push(k)
                            delete sample_section.lesson
                            // console.log("Finally Evaluated False........",i)
            
                            }
                            else{
                                publishedLessonIds.push(k);
                                console.log("Finally Evaluated True........",i)
                            }
                    }
                    // if(flag == false)
                    // break
                }
                // if(flag==false){
                // // delete result[i];
                // unpublishedLessonIds.push(i)
                // console.log("Finally Evaluated False........",i)

                // }
                // else{
                //     publishedLessonIds.push(i);
                //     console.log("Finally Evaluated True........",i)
                // }
            }
            unpublishedLessonIds.forEach((id:number)=>{
                console.log("\n\nresult to be deleted.....",result,"\n\n\n\n");
                delete result.channel.section.lesson[id];
            })

            let final_result: ResponseModel<ChannelDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null)
            console.log("Setting result......")
            await final_result.setDataCollection(result);
            // console.log("Final_result is......" + JSON.stringify(final_result));
            
            // console.log("\n\n\n\n\nresult1 is....." + JSON.stringify(result));
            return final_result;
      
          }
          catch (err) {
            console.log("Error thrown from createQueryByRequestModelQuery....... Error is....."+JSON.stringify(err));
            throw err;
          }
    }
    
    
}