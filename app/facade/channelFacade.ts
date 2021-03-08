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
import { UtilityFacade } from './utilityFacade';
import { UserDetails } from '../../submodules/platform-3.0-Dtos/userDto';
let dto = require('../../submodules/platform-3.0-Mappings/channelMapper')

@Injectable()
export class ChannelFacade extends AppService<Channel, ChannelDto> {
    
    constructor(@InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,public http:HttpService,private utilityFacade:UtilityFacade) {
        super(http,channelRepository,Channel,Channel,ChannelDto,dto.channelentityJson, dto.channeldtoJson,dto.channelentityToDtoJson, dto.channeldtoToEntityJson);
        // super(channelRepository, Channel, {}, {}, {}, {});
        
    }


    async findAllPublishedLessonRelatedDetailsWithAllReviewsByChannelId(requestModel:RequestModelQuery,entityArrays?:Array<Array<string>>):Promise<ResponseModel<any>>{
        try { 
            console.log("Inside findAllPublishedLessonRelatedDetailsWithAllReviewsByChannelId baby......requestModel is...." + JSON.stringify(requestModel));
            let orderBy = 'ASC';
            let orderByField = 'Id';
            let isPublished:boolean = true;
            for(let i=0;i<requestModel.Filter.Conditions.length;i++){
                if(requestModel.Filter.Conditions[i].FieldName == "isPublished"){
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>> i is ......",requestModel.Filter.Conditions[i]);
                    isPublished = requestModel.Filter.Conditions[i].FieldValue;
                    // delete requestModel.Filter.Conditions[i];
                    requestModel.Filter.Conditions.splice(i,1);
                    break;
                }
            }

            console.log("Final RequestModel is.....",JSON.stringify(requestModel));
            let isCaseInsensitiveSearch = false;
            if (requestModel != null && requestModel.Filter != null) {
              orderBy = !requestModel.Filter.IsOrderByFieldAsc ? 'DESC' : orderBy;
              orderByField = requestModel.Filter.OrderByField != null ? requestModel.Filter.OrderByField : orderByField;
      
            }
            
            let queryField = this.genericRepository.createQueryBuilder(entityArrays[0][0]);
            if(requestModel.Children.indexOf(entityArrays[0][0]) <= -1){
              requestModel.Children.unshift(entityArrays[0][0])
            }
      
            if (entityArrays!= null) {
              entityArrays.forEach((entityArray:Array<string>)=>{
                queryField = queryField.leftJoinAndSelect(entityArray[0] + "." + entityArray[1], entityArray[1]);
              })
            }

            
            queryField = await this.assignConditionsToRequestModelQuery(requestModel,queryField);
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
            let publishedLessonCreatorIds = [];
            
            for(let i=0;i<result.length;i++){
                let sample_channel = result[i]
                // setTimeout(function(){
                for(let j = 0;j<sample_channel.section.length;j++){
                    let sample_section = sample_channel.section[j];
                    let isSectionPublishedFlag = true;
                    for (let k = 0;k< sample_section.lesson.length;k++){
                        let sample_lesson = sample_section.lesson[k];
                        let flag = true;
                        for (let l = 0;l< sample_lesson.lessonData.length;l++){
                            let sample_lessonData = sample_lesson.lessonData[l];
                            for (let m = 0;m<sample_lessonData.lessonDataReview.length;m++)
                            {
                                let sample_lessonDataReview = sample_lessonData.lessonDataReview[m]
                                if(sample_lessonDataReview.reviewStatus != true){
                                    flag = false;
                                    break;
                                }
                            }
                            if(flag == false)
                                break
                        }
                        if(flag==false){
                          isSectionPublishedFlag = false
                            // delete sample_section.lesson[k]
                            delete result[i].section[j].lesson[k]
                            }
                            else{
                                publishedLessonCreatorIds.push(sample_section.lesson[k].CreatedBy);
                                sample_section.lesson[k].isPublished = true;
                            }
                    }
                    if(isSectionPublishedFlag==true){
                      publishedLessonCreatorIds.push(sample_section.CreatedBy);
                      sample_section.isPublished = true;
                    }
                    else{
                      sample_section.isPublished = false;
                    }
                  
                }
              // })
            }
            // unpublishedLessonIds.forEach((id:number)=>{
            //     console.log("\n\nresult to be deleted.....",result,"\n\n\n\n");
            //     delete result.channel.section.lesson[id];
            // })

            var publishedUniqueLessonCreatorIds = publishedLessonCreatorIds.filter((v, i, a) => a.indexOf(v) === i);
            console.log("\n\n\n\nUnique Published lessonIds Created by are..............",publishedUniqueLessonCreatorIds,"\n\n\n\n");
            let userDetails = await this.utilityFacade.getUserDetails(publishedUniqueLessonCreatorIds);
            // console.log("userdetails are....",userDetails.DataCollection);
            console.log("Finally Fetched from group......",userDetails.DataCollection);
            result.push(userDetails.DataCollection);
            console.log("\n\n\n\n\n\nAt the end...result is...",result,'\n\n\n\n\n\n\n\n\n');
            let final_result: ResponseModel<any> = new ResponseModel("SampleInbuiltRequestGuid", null, ServiceOperationResultType.success, "200", null, null, null, null, null)
            console.log("Setting result......")
            final_result.setDataCollection(result);
            // console.log("Final_result is......" + JSON.stringify(final_result));
            
            // console.log("\n\n\n\n\nresult1 is....." + JSON.stringify(result));
            // console.log("\n\n\n\nPublished lessonIds Created by are..............",final_result,"\n\n\n\\n");
            

            return final_result;
      
          }
          catch (err) {
            console.log("Error thrown from findAllPublishedLessonRelatedDetailsWithAllReviewsByChannelId....... Error is....."+JSON.stringify(err));
            throw err;
          }
    }


  
    
    
}