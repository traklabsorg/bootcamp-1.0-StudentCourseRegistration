import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SectionDto } from "../../submodules/platform-3.0-Dtos/sectionDto";
import { Section } from "../../submodules/platform-3.0-Entities/section";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";
// import { SectionDto } from "app/smartup_dtos/sectionDto";
// import { Section } from "app/smartup_entities/section";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
import { RequestModelQuery } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery";
import { Filter } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/filter";
import { Condition } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/condition";
import { ResponseModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel";
import { SectionReview } from "submodules/platform-3.0-Entities/sectionReview";
import { SectionReviewDto } from "submodules/platform-3.0-Dtos/sectionReviewDto";
import { ConditionalOperation } from "submodules/platform-3.0-Dtos/submodules/platform-3.0-Common/common/conditionOperation";
// let dto = require('../../submodules/platform-3.0-Mappings/sectionDto"')
let dto = require('../../submodules/platform-3.0-Mappings/sectionMapper')
@Injectable()
export class SectionFacade extends AppService<Section,SectionDto> {
    constructor(@InjectRepository(Section) private readonly sectionRepository: Repository<Section>,public http:HttpService) {
        super(http,sectionRepository, Section,Section,SectionDto, dto.sectionentityJson, dto.sectiondtoJson, dto.sectionentityToDtoJson, dto.sectiondtoToEntityJson);
        // super(sectionRepository, Section, {}, {}, {}, {});
    }
    
    async getPublishedSectionCount(communityId: number,channelIds: string){
        let finalResult = [];
        let channelIdsGiven = channelIds.split(',').map(id=>parseInt(id));
        await Promise.all(channelIdsGiven.map(async (channelId:number)=>{
          let sectionIds = await this.genericRepository.query(`Select sections.id from public."sections" sections
                                                                where 
                                                                sections.channel_id in (${channelId})
                                                                and 
                                                                sections.section_type = 'course'
                                                             `)
        let sectionRequestModel: RequestModelQuery = new RequestModelQuery();
        sectionRequestModel.Children = ['section','sectionReview'];
        sectionRequestModel.Filter.Conditions = [];
        sectionIds.map((sectionId:any)=>{
            let condition:Condition = new Condition();
            condition.FieldName = 'Id';
            condition.FieldValue = sectionId.id;
            condition.ConditionalSymbol = ConditionalOperation.Or;
            sectionRequestModel.Filter.Conditions.push(condition);
        })
        
        let extractedSections: ResponseModel<SectionDto> = await this.search(sectionRequestModel)
        console.log("Extraction complete....")
        //console.log(extractedSections.getDataCollection()[0])
        let processedSections : SectionDto[] = this.assignIsPublishedFieldsToSection(extractedSections); 
        console.log("Processing complete....",processedSections.length)
        //console.log(processedSections[0])
        let filteredSections : SectionDto[] =  processedSections.filter((section:SectionDto)=>section.isPublished == true)
        console.log("Filtration complete....",filteredSections.length)
        let publishedSectionCount = {
            "channelId" : channelId,   
            "publishedCourseCount": filteredSections.length 
            }  
        
        finalResult.push(publishedSectionCount);
         
  
          }))
  
        
                                                                         
      
      return finalResult;
    } 


      assignIsPublishedFieldsToSection(result: ResponseModel<SectionDto>):SectionDto[]{
        
        console.log("\n\n\n\n\n\n\n\n\n\n\n\nBefore assignIsPublishedFieldsToSection....result is...",result,"\n\n\n\n\n\n\n\n\n\n\n\n\n")    
        let sections: SectionDto[] = result.getDataCollection();
        sections.map((section: SectionDto)=>{
            let sectionReviews: SectionReviewDto[] = section.sectionReview;
            let latestSectionReview: SectionReviewDto = (sectionReviews.length)?sectionReviews[0]:null;
            sectionReviews.map((sectionReview: SectionReviewDto)=>{
                if(new Date(sectionReview.CreationDate).getTime() > new Date(latestSectionReview.CreationDate).getTime())
                     latestSectionReview = sectionReview;
            })
            if(latestSectionReview.reviewStatus)
              section.isPublished = true;
        }) 
        
                
     return sections;   
    }  

    async getChannelIdsBySectionIds(sectionIds : number[],pageSize: number,pageNumber: number): Promise<SectionDto[]>{
        let requestModelQuery : RequestModelQuery = new RequestModelQuery();
        let entityArray = [["section","channel"]];
        let filter = new Filter();
        console.log("SectionIds are-------",sectionIds)
        sectionIds.map((sectionId: number)=>{
            let condition = new Condition();
            condition.FieldName = 'Id';
            condition.FieldValue = sectionId;
            filter.Conditions.push(condition);
        })
        requestModelQuery.Children = ["section"];
        requestModelQuery.Filter = filter;
        requestModelQuery.Filter.PageInfo.PageSize = pageSize;
        requestModelQuery.Filter.PageInfo.PageNumber = pageNumber;
        let result = (await this.search(requestModelQuery,true,entityArray)).getDataCollection();
        
        //console.log(JSON.stringify(result));
    //   console.log("Channelids are .......",channelIds);
      return result;
    }
}