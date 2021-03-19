import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CommunityDto } from "../../submodules/platform-3.0-Dtos/communityDto";
import { Community } from "submodules/platform-3.0-Entities/communities";
import { RequestModel } from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel";
import { Repository } from "typeorm";
import { application } from "express";
import { json } from "body-parser";
import { RequestModelQuery } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery";
import { ResponseModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel";
import { GROUP_MICROSERVICE_URI } from "config";
import { map } from "rxjs/operators";
import { Filter } from "submodules/platform-3.0-Dtos/submodules/platform-3.0-Common/common/filter";
import { Condition } from "submodules/platform-3.0-Dtos/submodules/platform-3.0-Common/common/condition";
import { ConditionalOperation } from "submodules/platform-3.0-Dtos/submodules/platform-3.0-Common/common/conditionOperation";
import { UserDto } from '../../submodules/platform-3.0-Dtos/userDto';
let dto = require("../../submodules/platform-3.0-Mappings/communityMapper");

@Injectable()
export class UtilityFacade {
  
  constructor(public http: HttpService) {

  }

   onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

    async getUserDetails(userIds:number[]): Promise<any>{

        if(userIds.length==0 || userIds == [null]){
            let responseModel : ResponseModel<UserDto> = new ResponseModel(null,[],null,"200","No User Results to Be returned",null,null,null,null);

        }
    
  let requestModel = new RequestModelQuery();
  let i = 0;
  let filter = new Filter();
  filter.Conditions = [];
  userIds.forEach((id:number)=>{
    let condition = new Condition();
    condition.FieldName = "Id";
    condition.FieldValue = id;
    condition.ConditionalSymbol = ConditionalOperation.Or;
    filter.Conditions.push(condition);
  })
  requestModel.Filter = filter;


//   console.log("\n\n\n\nRequestModel Finally generated is.....",JSON.stringify(requestModel),"\n\n\n\n")
  const headersRequest = {
    'requestmodel':JSON.stringify(requestModel)
};
    console.log("Getting UserDetails from GroupMicroservice Uri......uri is....." + GROUP_MICROSERVICE_URI + "/user/1000/1");
    let httpResponse =  await this.http.get(GROUP_MICROSERVICE_URI+"/user/1000/1",{ headers: headersRequest }).toPromise();
      return httpResponse.data;
   
}

    async assignIsPublishedFieldsToSectionAndLesson(result:any,findUserDeatils?:boolean):Promise<any>{
        let publishedLessonCreatorIds = [];
        console.log("\n\n\n\n\n\n\n\n\n\n\n\nBefore assignIsPublishedFieldsToSectionAndLesson....result is...",result,"\n\n\n\n\n\n\n\n\n\n\n\n\n")    
        
            for(let j = 0;j<result.DataCollection.length;j++){
                let sample_section = result.DataCollection[j];
                // console.log("Sample Section is......",sample_section)
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
                        if (sample_lessonData.lessonDataReview.length == 0){
                            flag = false;
                            break;
                        }
                        if(flag == false)
                            break
                    }
                    if(flag==false){
                        isSectionPublishedFlag = false
                        // delete sample_section.lesson[k]
                        // delete result[i].section[j].lesson[k]
                        sample_section.lesson[k].isPublished = false;
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
         publishedLessonCreatorIds = publishedLessonCreatorIds.filter(this.onlyUnique);
        console.log("Published lesson Creator ids are.....",publishedLessonCreatorIds)
        // let requestModel : RequestModelQuery = new RequestModelQuery();
        // requestModel.Children = [];
        // requestModel.Filter.Conditions = [];
        // publishedLessonCreatorIds.forEach((id:number)=>{
        //     let condition:Condition = new Condition();
        //     condition.FieldName = "Id";
        //     condition.FieldValue = id;
        //     condition.ConditionalSymbol = ConditionalOperation.Or;
        //     requestModel.Filter.Conditions.push(condition);
        // })
        
        console.log("Result getting returned is.....",result);
        if(findUserDeatils == true){
            let userDetails = await this.getUserDetails(publishedLessonCreatorIds);
            if(publishedLessonCreatorIds.length == 0 || publishedLessonCreatorIds == [null])
            userDetails.DataCollection = null;
            console.log("Userdetails......",userDetails);
            // console.log("result is.......",result);

            // let myJSON = {};
            // myJSON["userDetails"] = userDetails.DataCollection
            // result.DataCollection.push(myJSON);
            if(userDetails.DataCollection != null)
            result.DataCollection.push(userDetails.DataCollection);
            console.log("Final TResult to be returned is....",result);
            return result
        }
        
        return result;
    }



    
  
}