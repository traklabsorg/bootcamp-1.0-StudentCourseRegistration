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
import { GROUP_MICROSERVICE_URI } from "config";
import { map } from "rxjs/operators";
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
            let publishedLessonCreatorIds = [];
            
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
                            console.log("ahdwchuehwdehudehudwhuehuehuweehuw")
                            console.log("Now Deleting.....",k,sample_section.lesson[k])
                            // delete result[i];
                            unpublishedLessonIds.push(k)
                            delete sample_section.lesson[k]
                            // console.log("Finally Evaluated False........",i)
            
                            }
                            else{
                                console.log("\n\n\n\nPushing to published Lesson ids .......",sample_section.lesson[k],"\n\n\n\n\n\n")
                                publishedLessonCreatorIds.push(sample_section.lesson[k].CreatedBy);
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
                //     publishedLessonCreatorIds.push(i);
                //     console.log("Finally Evaluated True........",i)
                // }
            }
            // unpublishedLessonIds.forEach((id:number)=>{
            //     console.log("\n\nresult to be deleted.....",result,"\n\n\n\n");
            //     delete result.channel.section.lesson[id];
            // })

            let final_result: ResponseModel<ChannelDto> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null)
            console.log("Setting result......")
            await final_result.setDataCollection(result);
            // console.log("Final_result is......" + JSON.stringify(final_result));
            
            // console.log("\n\n\n\n\nresult1 is....." + JSON.stringify(result));
            console.log("\n\n\n\nPublished lessonIds Created by are..............",publishedLessonCreatorIds,"\n\n\n\\n");
            var publishedUniqueLessonCreatorIds = publishedLessonCreatorIds.filter((v, i, a) => a.indexOf(v) === i);
            console.log("\n\n\n\nPublished lessonIds Created by are..............",publishedUniqueLessonCreatorIds,"\n\n\n\\n");
            return final_result;
      
          }
          catch (err) {
            console.log("Error thrown from createQueryByRequestModelQuery....... Error is....."+JSON.stringify(err));
            throw err;
          }
    }


      getUserWithDetails(communityUrl: string): any{
    
const headersRequest = {
      'Content-Type': 'application/json',
      'Authorization': `Basic `+communityUrl,
  };
  let requestModel:RequestModelQuery;
  requestModel.Children = []
    console.log("Inside Tenant Id......uri is....." + GROUP_MICROSERVICE_URI + "/user/1000/1");
    return this.http.get(GROUP_MICROSERVICE_URI + "/user/1000/1",{ headers: headersRequest })
      .pipe(
        map(response => {
          response.data
        })
      )
   
}
  
    
    
}